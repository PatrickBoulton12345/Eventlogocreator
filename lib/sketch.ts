// Flat 2D sketches of each chapter's city, offered alongside the city
// photos as a card background. Major cities get a skyline of their real
// landmarks; anywhere else gets a made-up skyline that's always the same
// for the same place. Drawn as SVG at the card's own size (1080 × 1350):
// sky and landmarks in the top half, a solid dark base below the
// skyline so the card's words stay readable.

import { findChapterName } from "@/lib/chapters";

const W = 1080;
const H = 1350;
// Where the buildings stand. Everything below is the dark base.
const G = 730;

const SKY_TOP = "#F6F1E6";
const SKY_BOTTOM = "#E6DBC4";
const SUN = "#FE5500";
const GOLD = "#EE9944";
const FAR = "#CBBDA5";
const NEAR = "#2B2521";
// Cut-outs in the dark shapes: clock faces, windows, gaps.
const CUT = "#E6DBC4";

type Landmarks = { place: string; draw: () => string };

// ---------- the cities ----------

const LONDON: Landmarks = {
  place: "London",
  draw: () =>
    [
      londonEye(195, 170),
      bigBen(420, 430),
      block(445, 100, 120),
      stPauls(660),
      gherkin(850, 330),
      shard(990, 560),
    ].join(""),
};

const CITIES: Record<string, Landmarks> = {
  westminster: {
    place: "Westminster",
    draw: () =>
      [
        londonEye(190, 165),
        parliament(400, 960, 150),
        bigBen(400, 460),
        victoriaTower(930, 360),
      ].join(""),
  },
  southwark: {
    place: "Southwark",
    draw: () =>
      [
        cathedralTower(120, 250),
        block(170, 90, 110),
        towerBridge(470),
        block(720, 80, 170, true),
        shard(880, 600),
        block(960, 90, 140, true),
      ].join(""),
  },
  london: LONDON,
  edinburgh: {
    place: "Edinburgh",
    draw: () =>
      [
        hill(`M 640 ${G} C 760 ${G - 150} 820 ${G - 260} 900 ${G - 270} C 980 ${G - 280} 1040 ${G - 200} ${W} ${G - 160} L ${W} ${G} Z`, FAR),
        edinburghCastle(),
        scottMonument(990, 380),
      ].join(""),
  },
  manchester: {
    place: "Manchester",
    draw: () =>
      [
        townHallSpire(170, 420),
        block(230, 120, 150, true),
        beetham(450, 540),
        deansgateTower(640, 470, 85),
        deansgateTower(745, 400, 80),
        deansgateTower(845, 330, 75),
        block(930, 120, 180, true),
      ].join(""),
  },
  liverpool: {
    place: "Liverpool",
    draw: () =>
      [
        liverBuilding(250),
        portBuilding(640),
        cathedralTower(950, 380, 120),
      ].join(""),
  },
  leeds: {
    place: "Leeds",
    draw: () =>
      [
        block(40, 120, 170, true),
        leedsTownHall(380),
        cornExchange(720),
        bridgewater(930, 430),
      ].join(""),
  },
  newcastle: {
    place: "Newcastle",
    draw: () => [tyneBridge(), greysMonument(1000, 330)].join(""),
  },
  sheffield: {
    place: "Sheffield",
    draw: () =>
      [
        hill(`M 0 ${G - 120} C 200 ${G - 200} 380 ${G - 150} 540 ${G - 90} L 540 ${G} L 0 ${G} Z`, FAR),
        hillsideHouses(),
        cathedralSpire(560, 330),
        artsTower(720, 330),
        stPaulsTower(900, 430),
      ].join(""),
  },
  birmingham: {
    place: "Birmingham",
    draw: () =>
      [
        libraryOfBirmingham(80),
        btTower(420, 560),
        rotunda(560, 340),
        selfridges(720),
      ].join(""),
  },
  cardiff: {
    place: "Cardiff",
    draw: () => [cardiffCastle(70), stadium(470)].join(""),
  },
  bristol: {
    place: "Bristol",
    draw: () => [balloon(960, 170), cliftonBridge()].join(""),
  },
  oxford: {
    place: "Oxford",
    draw: () =>
      [
        churchSpire(110, 420),
        tomTower(280, 300),
        radcliffeCamera(540),
        churchSpire(800, 380),
        block(850, 120, 150, true),
        churchSpire(990, 300),
      ].join(""),
  },
  cambridge: {
    place: "Cambridge",
    draw: () =>
      [tree(90, 120), kingsChapel(200, 880), tree(980, 140), tree(1050, 100)].join(""),
  },
  brighton: {
    place: "Brighton",
    draw: () => [royalPavilion(60), pier(470, 980), i360(380, 580), gull(700, 240), gull(780, 300)].join(""),
  },
};

