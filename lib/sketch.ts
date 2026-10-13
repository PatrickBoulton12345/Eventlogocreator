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

type Landmarks = {
  place: string;
  draw: () => string;
  // False leaves out the pale buildings behind, e.g. where they'd show
  // through a gorge.
  far?: boolean;
};

// ---------- the cities ----------

const LONDON: Landmarks = {
  place: "London",
  draw: () =>
    [
      // Tallest to shortest, as in life: the Shard, the Gherkin, the Eye,
      // St Paul's, Big Ben.
      londonEye(190, 175),
      scaled(430, 0.72, bigBen(430, 430)),
      block(452, 66, 80, true),
      stPauls(660),
      gherkin(850, 430),
      shard(990, 580),
    ].join(""),
};

const CITIES: Record<string, Landmarks> = {
  westminster: {
    place: "Westminster",
    draw: () =>
      [
        londonEye(190, 200),
        parliament(440, 960, 150),
        scaled(440, 0.9, bigBen(440, 460)),
        victoriaTower(950, 400),
      ].join(""),
  },
  southwark: {
    place: "Southwark",
    draw: () =>
      [
        // West to east: the cathedral and the Shard by London Bridge, then
        // Tower Bridge further down the river.
        cathedralTower(110, 190, 100),
        block(165, 80, 110, true),
        shard(330, 600),
        towerBridge(760),
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
        beetham(450, 470),
        // Deansgate Square's South Tower is the tallest in the city.
        deansgateTower(600, 560, 85),
        deansgateTower(705, 470, 80),
        deansgateTower(805, 400, 75),
        block(900, 120, 180, true),
      ].join(""),
  },
  liverpool: {
    place: "Liverpool",
    draw: () =>
      [
        liverBuilding(240),
        portBuilding(680),
        cathedralTower(960, 380, 120),
      ].join(""),
  },
  leeds: {
    place: "Leeds",
    draw: () =>
      [
        block(40, 120, 170, true),
        scaled(380, 0.85, leedsTownHall(380)),
        cornExchange(720),
        bridgewater(930, 520),
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
        cathedralSpire(560, 260),
        artsTower(720, 330),
        stPaulsTower(900, 430),
      ].join(""),
  },
  birmingham: {
    place: "Birmingham",
    draw: () =>
      [
        scaled(190, 0.72, libraryOfBirmingham(80)),
        btTower(420, 560),
        rotunda(560, 340),
        selfridges(720),
      ].join(""),
  },
  cardiff: {
    place: "Cardiff",
    draw: () => [shellKeep(0), cardiffCastle(170), stadium(630)].join(""),
  },
  bristol: {
    place: "Bristol",
    draw: () => [balloon(960, 170), cliftonBridge()].join(""),
    far: false,
  },
  oxford: {
    place: "Oxford",
    draw: () =>
      [
        // West to east: Tom Tower, the Radcliffe Camera, St Mary the
        // Virgin's spire, Magdalen Tower, and one more spire.
        tomTower(130, 300),
        radcliffeCamera(400),
        churchSpire(600, 420, true),
        magdalenTower(780, 330),
        block(860, 100, 150, true),
        churchSpire(1010, 300),
      ].join(""),
  },
  cambridge: {
    place: "Cambridge",
    draw: () =>
      [tree(90, 120), kingsChapel(200, 880), tree(980, 140), tree(1050, 100)].join(""),
  },
  lambeth: {
    place: "Lambeth",
    draw: () => [lambethPalace(150), londonEye(450, 175), mi6(850)].join(""),
  },
  hammersmith: {
    place: "Hammersmith & Fulham",
    draw: () => [hammersmithBridge(), cravenCottage(950)].join(""),
  },
  putney: {
    place: "Putney",
    // St Mary's, Putney and All Saints, Fulham at either end of the bridge.
    draw: () => [boathouses(0), churchTower(290, 230, 64, true), putneyBridge(330, 990), churchTower(1030, 220, 64)].join(""),
  },
  reading: {
    place: "Reading",
    draw: () => [abbeyGateway(10), maiwandLion(305), readingTownHall(560), blade(910, 470)].join(""),
  },
  miltonkeynes: {
    place: "Milton Keynes",
    draw: () =>
      [cow(30), cow(160), cow(290), centreMk(450, 760), cornerstone(890)].join(""),
  },
  kent: {
    place: "Kent",
    draw: () =>
      // Tunbridge Wells' Pantiles, an oast house, then Rochester's castle
      // keep and cathedral side by side as they stand.
      [oast(70), pantiles(140), rochesterKeep(570), rochesterCathedral(880)].join(""),
  },
  swindon: {
    place: "Swindon",
    draw: () => [dmjTower(110, 400), railwayWorks(230), steamLoco(620)].join(""),
  },
  leicester: {
    place: "Leicester",
    draw: () =>
      [
        cathedralSpire(170, 400, 80, 180),
        leicesterClock(420, 250),
        spaceCentre(650, 290),
        attenborough(880, 340),
      ].join(""),
  },
  brighton: {
    place: "Brighton",
    // West to east: the i360, the Royal Pavilion, the Palace Pier.
    draw: () => [i360(100, 580), royalPavilion(230), pier(570, 1060), gull(700, 240), gull(780, 300)].join(""),
  },
};

