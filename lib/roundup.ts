import type { CalendarEvent } from "@/lib/calendar";

// Pure logic + HTML builder for the weekly chapter-events roundup email.
// Kept free of network/IO so it can be unit-tested and previewed.

const AMBER = "#EE9944";
const ORANGE = "#FE5500";
const TEAL = "#79CAC4";
const BLACK = "#000000";
const CREAM = "#EBE3D0";

const HEADING = "'Poppins', Arial, sans-serif";
const BODY = "'DM Sans', Arial, sans-serif";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ---- date helpers (operate on YYYY-MM-DD, treated as UK calendar dates) ----

function dateAtUTC(ymd: string): Date {
  return new Date(`${ymd}T00:00:00Z`);
}

function addDays(ymd: string, n: number): string {
  return new Date(dateAtUTC(ymd).getTime() + n * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

function fmt(ymd: string, opts: Intl.DateTimeFormatOptions): string {
  return dateAtUTC(ymd)
    .toLocaleDateString("en-GB", { timeZone: "UTC", ...opts })
    .toLowerCase();
}

// "thu 23"
export function dayAndDate(ymd: string): string {
  return `${fmt(ymd, { weekday: "short" })} ${dateAtUTC(ymd).getUTCDate()}`;
}

// "wed 29 jul"
export function dayDateMonth(ymd: string): string {
  return `${fmt(ymd, { weekday: "short" })} ${dateAtUTC(ymd).getUTCDate()} ${fmt(ymd, { month: "short" })}`;
}

// "27 july" (full month, used in the header and subject)
export function dateMonthLong(ymd: string): string {
  return `${dateAtUTC(ymd).getUTCDate()} ${fmt(ymd, { month: "long" })}`;
}

// The coming week: Monday..Sunday. Run on a Sunday, that's the next day
// through the following Sunday. If run mid-week, it's the upcoming Mon–Sun.
export function weekWindow(today: string): { monday: string; sunday: string } {
  const dow = dateAtUTC(today).getUTCDay(); // 0 Sun .. 6 Sat
  const daysToMonday = (1 - dow + 7) % 7;
  const monday = addDays(today, daysToMonday);
  return { monday, sunday: addDays(monday, 6) };
}

// ---- text helpers ----

// "LFG Westminster: Monthly Social" -> "westminster social"
export function deriveChapter(name: string): string {
  return name
    .toLowerCase()
    .replace(/\blfg\b/g, " ")
    .replace(/[:#]/g, " ")
    .replace(/\bmonthly\b/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// chip form drops the trailing "social" -> "westminster", "cambridge"
export function chipChapter(name: string): string {
  return deriveChapter(name).replace(/\s*social$/, "").trim();
}

// "https://luma.com/lfg-zofw" -> "luma.com/lfg-zofw"
export function shortLuma(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- bucketing ----

export type ComingUpGroup = { date: string; label: string; chapters: string[] };

export function splitEvents(
  events: CalendarEvent[],
  today: string,
): { thisWeek: CalendarEvent[]; comingUp: ComingUpGroup[] } {
  const { monday, sunday } = weekWindow(today);

  // Drop events that have already ended (date before today).
  const live = events
    .filter((e) => e.date && e.date >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const thisWeek = live.filter((e) => e.date >= monday && e.date <= sunday);

  const later = live.filter((e) => e.date > sunday);
  const byDate = new Map<string, string[]>();
  for (const e of later) {
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date)!.push(chipChapter(e.name));
  }
  const comingUp: ComingUpGroup[] = [...byDate.entries()].map(
    ([date, chapters]) => ({
      date,
      label: dayDateMonth(date),
      chapters,
    }),
  );

  return { thisWeek, comingUp };
}

// ---- HTML ----

export function buildSubject(monday: string): string {
  return `this week in our chapters — w/c ${dateMonthLong(monday)}`;
}

const ROW_CYCLE = [AMBER, TEAL, ORANGE];
const CHIP_CYCLE = [
  { bg: AMBER, fg: BLACK },
  { bg: ORANGE, fg: CREAM },
  { bg: TEAL, fg: BLACK },
  { bg: BLACK, fg: CREAM },
];

function eventRow(ev: CalendarEvent, i: number): string {
  const bg = ROW_CYCLE[i % ROW_CYCLE.length];
  const isOrange = bg === ORANGE;
  const linkColor = isOrange ? CREAM : ORANGE;
  const divider = i === 0 ? "" : "border-top:3px solid #000000;";
  const name = esc(deriveChapter(ev.name));
  const venue = esc(ev.venue || "tbc");
  const short = esc(shortLuma(ev.url));

  return `
  <tr>
    <td style="background:${bg};${divider}padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td width="88" valign="top" style="padding:20px 0 20px 20px;font-family:${HEADING};font-weight:800;font-size:18px;color:#000000;white-space:nowrap;">
            ${dayAndDate(ev.date)}
          </td>
          <td valign="top" style="padding:20px 20px 20px 12px;">
            <div style="font-family:${HEADING};font-weight:700;font-size:24px;line-height:1.05;color:#000000;">${name}</div>
            <div style="font-family:${BODY};font-size:14px;line-height:1.3;color:rgba(0,0,0,0.6);padding-top:6px;">${venue}</div>
            <div style="padding-top:8px;">
              <a href="${esc(ev.url)}" style="font-family:${BODY};font-weight:700;font-size:14px;color:${linkColor};text-decoration:none;">${short}&nbsp;&rarr;</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// Chips flow inline and wrap by width, like the design: short ones share a
// line, longer ones take their own.
function chip(group: ComingUpGroup, i: number): string {
  const { bg, fg } = CHIP_CYCLE[i % CHIP_CYCLE.length];
  const text = `${group.label} — ${group.chapters.join(" · ")}`;
  return `<div style="display:inline-block;border:2px solid #000000;background:${bg};color:${fg};font-family:${BODY};font-weight:700;font-size:13px;line-height:1;padding:9px 12px;margin:0 8px 8px 0;">${esc(text)}</div>`;
}

function chipBlock(groups: ComingUpGroup[]): string {
  return groups.map((g, i) => chip(g, i)).join("");
}

export function buildEmailHtml(params: {
  monday: string;
  thisWeek: CalendarEvent[];
  comingUp: ComingUpGroup[];
}): string {
  const { monday, thisWeek, comingUp } = params;
  const wc = dateMonthLong(monday);

  const rowsBlock =
    thisWeek.length > 0
      ? thisWeek.map((ev, i) => eventRow(ev, i)).join("")
      : `<tr><td style="background:${CREAM};padding:28px 20px;font-family:${HEADING};font-weight:700;font-size:20px;color:#000000;">no chapter events this week — check the calendar</td></tr>`;

  const comingUpBlock =
    comingUp.length > 0
      ? `
      <tr><td style="padding:36px 0 14px 0;font-family:${BODY};font-weight:700;font-size:13px;letter-spacing:0.18em;color:#000000;">COMING UP</td></tr>
      <tr><td style="padding:0;">${chipBlock(comingUp)}</td></tr>`
      : "";

  const motif = [AMBER, ORANGE, TEAL, BLACK]
    .map(
      (c) =>
        `<tr><td style="background:${c};height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=DM+Sans:wght@400;700&display=swap" rel="stylesheet">
<title>this week in our chapters</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-collapse:collapse;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;border-collapse:collapse;background:${CREAM};">

    <!-- header -->
    <tr><td style="border-bottom:2px solid #000000;padding:0 0 14px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td valign="middle" style="font-family:${HEADING};font-weight:800;font-size:26px;color:#000000;">LFG</td>
          <td valign="middle" align="right" style="font-family:${BODY};font-weight:700;font-size:11px;letter-spacing:0.12em;color:#000000;text-transform:uppercase;">chapter events · w/c ${esc(wc)}</td>
        </tr>
      </table>
    </td></tr>

    <!-- headline -->
    <tr><td style="padding:28px 0 26px 0;font-family:${HEADING};font-weight:800;font-size:44px;line-height:1.02;color:#000000;">this week in<br>our <span style="color:${ORANGE};">chapters.</span></td></tr>

    <!-- event rows -->
    <tr><td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:3px solid #000000;">
        ${rowsBlock}
      </table>
    </td></tr>

    ${comingUpBlock}

    <!-- footer -->
    <tr><td style="padding:44px 0 22px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td valign="bottom" style="font-family:${BODY};font-size:14px;line-height:1.7;color:#000000;">
            sign up on the luma calendar &rarr;<br>
            <a href="https://luma.com/lookingforgrowth" style="color:${ORANGE};font-weight:700;text-decoration:none;">luma.com/lookingforgrowth</a>
          </td>
          <td valign="bottom" align="right" style="font-family:${BODY};font-size:14px;color:#000000;">
            <a href="https://lookingforgrowth.uk" style="color:#000000;text-decoration:none;">lookingforgrowth.uk</a>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- brand motif -->
    <tr><td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${motif}</table>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}