// Chapters (as lib/chapters.ts names them) and the city they're drawn as.
const CHAPTER_CITY: Record<string, string> = {
  Westminster: "westminster",
  Southwark: "southwark",
  Lambeth: "london",
  "Hammersmith & Fulham": "london",
  Putney: "london",
  Ealing: "london",
  Barnet: "london",
  Edinburgh: "edinburgh",
  Manchester: "manchester",
  Liverpool: "liverpool",
  Leeds: "leeds",
  Newcastle: "newcastle",
  Sheffield: "sheffield",
  "West Midlands": "birmingham",
  "South Wales": "cardiff",
  "South West England": "bristol",
  Oxford: "oxford",
  Cambridge: "cambridge",
  Brighton: "brighton",
};

// A city typed that isn't one of our chapters yet, e.g. "LFG Birmingham".
const CITY_WORDS: [RegExp, string][] = [
  [/\blondon\b/i, "london"],
  [/\bbirmingham\b/i, "birmingham"],
  [/\bcardiff\b/i, "cardiff"],
  [/\bbristol\b/i, "bristol"],
];

export type Sketch = {
  // Shown in the picker, e.g. "Edinburgh".
  place: string;
  // True when it's drawn from the city's real landmarks.
  landmarks: boolean;
  url: string;
};

export function cityKey(chapter: string): string | null {
  const known = findChapterName(chapter);
  if (known && CHAPTER_CITY[known]) return CHAPTER_CITY[known];
  for (const [re, key] of CITY_WORDS) if (re.test(chapter)) return key;
  return null;
}

function placeOf(chapter: string): string {
  return chapter.replace(/\blfg\b/gi, "").replace(/\s+/g, " ").trim();
}

export function sketchFor(chapter: string): Sketch | null {
  const place = placeOf(chapter);
  if (!place) return null;
  const key = cityKey(chapter);
  return {
    place: key ? CITIES[key].place : place,
    landmarks: !!key,
    url: `/api/sketch?chapter=${encodeURIComponent(chapter.trim())}`,
  };
}

export function sketchSvg(chapter: string): string {
  const key = cityKey(chapter);
  const seed = hash(key ?? placeOf(chapter).toLowerCase());
  const near = key ? CITIES[key].draw() : madeUpSkyline(seed);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${SKY_TOP}"/><stop offset="1" stop-color="${SKY_BOTTOM}"/>`,
    `</linearGradient></defs>`,
    `<rect width="${W}" height="${G + 2}" fill="url(#sky)"/>`,
    circle(760, 300, 105, SUN),
    farSkyline(seed),
    near,
    rect(0, G, W, H - G),
    `</svg>`,
  ].join("");
}

// ---------- shapes ----------

function rect(x: number, y: number, w: number, h: number, fill = NEAR, extra = ""): string {
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${extra}/>`;
}

function circle(cx: number, cy: number, r: number, fill = NEAR, extra = ""): string {
  return `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${fill}"${extra}/>`;
}

function ellipse(cx: number, cy: number, rx: number, ry: number, fill = NEAR): string {
  return `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${fill}"/>`;
}

function poly(points: [number, number][], fill = NEAR): string {
  return `<polygon points="${points.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ")}" fill="${fill}"/>`;
}

function path(d: string, fill = NEAR, extra = ""): string {
  return `<path d="${d}" fill="${fill}"${extra}/>`;
}