// Chapters (as lib/chapters.ts names them) and the city they're drawn as.
const CHAPTER_CITY: Record<string, string> = {
  Westminster: "westminster",
  Southwark: "southwark",
  Lambeth: "lambeth",
  "Hammersmith & Fulham": "hammersmith",
  Putney: "putney",
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
  "Reading & Berkshire": "reading",
  "Milton Keynes": "miltonkeynes",
  Kent: "kent",
  Swindon: "swindon",
  "Leicester / East Midlands": "leicester",
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
  const city = key ? CITIES[key] : null;
  const near = city ? city.draw() : madeUpSkyline(seed);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${SKY_TOP}"/><stop offset="1" stop-color="${SKY_BOTTOM}"/>`,
    `</linearGradient></defs>`,
    `<rect width="${W}" height="${G + 2}" fill="url(#sky)"/>`,
    circle(760, 300, 105, SUN),
    city?.far === false ? "" : farSkyline(seed),
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

// Draws `svg` at `k` times its size, keeping it standing on the ground
// at x = cx.
function scaled(cx: number, k: number, svg: string): string {
  return `<g transform="translate(${cx} ${G}) scale(${k}) translate(${-cx} ${-G})">${svg}</g>`;
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
    // The two west towers: stepped, with small domes and ball finials.
    rect(cx - 125, G - 190, 40, 80),
    rect(cx - 119, G - 222, 28, 34),
    ellipse(cx - 105, G - 222, 14, 16),
    circle(cx - 105, G - 242, 5),
    rect(cx + 85, G - 190, 40, 80),
    rect(cx + 91, G - 222, 28, 34),
    ellipse(cx + 105, G - 222, 14, 16),
    circle(cx + 105, G - 242, 5),
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
    path(`M ${cx - 32} ${G} C ${cx - 56} ${G - h * 0.45} ${cx - 50} ${top + 70} ${cx - 16} ${top + 10} Q ${cx} ${top - 4} ${cx + 16} ${top + 10} C ${cx + 50} ${top + 70} ${cx + 56} ${G - h * 0.45} ${cx + 32} ${G} Z`) +
    stroke(`M ${cx - 38} ${G - 40} C ${cx - 10} ${G - h * 0.3} ${cx + 30} ${G - h * 0.45} ${cx + 44} ${G - h * 0.6}`, 3, CUT).replace("/>", ` opacity="0.3"/>`) +
    stroke(`M ${cx - 46} ${G - h * 0.4} C ${cx - 20} ${G - h * 0.55} ${cx + 6} ${G - h * 0.7} ${cx + 18} ${top + 30}`, 3, CUT).replace("/>", ` opacity="0.3"/>`)
  );
}

function shard(cx: number, h: number): string {
  const top = G - h;
  return (
    poly([[cx - 85, G], [cx - 6, top + 40], [cx + 85, G]]) +
    // The glass shards splaying apart at the top.
    poly([[cx - 16, top + 70], [cx - 12, top], [cx - 2, top + 56]]) +
    poly([[cx - 2, top + 60], [cx + 8, top + 14], [cx + 12, top + 72]]) +
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
  // Castle Rock: sheer crags on the west, a tail sloping away east down
  // the Royal Mile.
  const rock = `M 90 ${G} L 112 ${G - 120} L 128 ${G - 150} L 150 ${G - 165} L 168 ${G - 200} L 230 ${G - 212} L 300 ${G - 225} L 740 ${G - 215} L 790 ${G - 200} L 830 ${G - 165} L 880 ${G - 120} C 930 ${G - 80} 980 ${G - 40} 1040 ${G} Z`;
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
    rect(744, top - 4, 76, 40),
  ].join("");
}

