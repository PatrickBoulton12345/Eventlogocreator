/**
 * LFG Event Cards → Google Drive (weekly, automatic)
 *
 * Reads the LFG Luma calendar iCal feed, and for every UPCOMING event builds
 * the event card + Instagram caption on eventlogocreator.vercel.app, then
 * saves them into your chosen Google Drive folder (DEST_FOLDER_ID below):
 *
 *   <your folder> / <YYYY-MM-DD> <chapter> / <card>.jpg
 *                                           / <card>.txt   (caption)
 *
 * It skips events it has already saved, so it's safe to run repeatedly, and
 * on each run it also removes folders for events that have already passed —
 * so the folder only ever shows what's still upcoming.
 *
 * ---- ONE-TIME SETUP ----
 *  1. drive.google.com → New → More → Google Apps Script (or script.google.com).
 *  2. Delete anything in the editor, paste this whole file in, click save (💾).
 *  3. In the function dropdown choose "setup", press Run, and approve the
 *     permissions Google asks for (read the calendar feed, write to Drive).
 *     If you see "Google hasn't verified this app", click Advanced → Go to project.
 *  4. Done. It now runs every Sunday at ~06:00. To run it by hand any time,
 *     press Run on the "generateDriveCards" function.
 */

var ICS_URL =
  "https://api.luma.com/ics/get?entity=calendar&id=cal-RrzxAKUyNdOjqXi";
var SITE = "https://eventlogocreator.vercel.app";
// The Drive folder the cards + captions are saved into (from its URL:
// drive.google.com/drive/folders/<THIS ID>). A dated subfolder is made per event.
var DEST_FOLDER_ID = "1c-sHjsO9-Ha-faderCgamAvUncdKATKe";

/** Run once to authorise and switch on the weekly run. */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "generateDriveCards") {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("generateDriveCards")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(6)
    .create();
  generateDriveCards();
}

/** The main job: iCal → cards + captions → Drive. */
function generateDriveCards() {
  var ics = UrlFetchApp.fetch(ICS_URL, { muteHttpExceptions: true }).getContentText();
  var events = parseIcs(ics);

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var upcoming = events.filter(function (ev) {
    return ev.start && ev.url && ev.start >= today;
  });

  // Safety: if the feed came back empty (network/parse hiccup), do nothing —
  // never let a bad fetch trigger the cleanup and wipe the folder.
  if (upcoming.length === 0) {
    Logger.log("No upcoming events parsed — skipping (no changes, no cleanup).");
    return;
  }

  var parent = DriveApp.getFolderById(DEST_FOLDER_ID);
  var made = 0;
  var errors = [];
  var keep = {}; // folder names for still-upcoming events → kept

  upcoming.forEach(function (ev) {
    try {
      var result = createCardFor(ev, parent);
      keep[result.folder] = true;
      if (result.created) made++;
    } catch (err) {
      errors.push(ev.url + " — " + err.message);
    }
  });

  var removed = pruneOldFolders(parent, keep);

  Logger.log("Cards saved this run: " + made + ", old folders removed: " + removed);
  if (errors.length) Logger.log("Problems:\n" + errors.join("\n"));
}

// Moves to Trash any of our event folders (named "DD.MM ...") that aren't in
// the keep set — i.e. events that have already passed. Only touches folders
// matching our own naming, so anything else in the folder is left alone.
function pruneOldFolders(parent, keep) {
  var removed = 0;
  var folders = parent.getFolders();
  while (folders.hasNext()) {
    var f = folders.next();
    var name = f.getName();
    if (/^\d{2}\.\d{2}(\s|$)/.test(name) && !keep[name]) {
      f.setTrashed(true);
      removed++;
    }
  }
  return removed;
}

/** Fetches one card + caption from the site and saves them to Drive. */
function createCardFor(ev, parent) {
  var date = ddmm(ev.start);

  var card = UrlFetchApp.fetch(SITE + "/api/card?luma=" + encodeURIComponent(ev.url), {
    muteHttpExceptions: true,
    followRedirects: true,
  });
  if (card.getResponseCode() !== 200) {
    throw new Error("card HTTP " + card.getResponseCode());
  }

  var headers = card.getHeaders();
  // Vercel serves over HTTP/2, which lower-cases header names, so look the
  // chapter up case-insensitively (otherwise every event on a date would
  // share one folder and siblings would be skipped).
  var chapter = decode(getHeaderCI(headers, "X-Event-Chapter")).replace(/^LFG\s+/i, "");
  var folderName = chapter ? date + " " + chapter : date;
  var folder = getOrCreateSubfolder(parent, folderName);

  // Already done? Keep the folder but don't re-download.
  if (folder.getFilesByType(MimeType.JPEG).hasNext()) {
    return { folder: folderName, created: false };
  }

  var filename = filenameFromHeaders(headers) || date + ".jpg";
  folder.createFile(card.getBlob().setName(filename));

  var cap = UrlFetchApp.fetch(SITE + "/api/caption?luma=" + encodeURIComponent(ev.url), {
    muteHttpExceptions: true,
  });
  if (cap.getResponseCode() === 200) {
    folder.createFile(
      filename.replace(/\.jpg$/i, ".txt"),
      cap.getContentText(),
      MimeType.PLAIN_TEXT
    );
  }
  return { folder: folderName, created: true };
}

// To run it by hand any time: open this script and press Run on
// "generateDriveCards". (No spreadsheet menu here — that would make Google
// ask for Sheets access this script doesn't need.)

// ---------- iCal parsing ----------

function parseIcs(ics) {
  // Unfold folded lines (ICS wraps long lines with CRLF + space/tab).
  var text = ics.replace(/\r?\n[ \t]/g, "");
  var blocks = text.split("BEGIN:VEVENT");
  var out = [];
  for (var i = 1; i < blocks.length; i++) {
    var b = blocks[i];
    out.push({
      start: parseDtStart(b),
      url: extractLumaUrl(b),
    });
  }
  return out;
}

function parseDtStart(block) {
  var m = block.match(/DTSTART[^:\r\n]*:([0-9T]+Z?)/);
  if (!m) return null;
  var s = m[1];
  var d = s.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!d) return null;
  // Use UTC; only the calendar date is used for filing.
  return new Date(
    Date.UTC(
      +d[1], +d[2] - 1, +d[3],
      d[4] ? +d[4] : 12, d[5] ? +d[5] : 0, d[6] ? +d[6] : 0
    )
  );
}

function extractLumaUrl(block) {
  var m = block.match(/https:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\/[A-Za-z0-9\-]+/);
  return m ? m[0] : null;
}

// ---------- helpers ----------

// Folder date label, e.g. "23.07" (day.month).
function ddmm(d) {
  var mm = ("0" + (d.getUTCMonth() + 1)).slice(-2);
  var dd = ("0" + d.getUTCDate()).slice(-2);
  return dd + "." + mm;
}

// Header lookup that ignores case (HTTP/2 lower-cases header names).
function getHeaderCI(headers, name) {
  var want = name.toLowerCase();
  for (var k in headers) {
    if (k.toLowerCase() === want) return headers[k] || "";
  }
  return "";
}

function filenameFromHeaders(headers) {
  var cd = getHeaderCI(headers, "Content-Disposition");
  var m = String(cd).match(/filename="([^"]+)"/);
  return m ? m[1] : null;
}

function decode(s) {
  try {
    return decodeURIComponent(s);
  } catch (e) {
    return s;
  }
}

function getOrCreateSubfolder(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