function line(x1: number, y1: number, x2: number, y2: number, width: number, colour = NEAR): string {
  return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${colour}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function stroke(d: string, width: number, colour = NEAR): string {
  return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linejoin="round"/>`;
}

function hill(d: string, fill: string): string {
  return path(d, fill);
}

// A plain building standing on the ground, optionally with lit windows.
function block(x: number, w: number, h: number, lit = false): string {
  return rect(x, G - h, w, h) + (lit ? windows(x + 12, G - h + 16, w - 24, h - 30) : "");
}

function windows(x: number, y: number, w: number, h: number, size = 8, gap = 14): string {
  let out = "";
  for (let wy = y; wy + size <= y + h; wy += gap + size) {
    for (let wx = x; wx + size <= x + w; wx += gap + size) {
      out += rect(wx, wy, size, size * 1.4, CUT, ` opacity="0.22"`);
    }
  }
  return out;
}

// A row of square teeth along a wall top.
function battlements(x: number, y: number, w: number, tooth = 12): string {
  let out = "";
  for (let tx = x; tx + tooth <= x + w + 0.1; tx += tooth * 2) out += rect(tx, y - tooth, tooth, tooth);
  return out;
}

function pinnacle(cx: number, baseY: number, w: number, h: number): string {
  return poly([[cx - w / 2, baseY], [cx, baseY - h], [cx + w / 2, baseY]]);
}

function clockFace(cx: number, cy: number, r: number): string {
  return circle(cx, cy, r, CUT) + line(cx, cy, cx, cy - r * 0.7, 3) + line(cx, cy, cx + r * 0.5, cy, 3);
}

// ---------- London ----------

function bigBen(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 2, top, 4, 34),
    poly([[cx - 30, top + 120], [cx, top + 30], [cx + 30, top + 120]]),
    rect(cx - 26, top + 118, 52, 46),
    windows(cx - 18, top + 126, 36, 30, 6, 6),
    rect(cx - 32, top + 162, 64, 74),
    clockFace(cx, top + 199, 23),
    pinnacle(cx - 30, top + 162, 10, 26),
    pinnacle(cx + 30, top + 162, 10, 26),
    rect(cx - 25, top + 234, 50, h - 234),
  ].join("");
}

function victoriaTower(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 45, top + 40, 90, h - 40),
    pinnacle(cx - 40, top + 40, 14, 44),
    pinnacle(cx + 40, top + 40, 14, 44),
    pinnacle(cx, top + 40, 12, 30),
    rect(cx - 1.5, top - 20, 3, 60),
    rect(cx + 1.5, top - 20, 22, 14, GOLD),
    windows(cx - 30, top + 70, 60, h - 110, 8, 16),
  ].join("");
}

function parliament(x0: number, x1: number, h: number): string {
  let out = rect(x0, G - h, x1 - x0, h);
  for (let x = x0 + 20; x < x1 - 10; x += 34) out += pinnacle(x, G - h, 8, 22);
  out += windows(x0 + 40, G - h + 24, x1 - x0 - 80, h - 40, 6, 14);
  return out;
}

function londonEye(cx: number, r: number): string {
  const cy = G - r - 25;
  let out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${NEAR}" stroke-width="9"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="${r - 16}" fill="none" stroke="${NEAR}" stroke-width="3"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    out += line(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2);
    out += circle(cx + Math.cos(a) * (r + 8), cy + Math.sin(a) * (r + 8), 9);
  }
  out += circle(cx, cy, 14);
  out += line(cx, cy, cx - r * 0.55, G, 10) + line(cx, cy, cx - r * 0.2, G, 8);
  return out;
}

function stPauls(cx: number): string {
  return [
    rect(cx - 130, G - 110, 260, 110),
    windows(cx - 115, G - 95, 230, 80, 8, 18),
    rect(cx - 125, G - 200, 40, 90),
    ellipse(cx - 105, G - 200, 20, 24),
    rect(cx + 85, G - 200, 40, 90),
    ellipse(cx + 105, G - 200, 20, 24),
    rect(cx - 62, G - 185, 124, 75),
    windows(cx - 52, G - 175, 104, 55, 5, 9),
    path(`M ${cx - 74} ${G - 182} A 74 82 0 0 1 ${cx + 74} ${G - 182} Z`),
    rect(cx - 10, G - 315, 20, 52),
    circle(cx, G - 322, 9),
    rect(cx - 2, G - 352, 4, 30),
    rect(cx - 10, G - 343, 20, 4),
  ].join("");
}

function gherkin(cx: number, h: number): string {
  const top = G - h;
  return (
    path(`M ${cx - 40} ${G} C ${cx - 66} ${G - h * 0.45} ${cx - 56} ${top + 60} ${cx} ${top} C ${cx + 56} ${top + 60} ${cx + 66} ${G - h * 0.45} ${cx + 40} ${G} Z`) +
    stroke(`M ${cx - 46} ${G - 40} C ${cx - 10} ${G - 120} ${cx + 30} ${G - 170} ${cx + 52} ${G - 250}`, 3, CUT).replace("/>", ` opacity="0.3"/>`) +
    stroke(`M ${cx - 54} ${G - 160} C ${cx - 20} ${G - 220} ${cx + 10} ${G - 270} ${cx + 22} ${top + 30}`, 3, CUT).replace("/>", ` opacity="0.3"/>`)
  );
}

function shard(cx: number, h: number): string {
  const top = G - h;
  return (
    poly([[cx - 85, G], [cx - 8, top], [cx + 2, top + 40], [cx + 85, G]]) +
    poly([[cx + 6, top + 20], [cx + 12, top + 6], [cx + 16, top + 60], [cx + 6, top + 70]]) +
    line(cx + 6, top + 90, cx + 46, G - 40, 2, CUT).replace("/>", ` opacity="0.35"/>`)
  );
}

function towerBridge(cx: number): string {
  const towerH = 300;
  const lx = cx - 120;
  const rx = cx + 120;
  const tower = (x: number) =>
    [
      rect(x - 34, G - towerH + 50, 68, towerH - 50),
      poly([[x - 34, G - towerH + 50], [x, G - towerH], [x + 34, G - towerH + 50]]),
      pinnacle(x - 30, G - towerH + 60, 14, 50),
      pinnacle(x + 30, G - towerH + 60, 14, 50),
      rect(x - 12, G - towerH + 80, 24, 50, CUT, ` opacity="0.3"`),
      rect(x - 20, G - 130, 40, 70, CUT),
      path(`M ${x - 20} ${G - 130} A 20 20 0 0 1 ${x + 20} ${G - 130} Z`, CUT),
    ].join("");
  return [
    rect(lx, G - towerH + 70, rx - lx, 16),
    rect(lx, G - towerH + 96, rx - lx, 8),
    rect(lx - 220, G - 70, rx - lx + 440, 16),
    tower(lx),
    tower(rx),
    stroke(`M ${lx - 34} ${G - towerH + 70} Q ${lx - 130} ${G - 110} ${lx - 220} ${G - 70}`, 7),
    stroke(`M ${rx + 34} ${G - towerH + 70} Q ${rx + 130} ${G - 110} ${rx + 220} ${G - 70}`, 7),
  ].join("");
}

function cathedralTower(cx: number, h: number, w = 70): string {
  const top = G - h;
  return [
    rect(cx - w / 2, top, w, h),
    pinnacle(cx - w / 2 + 6, top, 12, 40),
    pinnacle(cx + w / 2 - 6, top, 12, 40),
    pinnacle(cx - w / 6, top, 8, 24),
    pinnacle(cx + w / 6, top, 8, 24),
    rect(cx - w / 5, top + 40, (w * 2) / 5, 60, CUT, ` opacity="0.3"`),
  ].join("");
}

// ---------- Edinburgh ----------

function edinburghCastle(): string {
  const rock = `M 50 ${G} C 100 ${G - 110} 190 ${G - 210} 300 ${G - 225} L 740 ${G - 215} C 800 ${G - 205} 840 ${G - 110} 870 ${G} Z`;
  const top = G - 222;
  return [
    path(rock),
    rect(280, top - 130, 170, 132),
    battlements(280, top - 130, 170, 14),
    windows(296, top - 108, 138, 90, 8, 16),
    rect(450, top - 95, 110, 97),
    poly([[446, top - 95], [505, top - 140], [564, top - 95]]),
    windows(466, top - 76, 78, 60, 8, 16),
    rect(560, top - 215, 74, 217),
    battlements(560, top - 215, 74, 12),
    windows(574, top - 190, 46, 150, 8, 16),
    rect(595.5, top - 280, 3, 66),
    rect(598.5, top - 280, 30, 18, GOLD),
    rect(634, top - 110, 110, 112),
    battlements(634, top - 110, 110, 12),
    windows(648, top - 90, 82, 70, 8, 16),
    // The Half Moon Battery's round wall.
    rect(744, top - 64, 76, 90, NEAR, ` rx="10"`),
    battlements(746, top - 64, 70, 10),
    // Seats the buildings on the rock.
    rect(280, top - 4, 540, 30),
  ].join("");
}

function scottMonument(cx: number, h: number): string {
  const top = G - h;
  return [
    poly([[cx - 48, G], [cx - 34, G - 140], [cx - 18, G - 270], [cx, top], [cx + 18, G - 270], [cx + 34, G - 140], [cx + 48, G]]),
    pinnacle(cx - 40, G - 120, 10, 70),
    pinnacle(cx + 40, G - 120, 10, 70),
    pinnacle(cx - 26, G - 240, 8, 60),
    pinnacle(cx + 26, G - 240, 8, 60),
    path(`M ${cx - 16} ${G} L ${cx - 16} ${G - 50} A 16 18 0 0 1 ${cx + 16} ${G - 50} L ${cx + 16} ${G} Z`, CUT),
  ].join("");
}

// ---------- Manchester ----------

function townHallSpire(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 140, G - 140, 280, 140),
    windows(cx - 125, G - 120, 250, 100, 8, 18),
    rect(cx - 28, top + 130, 56, h - 130),
    clockFace(cx, top + 170, 18),
    poly([[cx - 30, top + 132], [cx, top], [cx + 30, top + 132]]),
    pinnacle(cx - 28, top + 132, 10, 40),
    pinnacle(cx + 28, top + 132, 10, 40),
    pinnacle(cx - 140, G - 140, 10, 40),
    pinnacle(cx + 140, G - 140, 10, 40),
  ].join("");
}

function beetham(x: number, h: number): string {
  const top = G - h;
  let out = rect(x, top, 90, h) + rect(x - 18, top, 18, 120);
  for (let y = top + 14; y < G - 10; y += 22) out += rect(x + 8, y, 74, 2, CUT, ` opacity="0.25"`);
  return out;
}

function deansgateTower(x: number, h: number, w: number): string {
  const top = G - h;
  return poly([[x, G], [x, top + 30], [x + w, top], [x + w, G]]) + windows(x + 12, top + 46, w - 24, h - 60, 6, 12);
}

// ---------- Liverpool ----------

function liverBuilding(cx: number): string {
  const roof = G - 220;
  const tower = (x: number) =>
    [
      rect(x - 32, roof - 110, 64, 112),
      clockFace(x, roof - 66, 20),
      rect(x - 24, roof - 150, 48, 42),
      path(`M ${x - 26} ${roof - 148} A 26 34 0 0 1 ${x + 26} ${roof - 148} Z`),
      liverBird(x, roof - 186),
    ].join("");
  return [
    rect(cx - 150, roof, 300, 220),
    windows(cx - 132, roof + 18, 264, 186, 8, 14),
    tower(cx - 90),
    tower(cx + 90),
  ].join("");
}

function liverBird(cx: number, baseY: number): string {
  return [
    rect(cx - 1.5, baseY - 14, 3, 16),
    path(`M ${cx - 4} ${baseY - 14} Q ${cx - 6} ${baseY - 34} ${cx + 4} ${baseY - 40} Q ${cx + 12} ${baseY - 38} ${cx + 8} ${baseY - 30} L ${cx + 4} ${baseY - 14} Z`),
    path(`M ${cx} ${baseY - 30} Q ${cx - 22} ${baseY - 44} ${cx - 26} ${baseY - 26} Q ${cx - 12} ${baseY - 28} ${cx} ${baseY - 22} Z`),
  ].join("");
}

function portBuilding(cx: number): string {
  const roof = G - 160;
  return [
    rect(cx - 130, roof, 260, 160),
    windows(cx - 114, roof + 18, 228, 126, 8, 14),
    rect(cx - 46, roof - 30, 92, 32),
    path(`M ${cx - 50} ${roof - 28} A 50 58 0 0 1 ${cx + 50} ${roof - 28} Z`),
    rect(cx - 7, roof - 106, 14, 26),
    circle(cx, roof - 110, 7),
    ellipse(cx - 118, roof - 6, 14, 22),
    ellipse(cx + 118, roof - 6, 14, 22),
  ].join("");
}

// ---------- Leeds ----------

function leedsTownHall(cx: number): string {
  const roof = G - 150;
  let out = rect(cx - 190, roof, 380, 150);
  for (let x = cx - 170; x <= cx + 160; x += 30) out += rect(x, roof + 26, 10, 110, CUT, ` opacity="0.25"`);
  out += poly([[cx - 200, roof], [cx, roof - 30], [cx + 200, roof]]);
  out += rect(cx - 55, roof - 120, 110, 122);
  out += clockFace(cx, roof - 70, 22);
  out += rect(cx - 42, roof - 200, 84, 82);
  for (let x = cx - 34; x <= cx + 26; x += 17) out += rect(x, roof - 188, 7, 60, CUT, ` opacity="0.3"`);
  out += path(`M ${cx - 44} ${roof - 198} A 44 52 0 0 1 ${cx + 44} ${roof - 198} Z`);
  out += rect(cx - 8, roof - 285, 16, 40) + circle(cx, roof - 290, 8);
  return out;
}

function cornExchange(cx: number): string {
  return rect(cx - 110, G - 80, 220, 80) + path(`M ${cx - 104} ${G - 78} A 104 64 0 0 1 ${cx + 104} ${G - 78} Z`) + windows(cx - 94, G - 64, 188, 50, 8, 16);
}

function bridgewater(cx: number, h: number): string {
  const top = G - h;
  return path(`M ${cx - 70} ${G} L ${cx - 70} ${top + 70} Q ${cx - 40} ${top} ${cx + 20} ${top + 10} L ${cx + 70} ${top + 60} L ${cx + 70} ${G} Z`) + windows(cx - 54, top + 90, 108, h - 110, 6, 12);
}

// ---------- Newcastle ----------

function tyneBridge(): string {
  const left = 230;
  const right = 850;
  const mid = (left + right) / 2;
  const half = (right - left) / 2;
  const apex = G - 330;
  const deck = G - 120;
  const archY = (x: number) => G - (G - apex) * (1 - ((x - mid) / half) ** 2);
  const pts: string[] = [];
  for (let x = left; x <= right; x += 10) pts.push(`${x},${r1(archY(x))}`);
  let out = `<polyline points="${pts.join(" ")}" fill="none" stroke="${NEAR}" stroke-width="22" stroke-linejoin="round"/>`;
  for (let x = left + 60; x <= right - 60; x += 40) {
    const y = archY(x);
    if (y < deck - 10) out += line(x, y, x, deck, 3);
  }
  out += rect(100, deck, 880, 18);
  const pylon = (x: number) => rect(x - 34, deck - 70, 68, G - deck + 70) + rect(x - 40, deck - 80, 80, 14) + rect(x - 14, deck - 50, 28, 40, CUT, ` opacity="0.3"`);
  return out + pylon(left - 50) + pylon(right + 50);
}

function greysMonument(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 30, G - 60, 60, 60),
    rect(cx - 14, top + 40, 28, h - 100),
    rect(cx - 20, top + 34, 40, 10),
    path(`M ${cx - 8} ${top + 34} L ${cx - 6} ${top + 10} Q ${cx} ${top - 4} ${cx + 6} ${top + 10} L ${cx + 8} ${top + 34} Z`),
  ].join("");
}

// ---------- Sheffield ----------

function hillsideHouses(): string {
  let out = "";
  const ground = (x: number) => G - 100 + x * 0.12;
  for (let x = 20; x < 470; x += 46) {
    const y = ground(x);
    out += rect(x, y - 36, 42, G - y + 36) + poly([[x - 2, y - 34], [x + 21, y - 54], [x + 44, y - 34]]);
    out += rect(x + 15, y - 24, 10, 12, CUT, ` opacity="0.3"`);
  }
  return out;
}

function cathedralSpire(cx: number, h: number): string {
  const top = G - h;
  return rect(cx - 70, G - 120, 140, 120) + rect(cx - 30, top + 130, 60, h - 130) + poly([[cx - 26, top + 132], [cx, top], [cx + 26, top + 132]]) + pinnacle(cx - 28, top + 132, 10, 30) + pinnacle(cx + 28, top + 132, 10, 30);
}

function artsTower(cx: number, h: number): string {
  let out = rect(cx - 60, G - h, 120, h);
  for (let y = G - h + 16; y < G - 10; y += 18) out += rect(cx - 50, y, 100, 4, CUT, ` opacity="0.25"`);
  return out;
}

function stPaulsTower(cx: number, h: number): string {
  const top = G - h;
  return rect(cx - 48, top, 96, h) + rect(cx - 54, top, 108, 14) + windows(cx - 36, top + 30, 72, h - 50, 6, 10);
}

// ---------- Birmingham ----------

function libraryOfBirmingham(x: number): string {
  return [
    rect(x, G - 110, 220, 110),
    rect(x - 15, G - 210, 250, 102),
    rect(x + 10, G - 290, 200, 82),
    windows(x - 3, G - 198, 226, 80, 10, 10),
    rect(x + 75, G - 330, 70, 42, GOLD),
    path(`M ${x + 75} ${G - 328} A 35 18 0 0 1 ${x + 145} ${G - 328} Z`, GOLD),
  ].join("");
}

function btTower(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 24, top + 60, 48, h - 60),
    rect(cx - 40, top + 80, 80, 22),
    rect(cx - 40, top + 120, 80, 22),
    rect(cx - 36, top + 160, 72, 18),
    rect(cx - 3, top, 6, 62),
  ].join("");
}

function rotunda(cx: number, h: number): string {
  let out = rect(cx - 55, G - h, 110, h, NEAR, ` rx="18"`);
  for (let y = G - h + 20; y < G - 10; y += 20) out += rect(cx - 45, y, 90, 5, CUT, ` opacity="0.25"`);
  return out;
}

function selfridges(x: number): string {
  let out = path(`M ${x} ${G} C ${x - 10} ${G - 120} ${x + 60} ${G - 200} ${x + 150} ${G - 190} C ${x + 250} ${G - 180} ${x + 300} ${G - 110} ${x + 300} ${G} Z`);
  for (let y = G - 160; y < G - 10; y += 26) {
    for (let dx = 30; dx < 280; dx += 26) out += circle(x + dx, y, 7, CUT, ` opacity="0.3"`);
  }
  return out;
}

// ---------- Cardiff ----------

function cardiffCastle(x: number): string {
  const top = G - 320;
  return [
    rect(x, G - 110, 300, 110),
    battlements(x, G - 110, 300),
    rect(x + 110, top + 60, 80, 260),
    clockFace(x + 150, top + 110, 22),
    poly([[x + 104, top + 62], [x + 150, top - 10], [x + 196, top + 62]]),
    rect(x + 96, top + 40, 18, 40),
    poly([[x + 94, top + 42], [x + 105, top + 20], [x + 116, top + 42]]),
    rect(x + 186, top + 40, 18, 40),
    poly([[x + 184, top + 42], [x + 195, top + 20], [x + 206, top + 42]]),
    windows(x + 20, G - 90, 70, 70, 8, 16),
    windows(x + 210, G - 90, 70, 70, 8, 16),
  ].join("");
}

function stadium(cx: number): string {
  const left = cx - 160;
  const right = cx + 400;
  const roof = G - 110;
  const masts = [left + 40, left + 200, right - 200, right - 40];
  let out = path(`M ${left} ${G} L ${left} ${roof + 20} Q ${(left + right) / 2} ${roof - 40} ${right} ${roof + 20} L ${right} ${G} Z`);
  for (const m of masts) {
    out += rect(m - 5, G - 300, 10, 300);
    out += line(m, G - 300, m - 70, roof + 6, 2) + line(m, G - 300, m + 70, roof + 2, 2);
  }
  return out + windows(left + 20, roof + 40, right - left - 40, 50, 10, 16);
}

// ---------- Bristol ----------

function cliftonBridge(): string {
  const cliff = G - 250;
  const lx = 250;
  const rx = 830;
  const deck = cliff - 20;
  const towerTop = cliff - 190;
  const cableY = (x: number) => towerTop + 10 + (deck - 14 - towerTop - 10) * (1 - ((x - (lx + rx) / 2) / ((rx - lx) / 2)) ** 2);
  const pts: string[] = [];
  for (let x = lx; x <= rx; x += 10) pts.push(`${x},${r1(cableY(x))}`);
  let out = path(`M 0 ${G} L 0 ${cliff - 40} C 120 ${cliff - 50} 220 ${cliff - 10} 300 ${cliff + 10} C 340 ${cliff + 100} 360 ${G - 60} 400 ${G} Z`);
  out += path(`M ${W} ${G} L ${W} ${cliff - 60} C 960 ${cliff - 50} 860 ${cliff - 10} 780 ${cliff + 10} C 740 ${cliff + 100} 720 ${G - 60} 680 ${G} Z`);
  out += rect(lx - 10, deck, rx - lx + 20, 12);
  out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${NEAR}" stroke-width="6"/>`;
  for (let x = lx + 40; x < rx - 20; x += 30) out += line(x, cableY(x), x, deck, 2);
  const tower = (x: number) => rect(x - 26, towerTop, 52, cliff - towerTop + 20) + rect(x - 12, towerTop + 40, 24, 70, CUT) + path(`M ${x - 12} ${towerTop + 40} A 12 14 0 0 1 ${x + 12} ${towerTop + 40} Z`, CUT);
  out += tower(lx) + tower(rx);
  // Cabot Tower on the hill.
  out += rect(85, cliff - 190, 26, 152) + poly([[82, cliff - 188], [98, cliff - 240], [114, cliff - 188]]);
  return out;
}

function balloon(cx: number, cy: number): string {
  return [
    path(`M ${cx - 48} ${cy} A 48 52 0 1 1 ${cx + 48} ${cy} Q ${cx + 40} ${cy + 40} ${cx + 12} ${cy + 66} L ${cx - 12} ${cy + 66} Q ${cx - 40} ${cy + 40} ${cx - 48} ${cy} Z`, GOLD),
    stroke(`M ${cx} ${cy - 52} Q ${cx - 30} ${cy} ${cx - 8} ${cy + 66}`, 3, SUN),
    stroke(`M ${cx} ${cy - 52} Q ${cx + 30} ${cy} ${cx + 8} ${cy + 66}`, 3, SUN),
    line(cx - 10, cy + 66, cx - 8, cy + 84, 2),
    line(cx + 10, cy + 66, cx + 8, cy + 84, 2),
    rect(cx - 11, cy + 84, 22, 16),
  ].join("");
}

// ---------- Oxford ----------

function radcliffeCamera(cx: number): string {
  let out = rect(cx - 130, G - 120, 260, 120);
  for (let x = cx - 116; x <= cx + 106; x += 26) out += rect(x, G - 104, 10, 90, CUT, ` opacity="0.25"`);
  out += rect(cx - 95, G - 190, 190, 72);
  for (let x = cx - 80; x <= cx + 70; x += 24) out += rect(x, G - 180, 8, 52, CUT, ` opacity="0.3"`);
  out += path(`M ${cx - 96} ${G - 188} A 96 100 0 0 1 ${cx + 96} ${G - 188} Z`);
  out += rect(cx - 14, G - 330, 28, 46) + path(`M ${cx - 16} ${G - 328} A 16 22 0 0 1 ${cx + 16} ${G - 328} Z`) + rect(cx - 2, G - 370, 4, 24);
  return out;
}

function churchSpire(cx: number, h: number): string {
  const top = G - h;
  const towerTop = G - h * 0.45;
  return [
    rect(cx - 30, towerTop, 60, h * 0.45),
    rect(cx - 10, towerTop + 20, 20, 40, CUT, ` opacity="0.3"`),
    poly([[cx - 26, towerTop + 2], [cx, top], [cx + 26, towerTop + 2]]),
    pinnacle(cx - 28, towerTop + 2, 10, 34),
    pinnacle(cx + 28, towerTop + 2, 10, 34),
  ].join("");
}

function tomTower(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 150, G - 120, 300, 120),
    windows(cx - 135, G - 104, 270, 90, 8, 18),
    rect(cx - 45, top + 100, 90, h - 100),
    rect(cx - 30, top + 50, 60, 52),
    path(`M ${cx - 32} ${top + 52} Q ${cx - 34} ${top + 10} ${cx} ${top} Q ${cx + 34} ${top + 10} ${cx + 32} ${top + 52} Z`),
    pinnacle(cx - 42, top + 100, 12, 36),
    pinnacle(cx + 42, top + 100, 12, 36),
    rect(cx - 2, top - 26, 4, 28),
  ].join("");
}

