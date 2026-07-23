/**
 * LFG Event Cards → Google Drive (weekly, automatic)
 *
 * Reads the LFG Luma calendar iCal feed, and for every UPCOMING event builds
 * the event card + Instagram caption on eventlogocreator.vercel.app, then
 * saves them into Google Drive:
 *
 *   LFG Event Cards / <YYYY-MM-DD> <chapter> / <card>.jpg
 *                                             / <card>.txt   (caption)
 *
 * It skips events it has already saved, so it's safe to run repeatedly.
 *
 * ---- ONE-TIME SETUP ----
 *  1. drive.google.com → New → More → Google Apps Script (or script.google.com).
 *  2. Delete anything in the editor, paste this whole file in, click save (💾).
 *  3. In the function dropdown choose "setup", press Run, and approve the
 *     permissions Google asks for (read the calendar feed, write to Drive).
 *     If you see "Google hasn't verified this app", click Advanced → Go to project.
 *  4. Done. It now runs every Sunday at ~06:00 and there's also an
 *     "LFG Cards → Generate now" menu item / you can Run "generateDriveCards".
 */

var ICS_URL =
  "https://api.luma.com/ics/get?entity=calendar&id=cal-RrzxAKUyNdOjqXi";
var SITE = "https://eventlogocreator.vercel.app";
var PARENT_FOLDER = "LFG Event Cards";

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

  var parent = getOrCreateFolder(PARENT_FOLDER);
  var made = 0;
  var errors = [];

  events.forEach(function (ev) {
    if (!ev.start || !ev.url || ev.start < today) return;
    try {
      if (createCardFor(ev, parent)) made++;
    } catch (err) {
      errors.push(ev.url + " — " + err.message);
    }
  });

  Logger.log("Cards saved this run: " + made);
  if (errors.length) Logger.log("Problems:\n" + errors.join("\n"));
}

/** Fetches one card + caption from the site and saves them to Drive. */
function createCardFor(ev, parent) {
  var date = ymd(ev.start);

  var card = UrlFetchApp.fetch(SITE + "/api/card?luma=" + encodeURIComponent(ev.url), {
    muteHttpExceptions: true,
    followRedirects: true,
  });
  if (card.getResponseCode() !== 200) {
    throw new Error("card HTTP " + card.getResponseCode());
  }

  var headers = card.getHeaders();
  var chapter = decode(headers["X-Event-Chapter"] || "").replace(/^LFG\s+/i, "");
  var folderName = chapter ? date + " " + chapter : date;
  var folder = getOrCreateSubfolder(parent, folderName);

  // Already done? Skip (keeps repeat runs cheap and avoids duplicates).
  if (folder.getFilesByType(MimeType.JPEG).hasNext()) return false;

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
  return true;
}

/** Adds a manual menu when opened from a Sheet/Doc-bound context (optional). */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("LFG Cards")
      .addItem("Generate now", "generateDriveCards")
      .addToUi();
  } catch (e) {
    // Standalone script — no host UI; use Run instead.
  }
}

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

function ymd(d) {
  var mm = ("0" + (d.getUTCMonth() + 1)).slice(-2);
  var dd = ("0" + d.getUTCDate()).slice(-2);
  return d.getUTCFullYear() + "-" + mm + "-" + dd;
}

function filenameFromHeaders(headers) {
  var cd = String(headers["Content-Disposition"] || "");
  var m = cd.match(/filename="([^"]+)"/);
  return m ? m[1] : null;
}

function decode(s) {
  try {
    return decodeURIComponent(s);
  } catch (e) {
    return s;
  }
}

function getOrCreateFolder(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function getOrCreateSubfolder(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
