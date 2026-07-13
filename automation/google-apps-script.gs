/**
 * LFG Event Card Bot — lives inside the "Upcoming Chapter Events" Google Doc.
 *
 * Every 15 minutes (or when you pick "Generate cards now" from the menu) it:
 *   1. Scans the document for Luma links (lu.ma / luma.com)
 *   2. Skips any that already have a "Card:" line underneath
 *   3. Asks eventlogocreator.vercel.app to build the card image
 *   4. Saves the image into the "Event Cards" folder in Google Drive
 *   5. Pastes a shareable Drive link into the doc, right under the Luma link
 *
 * Setup (one time):
 *   - In the Google Doc: Extensions → Apps Script, paste this whole file in,
 *     replacing anything already there, then click the save icon.
 *   - In the function dropdown at the top, choose "setup" and press Run.
 *     Google will ask you to authorise — approve it (it needs access to this
 *     document, your Drive, and permission to contact the card website).
 *   - Done. It now checks the doc every 15 minutes automatically.
 */

var CARD_API = "https://eventlogocreator.vercel.app/api/card?luma=";
var DRIVE_FOLDER_NAME = "Event Cards";
var CARD_PREFIX = "Card: ";

/** Run this once to authorise and switch on the every-15-minutes check. */
function setup() {
  // Remove any old copies of the trigger so we never double up.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "generateCards") {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("generateCards").timeBased().everyMinutes(15).create();
  generateCards();
}

/** Adds a menu inside the doc for running it by hand. */
function onOpen() {
  DocumentApp.getUi()
    .createMenu("Event Cards")
    .addItem("Generate cards now", "generateCards")
    .addToUi();
}

/** The main job: find Luma links without cards and make cards for them. */
function generateCards() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var folder = getOrCreateFolder();
  var made = 0;
  var errors = [];

  var paragraphs = body.getParagraphs();
  for (var i = 0; i < paragraphs.length; i++) {
    var para = paragraphs[i];
    var lumaUrl = findLumaUrl(para);
    if (!lumaUrl) continue;
    if (hasCardBelow(body, para)) continue;

    try {
      var file = createCard(lumaUrl, folder);
      insertCardLink(body, para, file);
      made++;
    } catch (err) {
      errors.push(lumaUrl + " — " + err.message);
    }
  }

  Logger.log("Cards made: " + made);
  if (errors.length) Logger.log("Problems:\n" + errors.join("\n"));
}

/** Pulls a lu.ma / luma.com link out of a paragraph (text or hyperlink). */
function findLumaUrl(para) {
  var text = para.getText();
  var match = text.match(/https:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\/\S+/);
  if (match) return match[0].replace(/[).,; \s]+$/, "");

  // The link might be hidden behind display text; check the link attribute.
  var textEl = para.editAsText();
  var len = textEl.getText().length;
  for (var offset = 0; offset < len; offset++) {
    var url = textEl.getLinkUrl(offset);
    if (url && /https:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\//.test(url)) {
      return url;
    }
  }
  return null;
}

/** True if the paragraph after this one is already a "Card:" line. */
function hasCardBelow(body, para) {
  var idx = body.getChildIndex(para);
  for (var j = idx + 1; j <= idx + 2 && j < body.getNumChildren(); j++) {
    var el = body.getChild(j);
    if (el.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
    var t = el.asParagraph().getText();
    if (t.indexOf(CARD_PREFIX) === 0 || t.indexOf("drive.google.com") !== -1) {
      return true;
    }
    if (t.trim() !== "") return false; // some other content — no card yet
  }
  return false;
}

/** Asks the website for the card image and saves it into Drive. */
function createCard(lumaUrl, folder) {
  var response = UrlFetchApp.fetch(CARD_API + encodeURIComponent(lumaUrl), {
    muteHttpExceptions: true,
    followRedirects: true,
  });

  var code = response.getResponseCode();
  var type = String(response.getHeaders()["Content-Type"] || "");
  if (code !== 200 || type.indexOf("image") === -1) {
    var detail = "";
    try {
      detail = JSON.parse(response.getContentText()).error || "";
    } catch (e) {}
    throw new Error("Card website said no (HTTP " + code + ") " + detail);
  }

  var filename = filenameFromHeaders(response.getHeaders()) || "event-card.jpg";
  var blob = response.getBlob().setName(filename);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file;
}

/** Reads the suggested filename (e.g. lfg-edinburgh-pub-social-2026-07-14.jpg). */
function filenameFromHeaders(headers) {
  var cd = String(headers["Content-Disposition"] || "");
  var m = cd.match(/filename="([^"]+)"/);
  return m ? m[1] : null;
}

/** Puts the Drive link into the doc just under the Luma link. */
function insertCardLink(body, para, file) {
  var idx = body.getChildIndex(para);
  var newPara = body.insertParagraph(idx + 1, CARD_PREFIX + file.getUrl());
  var text = newPara.editAsText();
  text.setLinkUrl(
    CARD_PREFIX.length,
    newPara.getText().length - 1,
    file.getUrl()
  );
  text.setFontSize(9);
  text.setForegroundColor("#666666");
}

/** Finds the "Event Cards" folder in Drive, creating it the first time. */
function getOrCreateFolder() {
  var existing = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}