// ---------- Cambridge ----------

function kingsChapel(x0: number, x1: number): string {
  const roof = G - 230;
  let out = rect(x0, roof, x1 - x0, 230);
  for (let x = x0 + 50; x < x1 - 40; x += 60) {
    out += path(`M ${x} ${G - 40} L ${x} ${roof + 70} Q ${x + 18} ${roof + 30} ${x + 36} ${roof + 70} L ${x + 36} ${G - 40} Z`, CUT, ` opacity="0.25"`);
    out += rect(x + 46, roof - 26, 8, 28) + pinnacle(x + 50, roof - 24, 10, 20);
  }
  const turret = (x: number) => rect(x - 18, roof - 110, 36, 112) + pinnacle(x, roof - 108, 36, 60) + pinnacle(x - 18, roof - 108, 8, 26) + pinnacle(x + 18, roof - 108, 8, 26);
  return out + turret(x0 + 6) + turret(x1 - 6);
}

function tree(cx: number, size: number): string {
  return rect(cx - 7, G - size * 0.6, 14, size * 0.6) + circle(cx, G - size * 0.85, size * 0.38) + circle(cx - size * 0.28, G - size * 0.62, size * 0.28) + circle(cx + size * 0.28, G - size * 0.62, size * 0.28);
}

// ---------- Brighton ----------