// The Scott Monument: a broad base on four legs round a tall pointed
// arch, two galleries, then a slim spire.
function scottMonument(cx: number, h: number): string {
  const top = G - h;
  const g1 = G - 150;
  const g2 = G - 250;
  return [
    rect(cx - 56, g1, 112, 150),
    path(`M ${cx - 24} ${G} L ${cx - 24} ${G - 80} Q ${cx - 24} ${G - 118} ${cx} ${G - 128} Q ${cx + 24} ${G - 118} ${cx + 24} ${G - 80} L ${cx + 24} ${G} Z`, CUT),
    rect(cx - 64, g1 - 8, 128, 10),
    pinnacle(cx - 56, g1 - 8, 12, 60),
    pinnacle(cx + 56, g1 - 8, 12, 60),
    poly([[cx - 42, g1 - 6], [cx - 30, g2], [cx + 30, g2], [cx + 42, g1 - 6]]),
    rect(cx - 8, g1 - 74, 16, 44, CUT, ` opacity="0.35"`),
    rect(cx - 38, g2 - 8, 76, 10),
    pinnacle(cx - 32, g2 - 8, 10, 50),
    pinnacle(cx + 32, g2 - 8, 10, 50),
    poly([[cx - 22, g2 - 6], [cx, top], [cx + 22, g2 - 6]]),
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

// Beetham Tower: the flats in the upper half overhang the hotel floors
// below on one side, and a glass blade stands above the roof.
function beetham(x: number, h: number): string {
  const top = G - h;
  const step = G - h * 0.45;
  let out = rect(x, step, 90, G - step) + rect(x - 18, top, 108, step - top + 1) + rect(x + 80, top - 40, 6, 42);
  for (let y = top + 14; y < G - 10; y += 22) {
    out += y < step ? rect(x - 10, y, 92, 2, CUT, ` opacity="0.25"`) : rect(x + 8, y, 74, 2, CUT, ` opacity="0.25"`);
  }
  return out;
}

function deansgateTower(x: number, h: number, w: number): string {
  const top = G - h;
  return poly([[x, G], [x, top + 30], [x + w, top], [x + w, G]]) + windows(x + 12, top + 46, w - 24, h - 60, 6, 12);
}

// ---------- Liverpool ----------

function liverBuilding(cx: number): string {
  const roof = G - 220;
  const tower = (x: number, flip: boolean) =>
    [
      rect(x - 32, roof - 110, 64, 112),
      clockFace(x, roof - 66, 20),
      rect(x - 24, roof - 150, 48, 42),
      path(`M ${x - 26} ${roof - 148} A 26 34 0 0 1 ${x + 26} ${roof - 148} Z`),
      liverBird(x, roof - 186, flip),
    ].join("");
  return [
    rect(cx - 190, roof, 380, 220),
    windows(cx - 172, roof + 18, 344, 186, 8, 14),
    // The two Liver Birds look in opposite directions.
    tower(cx - 120, false),
    tower(cx + 120, true),
  ].join("");
}

function liverBird(cx: number, baseY: number, flip = false): string {
  const X = (dx: number) => cx + (flip ? -dx : dx);
  return [
    rect(cx - 1.5, baseY - 14, 3, 16),
    path(`M ${X(-4)} ${baseY - 14} Q ${X(-6)} ${baseY - 34} ${X(4)} ${baseY - 40} Q ${X(12)} ${baseY - 38} ${X(8)} ${baseY - 30} L ${X(4)} ${baseY - 14} Z`),
    path(`M ${X(0)} ${baseY - 30} Q ${X(-22)} ${baseY - 44} ${X(-26)} ${baseY - 26} Q ${X(-12)} ${baseY - 28} ${X(0)} ${baseY - 22} Z`),
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
    // Small domes on drums at the corners.
    rect(cx - 128, roof - 22, 20, 24),
    path(`M ${cx - 130} ${roof - 20} A 12 15 0 0 1 ${cx - 106} ${roof - 20} Z`),
    rect(cx + 108, roof - 22, 20, 24),
    path(`M ${cx + 106} ${roof - 20} A 12 15 0 0 1 ${cx + 130} ${roof - 20} Z`),
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
  const apex = G - 270;
  const deck = G - 100;
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

function cathedralSpire(cx: number, h: number, w = 60, nave = 140): string {
  const top = G - h;
  const half = w / 2;
  return rect(cx - nave / 2, G - 120, nave, 120) + rect(cx - half, top + 130, w, h - 130) + poly([[cx - half + 4, top + 132], [cx, top], [cx + half - 4, top + 132]]) + pinnacle(cx - half + 2, top + 132, 10, 34) + pinnacle(cx + half - 2, top + 132, 10, 34);
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
    rings(x - 3, G - 200, 236, 88),
    rings(x + 18, G - 282, 184, 70),
    // The gold rotunda on the roof.
    rect(x + 75, G - 330, 70, 42, GOLD),
  ].join("");
}

// The Library's facade of interlocking metal rings.
function rings(x: number, y: number, w: number, h: number): string {
  let out = "";
  for (let ry = y + 14; ry < y + h - 6; ry += 24) {
    for (let rx = x + 14; rx < x + w - 6; rx += 24) {
      out += `<circle cx="${rx}" cy="${ry}" r="11" fill="none" stroke="${CUT}" stroke-width="2" opacity="0.35"/>`;
    }
  }
  return out;
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
  let out = rect(cx - 55, G - h, 110, h, NEAR, ` rx="5"`);
  for (let y = G - h + 20; y < G - 10; y += 20) out += rect(cx - 45, y, 90, 5, CUT, ` opacity="0.25"`);
  return out;
}

function selfridges(x: number): string {
  const d = `M ${x} ${G} C ${x - 10} ${G - 120} ${x + 60} ${G - 200} ${x + 150} ${G - 190} C ${x + 250} ${G - 180} ${x + 300} ${G - 110} ${x + 300} ${G} Z`;
  let discs = "";
  for (let y = G - 180; y < G - 10; y += 26) {
    for (let dx = 10; dx < 300; dx += 26) discs += circle(x + dx, y, 7, CUT, ` opacity="0.3"`);
  }
  // Keeps the discs inside the building's curves.
  return path(d) + `<clipPath id="selfridges"><path d="${d}"/></clipPath><g clip-path="url(#selfridges)">${discs}</g>`;
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

// Cardiff Castle's Norman shell keep, a many-sided stone ring on its
// grassy mound.
function shellKeep(x: number): string {
  return [
    path(`M ${x} ${G} C ${x + 30} ${G - 100} ${x + 130} ${G - 100} ${x + 160} ${G} Z`),
    rect(x + 36, G - 160, 88, 90),
    battlements(x + 36, G - 160, 88, 10),
    rect(x + 66, G - 196, 28, 40),
    battlements(x + 66, G - 196, 28, 7),
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
    out += line(m, G - 300, Math.max(m - 70, left + 4), m - 70 < left ? roof + 18 : roof + 6, 2);
    out += line(m, G - 300, Math.min(m + 70, right - 4), m + 70 > right ? roof + 18 : roof + 2, 2);
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
  out += rect(80, cliff - 170, 40, 140) + rect(74, cliff - 128, 52, 8) + rect(88, cliff - 206, 24, 38) + poly([[86, cliff - 204], [100, cliff - 244], [114, cliff - 204]]);
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
  out += rect(cx - 84, G - 190, 168, 72);
  for (let x = cx - 72; x <= cx + 64; x += 22) out += rect(x, G - 180, 8, 52, CUT, ` opacity="0.3"`);
  out += path(`M ${cx - 96} ${G - 188} A 96 100 0 0 1 ${cx + 96} ${G - 188} Z`);
  out += rect(cx - 14, G - 330, 28, 46) + path(`M ${cx - 16} ${G - 328} A 16 22 0 0 1 ${cx + 16} ${G - 328} Z`) + rect(cx - 2, G - 370, 4, 24);
  return out;
}

// A church tower and spire. `grand` adds the tall pinnacles round the
// spire's foot, as on Oxford's University Church of St Mary.
function churchSpire(cx: number, h: number, grand = false): string {
  const top = G - h;
  const towerTop = G - h * 0.45;
  const corner = grand ? 90 : 34;
  return [
    rect(cx - 30, towerTop, 60, h * 0.45),
    rect(cx - 10, towerTop + 20, 20, 40, CUT, ` opacity="0.3"`),
    poly([[cx - 26, towerTop + 2], [cx, top], [cx + 26, towerTop + 2]]),
    pinnacle(cx - 28, towerTop + 2, grand ? 14 : 10, corner),
    pinnacle(cx + 28, towerTop + 2, grand ? 14 : 10, corner),
    grand ? pinnacle(cx - 12, towerTop + 2, 8, corner * 0.7) + pinnacle(cx + 12, towerTop + 2, 8, corner * 0.7) : "",
  ].join("");
}

// Magdalen Tower: square, battlemented, a pinnacle at each corner and no
// spire.
function magdalenTower(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 36, top, 72, h),
    battlements(cx - 36, top, 72, 9),
    pinnacle(cx - 32, top - 8, 12, 46),
    pinnacle(cx + 32, top - 8, 12, 46),
    rect(cx - 16, top + 30, 12, 50, CUT, ` opacity="0.3"`),
    rect(cx + 4, top + 30, 12, 50, CUT, ` opacity="0.3"`),
  ].join("");
}

function tomTower(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 110, G - 120, 220, 120),
    windows(cx - 95, G - 104, 190, 90, 8, 18),
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

// The i360: a very slim pole with a glass viewing ring around it.
function i360(cx: number, h: number): string {
  const podY = G - h * 0.55;
  return rect(cx - 9, G - h, 18, h) + ellipse(cx, podY, 36, 11) + rect(cx - 30, podY - 2, 60, 4, CUT, ` opacity="0.45"`) + rect(cx - 40, G - 40, 80, 40);
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
    onion(x + 100, G - 108, 14),
    onion(x + 200, G - 108, 14),
    // Slim minarets, each with a tiny onion on top.
    rect(x + 6, G - 196, 8, 88) + onion(x + 10, G - 194, 9),
    rect(x + 286, G - 196, 8, 88) + onion(x + 290, G - 194, 9),
  ].join("");
}

function gull(cx: number, cy: number): string {
  return stroke(`M ${cx - 18} ${cy} Q ${cx - 9} ${cy - 10} ${cx} ${cy} Q ${cx + 9} ${cy - 10} ${cx + 18} ${cy}`, 3);
}

// ---------- Lambeth ----------

// Lambeth Palace's gatehouse, Morton's Tower: two square brick towers
// either side of the arch.
function lambethPalace(cx: number): string {
  const tower = (x: number) => rect(x - 36, G - 230, 72, 230) + battlements(x - 36, G - 230, 72, 12) + windows(x - 22, G - 200, 44, 150, 8, 18);
  return [
    rect(cx - 140, G - 110, 280, 110),
    battlements(cx - 140, G - 110, 280, 12),
    tower(cx - 62),
    tower(cx + 62),
    rect(cx - 26, G - 190, 52, 190),
    battlements(cx - 26, G - 190, 52, 10),
    path(`M ${cx - 18} ${G} L ${cx - 18} ${G - 70} L ${cx} ${G - 98} L ${cx + 18} ${G - 70} L ${cx + 18} ${G} Z`, CUT),
  ].join("");
}

// The SIS building at Vauxhall Cross: stepped tiers rising to the middle.
function mi6(cx: number): string {
  const tiers: [number, number][] = [[420, 90], [360, 150], [300, 200], [240, 245], [200, 270]];
  let out = "";
  for (const [w, h] of tiers) {
    out += rect(cx - w / 2, G - h, w, h);
    out += rect(cx - w / 2 + 10, G - h + 14, w - 20, 10, CUT, ` opacity="0.3"`);
  }
  return out + windows(cx - 180, G - 70, 360, 60, 8, 14);
}

// ---------- Hammersmith & Fulham, Putney ----------

// Hammersmith Bridge: a suspension bridge with short side spans, whose
// two towers are open frames topped with little turrets.
function hammersmithBridge(): string {
  const deck = G - 70;
  const [a, b] = [300, 780];
  const [left, right] = [140, 940];
  const top = G - 290;
  const high = top + 20;
  const low = deck - 12;
  const chainY = (x: number) => {
    if (x <= a) return high + ((a - x) / (a - left)) * (low - high);
    if (x >= b) return high + ((x - b) / (right - b)) * (low - high);
    return high + (deck - 16 - high) * (1 - ((x - (a + b) / 2) / ((b - a) / 2)) ** 2);
  };
  const pts: string[] = [];
  for (let x = left; x <= right; x += 10) pts.push(`${x},${r1(chainY(x))}`);
  let out = rect(0, deck, W, 16);
  out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${NEAR}" stroke-width="7"/>`;
  for (let x = left + 30; x < right - 20; x += 28) {
    const y = chainY(x);
    if (y < deck - 8 && Math.abs(a - x) > 40 && Math.abs(b - x) > 40) out += line(x, y, x, deck, 2);
  }
  for (const t of [a, b]) {
    out += rect(t - 44, top + 30, 22, G - top - 30) + rect(t + 22, top + 30, 22, G - top - 30);
    out += rect(t - 44, top + 30, 88, 26) + rect(t - 44, top + 120, 88, 14);
    out += rect(t - 50, top + 18, 100, 14);
    for (const dx of [-38, 0, 38]) out += rect(t + dx - 9, top - 14, 18, 34) + ellipse(t + dx, top - 16, 11, 14) + rect(t + dx - 1.5, top - 40, 3, 16);
  }
  return out;
}

// Craven Cottage, Fulham FC's red-brick pavilion by the river.
function cravenCottage(x: number): string {
  return [
    rect(x, G - 100, 110, 100),
    poly([[x - 6, G - 98], [x + 55, G - 150], [x + 116, G - 98]]),
    rect(x + 14, G - 76, 18, 24, CUT, ` opacity="0.35"`),
    rect(x + 46, G - 76, 18, 24, CUT, ` opacity="0.35"`),
    rect(x + 78, G - 76, 18, 24, CUT, ` opacity="0.35"`),
    rect(x + 53.5, G - 196, 3, 50),
    rect(x + 56.5, G - 196, 24, 14, GOLD),
  ].join("");
}

// Putney Bridge: a long, low granite bridge on five shallow arches, the
// middle one widest.
function putneyBridge(x0: number, x1: number): string {
  const deck = G - 120;
  let out = rect(x0, deck, x1 - x0, 26) + rect(x0, deck - 18, x1 - x0, 8);
  for (let x = x0 + 10; x < x1; x += 30) out += rect(x, deck - 22, 8, 12);
  out += rect(x0, deck + 26, x1 - x0, G - deck - 26);
  const spans = [112, 129, 144, 129, 112];
  const pier = 24;
  const scale = (x1 - x0 - pier * (spans.length + 1)) / spans.reduce((a, b) => a + b, 0);
  let ax = x0 + pier;
  for (const span of spans) {
    const aw = span * scale;
    out += path(`M ${r1(ax)} ${G} L ${r1(ax)} ${deck + 66} A ${r1(aw / 2)} ${r1(aw / 6)} 0 0 1 ${r1(ax + aw)} ${deck + 66} L ${r1(ax + aw)} ${G} Z`, CUT);
    ax += aw + pier;
  }
  return out;
}

// A squat, battlemented church tower with small corner pinnacles, and a
// round stair turret on one corner if asked.
function churchTower(cx: number, h: number, w: number, stairTurret = false): string {
  const top = G - h;
  return [
    rect(cx - w / 2, top, w, h),
    battlements(cx - w / 2, top, w, 8),
    pinnacle(cx - w / 2 + 4, top - 8, 8, 24),
    pinnacle(cx + w / 2 - 4, top - 8, 8, 24),
    rect(cx - 8, top + 30, 16, 40, CUT, ` opacity="0.3"`),
    stairTurret ? rect(cx + w / 2 - 6, top - 30, 18, h + 30, NEAR, ` rx="8"`) : "",
  ].join("");
}

// The rowing clubs' boathouses along the Embankment.
function boathouses(x: number): string {
  let out = "";
  for (let i = 0; i < 3; i++) {
    const bx = x + i * 82;
    out += rect(bx, G - 120, 78, 120) + poly([[bx - 4, G - 118], [bx + 39, G - 165], [bx + 82, G - 118]]);
    out += rect(bx + 6, G - 60, 66, 6) + rect(bx + 14, G - 100, 50, 26, CUT, ` opacity="0.3"`);
  }
  return out;
}

// ---------- Reading ----------

// The Abbey Gateway, the one intact piece of Reading Abbey: a boxy,
// battlemented gatehouse over a pointed arch, beside a stub of ruined
// flint wall.
function abbeyGateway(x: number): string {
  return [
    poly([[x, G], [x, G - 70], [x + 20, G - 86], [x + 36, G - 60], [x + 50, G - 76], [x + 60, G]]),
    rect(x + 60, G - 150, 150, 150),
    battlements(x + 60, G - 150, 150, 12),
    rect(x + 60, G - 176, 22, 30) + rect(x + 188, G - 176, 22, 30),
    path(`M ${x + 115} ${G} L ${x + 115} ${G - 60} L ${x + 135} ${G - 88} L ${x + 155} ${G - 60} L ${x + 155} ${G} Z`, CUT),
    rect(x + 90, G - 128, 14, 26, CUT, ` opacity="0.35"`),
    rect(x + 166, G - 128, 14, 26, CUT, ` opacity="0.35"`),
  ].join("");
}

// The Maiwand Lion in the Forbury Gardens, roaring on its tall plinth.
function maiwandLion(cx: number): string {
  const top = G - 130;
  return [
    rect(cx - 60, top, 120, 130),
    rect(cx - 68, top - 8, 136, 10),
    path(`M ${cx - 46} ${top - 50} Q ${cx - 40} ${top - 66} ${cx + 30} ${top - 60} Q ${cx + 50} ${top - 56} ${cx + 48} ${top - 38} L ${cx - 46} ${top - 38} Z`),
    rect(cx - 44, top - 40, 10, 32) + rect(cx - 26, top - 40, 10, 32) + rect(cx + 20, top - 40, 10, 32) + rect(cx + 36, top - 40, 10, 32),
    // Mane, snout, and the tuft at the end of the tail.
    circle(cx - 50, top - 68, 28),
    poly([[cx - 72, top - 76], [cx - 92, top - 62], [cx - 74, top - 50]]),
    stroke(`M ${cx + 48} ${top - 54} Q ${cx + 70} ${top - 64} ${cx + 66} ${top - 86}`, 5),
    circle(cx + 66, top - 88, 7),
  ].join("");
}

// Reading Town Hall: Victorian brick with gables and a slim clock tower.
function readingTownHall(cx: number): string {
  let out = rect(cx - 170, G - 150, 340, 150);
  for (const gx of [cx - 130, cx - 50, cx + 50, cx + 130]) out += poly([[gx - 34, G - 148], [gx, G - 196], [gx + 34, G - 148]]);
  out += windows(cx - 150, G - 130, 300, 110, 8, 18);
  // The clock tower stands towards one end, not in the middle.
  const tx = cx + 110;
  const top = G - 290;
  out += rect(tx - 26, top + 100, 52, 190) + clockFace(tx, top + 136, 16);
  out += poly([[tx - 28, top + 102], [tx, top], [tx + 28, top + 102]]);
  out += pinnacle(tx - 26, top + 102, 8, 30) + pinnacle(tx + 26, top + 102, 8, 30);
  return out;
}

// The Blade: Reading's tallest building, with its spike on top.
function blade(cx: number, h: number): string {
  const top = G - h;
  return poly([[cx - 60, G], [cx - 60, top + 150], [cx + 60, top + 100], [cx + 60, G]]) +
    // The slim lattice spike rising from the roof's high end.
    poly([[cx + 42, top + 104], [cx + 52, top], [cx + 58, top + 102]]) +
    windows(cx - 46, top + 170, 92, h - 190, 6, 10);
}

// ---------- Milton Keynes ----------

// One of the Concrete Cows, facing right: a boxy body, a lowered head
// with ear nubs, an udder and a tail.
function cow(x: number): string {
  return [
    rect(x, G - 72, 92, 38, NEAR, ` rx="10"`),
    poly([[x + 86, G - 70], [x + 104, G - 70], [x + 118, G - 46], [x + 106, G - 38], [x + 90, G - 50]]),
    poly([[x + 94, G - 70], [x + 92, G - 80], [x + 102, G - 72]]),
    rect(x + 6, G - 36, 10, 36) + rect(x + 22, G - 36, 10, 36) + rect(x + 66, G - 36, 10, 36) + rect(x + 80, G - 36, 10, 36),
    ellipse(x + 50, G - 32, 10, 6),
    line(x + 2, G - 66, x - 8, G - 40, 3),
  ].join("");
}

// The shopping centre: long, low and flat-roofed, in glass and white
// steel.
function centreMk(x0: number, x1: number): string {
  let out = rect(x0, G - 90, x1 - x0, 90) + rect(x0 - 10, G - 98, x1 - x0 + 20, 8);
  out += rect(x0 + 8, G - 74, x1 - x0 - 16, 30, CUT, ` opacity="0.22"`);
  for (let x = x0 + 30; x < x1 - 40; x += 80) out += rect(x, G - 28, 50, 6, CUT, ` opacity="0.3"`);
  return out;
}

// Church of Christ the Cornerstone: a domed church with a tall bell tower.
function cornerstone(cx: number): string {
  return [
    rect(cx - 110, G - 130, 220, 130),
    windows(cx - 95, G - 112, 190, 90, 8, 18),
    rect(cx - 70, G - 180, 140, 52),
    path(`M ${cx - 76} ${G - 178} A 76 84 0 0 1 ${cx + 76} ${G - 178} Z`),
    rect(cx - 10, G - 296, 20, 36),
    rect(cx - 2, G - 332, 4, 38),
    rect(cx - 12, G - 320, 24, 4),
    rect(cx + 120, G - 320, 44, 320),
    rect(cx + 128, G - 300, 28, 40, CUT, ` opacity="0.3"`),
    rect(cx + 140.5, G - 352, 3, 34),
    rect(cx + 132, G - 340, 20, 3),
  ].join("");
}

// ---------- Kent ----------

// An oast house: a round kiln with a steep cone and a white cowl.
function oast(cx: number): string {
  return [
    rect(cx - 44, G - 110, 88, 110),
    poly([[cx - 50, G - 108], [cx - 10, G - 240], [cx + 10, G - 240], [cx + 50, G - 108]]),
    // The white cowl, hooded, with its wind vane.
    path(`M ${cx - 12} ${G - 238} L ${cx - 12} ${G - 270} Q ${cx - 6} ${G - 292} ${cx + 18} ${G - 282} L ${cx + 18} ${G - 262} L ${cx + 12} ${G - 238} Z`, CUT),
    rect(cx + 18, G - 276, 18, 4),
  ].join("");
}

// Rochester Castle's square Norman keep: a turret at each corner, the
// south-east one round (rebuilt after the siege of 1215), and narrow
// slit windows.
function rochesterKeep(cx: number): string {
  const top = G - 300;
  let out = rect(cx - 140, G - 90, 280, 90) + battlements(cx - 140, G - 90, 280, 12);
  out += rect(cx - 100, top, 200, 300) + battlements(cx - 100, top, 200, 14);
  out += rect(cx - 100, top - 44, 36, 46) + battlements(cx - 100, top - 44, 36, 9);
  out += rect(cx + 60, top - 50, 46, 350, NEAR, ` rx="4"`) + battlements(cx + 60, top - 50, 46, 9);
  for (let wy = top + 40; wy < G - 70; wy += 60) {
    for (const wx of [cx - 60, cx - 14, cx + 30]) out += rect(wx, wy, 6, 28, CUT, ` opacity="0.35"`);
  }
  return out;
}

// Rochester Cathedral: a gabled west front between two small turrets,
// the nave, and a square central tower with a short spire.
function rochesterCathedral(cx: number): string {
  return [
    rect(cx - 150, G - 130, 330, 130),
    poly([[cx - 150, G - 130], [cx - 140, G - 150], [cx + 170, G - 150], [cx + 180, G - 130]]),
    windows(cx - 70, G - 112, 230, 86, 8, 22),
    rect(cx - 170, G - 170, 90, 170),
    poly([[cx - 170, G - 170], [cx - 125, G - 210], [cx - 80, G - 170]]),
    rect(cx - 178, G - 230, 18, 230) + pinnacle(cx - 169, G - 230, 18, 30),
    rect(cx - 90, G - 230, 18, 230) + pinnacle(cx - 81, G - 230, 18, 30),
    path(`M ${cx - 140} ${G} L ${cx - 140} ${G - 50} A 15 18 0 0 1 ${cx - 110} ${G - 50} L ${cx - 110} ${G} Z`, CUT, ` opacity="0.35"`),
    rect(cx + 20, G - 250, 76, 120),
    battlements(cx + 20, G - 250, 76, 9),
    poly([[cx + 30, G - 250], [cx + 58, G - 310], [cx + 86, G - 250]]),
  ].join("");
}

// The Pantiles in Tunbridge Wells: a colonnade of slim pillars under the
// shopfronts' upper floors, and a tree.
function pantiles(x: number): string {
  let out = rect(x, G - 170, 210, 110) + poly([[x - 6, G - 168], [x + 105, G - 198], [x + 216, G - 168]]);
  out += windows(x + 16, G - 150, 180, 70, 10, 20);
  out += rect(x - 4, G - 64, 218, 8);
  for (let px = x + 4; px < x + 210; px += 34) out += rect(px, G - 60, 7, 60);
  return out + tree(x + 250, 120);
}

// ---------- Swindon ----------

// The David Murray John Tower, the town's tallest.
function dmjTower(cx: number, h: number): string {
  let out = rect(cx - 50, G - h, 100, h) + rect(cx - 56, G - h, 112, 12);
  for (let y = G - h + 28; y < G - 16; y += 28) out += rect(cx - 42, y, 84, 8, CUT, ` opacity="0.25"`);
  return out;
}

// The old Great Western Railway works: saw-tooth roofed sheds and a
// tall chimney.
function railwayWorks(x: number): string {
  let out = rect(x, G - 120, 370, 120);
  for (let tx = x; tx < x + 370; tx += 62) out += poly([[tx, G - 118], [tx, G - 172], [tx + 62, G - 118]]);
  out += windows(x + 16, G - 96, 340, 70, 10, 16);
  out += rect(x + 300, G - 280, 30, 170) + rect(x + 296, G - 286, 38, 10);
  return out;
}

// A Great Western 4-6-0 steam engine: copper-capped chimney, brass dome,
// square-topped Belpaire firebox, three big driving wheels behind a
// small leading pair. With a puff of smoke.
function steamLoco(x: number): string {
  const wheel = (cx: number, r: number) => circle(cx, G - r, r) + circle(cx, G - r, r * 0.32, CUT, ` opacity="0.6"`);
  return [
    circle(x + 80, G - 250, 28, FAR),
    circle(x + 120, G - 280, 38, FAR),
    circle(x + 180, G - 300, 46, FAR),
    rect(x + 40, G - 170, 210, 80, NEAR, ` rx="20"`),
    rect(x + 20, G - 160, 40, 70),
    rect(x + 68, G - 206, 22, 40),
    path(`M ${x + 62} ${G - 206} L ${x + 96} ${G - 206} L ${x + 92} ${G - 196} L ${x + 66} ${G - 196} Z`, GOLD),
    ellipse(x + 160, G - 172, 20, 16),
    rect(x + 240, G - 186, 50, 96),
    rect(x + 280, G - 236, 110, 160),
    rect(x + 270, G - 246, 130, 14),
    rect(x + 300, G - 214, 34, 42, CUT, ` opacity="0.6"`),
    rect(x + 10, G - 92, 380, 20),
    rect(x + 4, G - 104, 10, 24),
    wheel(x + 50, 20),
    wheel(x + 92, 20),
    wheel(x + 160, 44),
    wheel(x + 252, 44),
    wheel(x + 344, 44),
    rect(x + 160, G - 50, 184, 8),
  ].join("");
}

// ---------- Leicester ----------

// The Haymarket Memorial Clock Tower.
function leicesterClock(cx: number, h: number): string {
  const top = G - h;
  return [
    rect(cx - 40, G - 120, 80, 120),
    path(`M ${cx - 18} ${G} L ${cx - 18} ${G - 70} L ${cx} ${G - 96} L ${cx + 18} ${G - 70} L ${cx + 18} ${G} Z`, CUT),
    rect(cx - 44, G - 130, 8, 130) + rect(cx + 36, G - 130, 8, 130),
    rect(cx - 34, G - 180, 68, 62),
    clockFace(cx, G - 150, 20),
    pinnacle(cx - 34, G - 180, 10, 34),
    pinnacle(cx + 34, G - 180, 10, 34),
    poly([[cx - 26, G - 178], [cx, top], [cx + 26, G - 178]]),
  ].join("");
}

// The National Space Centre's Rocket Tower: a tall, soft-sided capsule
// with its rocket standing inside.
function spaceCentre(cx: number, h: number): string {
  const top = G - h;
  let out = path(`M ${cx - 66} ${G} L ${cx - 70} ${top + 90} Q ${cx - 70} ${top} ${cx} ${top} Q ${cx + 70} ${top} ${cx + 70} ${top + 90} L ${cx + 66} ${G} Z`);
  for (let y = top + 40; y < G - 20; y += 34) out += rect(cx - 58, y, 116, 3, CUT, ` opacity="0.2"`);
  out += `<g opacity="0.45">${rect(cx - 12, top + 70, 24, h - 80, CUT)}${poly([[cx - 12, top + 72], [cx, top + 26], [cx + 12, top + 72]], CUT)}${poly([[cx - 12, G - 60], [cx - 30, G - 14], [cx - 12, G - 26]], CUT)}${poly([[cx + 12, G - 60], [cx + 30, G - 14], [cx + 12, G - 26]], CUT)}</g>`;
  return out;
}

// The University of Leicester's Attenborough Tower, a tall slab.
function attenborough(cx: number, h: number): string {
  let out = rect(cx - 50, G - h, 100, h) + rect(cx - 54, G - h, 108, 12);
  for (let y = G - h + 26; y < G - 16; y += 22) out += rect(cx - 42, y, 84, 7, CUT, ` opacity="0.25"`);
  return out;
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