function i360(cx: number, h: number): string {
  return rect(cx - 9, G - h, 18, h) + ellipse(cx, G - h * 0.55, 66, 20) + rect(cx - 50, G - h * 0.55 - 3, 100, 6, CUT, ` opacity="0.35"`) + rect(cx - 40, G - 40, 80, 40);
}

function pier(x0: number, x1: number): string {
  const deck = G - 60;
  let out = rect(x0, deck, x1 - x0, 14);
  for (let x = x0 + 10; x < x1; x += 40) out += rect(x, deck + 14, 6, 46);
  const kiosk = (cx: number, w: number) => rect(cx - w / 2, deck - 50, w, 50) + path(`M ${cx - w / 2 + 6} ${deck - 48} Q ${cx} ${deck - 110} ${cx + w / 2 - 6} ${deck - 48} Z`) + rect(cx - 1.5, deck - 112, 3, 16);
  return out + kiosk(x0 + 200, 70) + kiosk(x0 + 360, 120) + kiosk(x1 - 60, 60);
}

function royalPavilion(x: number): string {
  const onion = (cx: number, baseY: number, r: number) =>
    path(`M ${cx - r} ${baseY} Q ${cx - r * 1.25} ${baseY - r * 1.1} ${cx} ${baseY - r * 2} Q ${cx + r * 1.25} ${baseY - r * 1.1} ${cx + r} ${baseY} Z`) + rect(cx - 1.5, baseY - r * 2 - 14, 3, 16);
  return [
    rect(x, G - 110, 300, 110),
    windows(x + 16, G - 90, 268, 70, 8, 16),
    rect(x + 110, G - 150, 80, 42),
    onion(x + 150, G - 148, 58),
    onion(x + 50, G - 108, 32),
    onion(x + 250, G - 108, 32),
    rect(x + 4, G - 190, 12, 80) + pinnacle(x + 10, G - 188, 14, 24),
    rect(x + 284, G - 190, 12, 80) + pinnacle(x + 290, G - 188, 14, 24),
  ].join("");
}

function gull(cx: number, cy: number): string {
  return stroke(`M ${cx - 18} ${cy} Q ${cx - 9} ${cy - 10} ${cx} ${cy} Q ${cx + 9} ${cy - 10} ${cx + 18} ${cy}`, 3);
}

// ---------- made-up skylines ----------

// Low, pale buildings behind everything, for depth.
function farSkyline(seed: number): string {
  const rand = rng(seed + 7);
  let out = "";
  let x = -20;
  while (x < W) {
    const w = 40 + rand() * 80;
    const h = 60 + rand() * 170;
    out += rect(x, G - h, w + 1, h, FAR);
    x += w;
  }
  return out;
}

// For places we haven't drawn: a town skyline made up from the place's
// name, so it's the same every time for the same place.
function madeUpSkyline(seed: number): string {
  const rand = rng(seed);
  let out = "";
  let x = -10;
  let spire = false;
  while (x < W) {
    const w = 70 + rand() * 110;
    const pick = rand();
    if (!spire && pick < 0.14 && x > 100 && x < W - 200) {
      out += churchSpire(x + 35, 260 + rand() * 120);
      x += 80;
      spire = true;
      continue;
    }
    const h = 90 + rand() * (pick > 0.85 ? 330 : 190);
    out += block(x, w, h, true);
    if (pick > 0.55 && pick <= 0.85 && h < 230) {
      out += poly([[x - 4, G - h], [x + w / 2, G - h - 46], [x + w + 4, G - h]]);
    }
    x += w + 6 + rand() * 20;
  }
  return out;
}

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function r1(n: number): number {
  return Math.round(n * 10) / 10;
}
