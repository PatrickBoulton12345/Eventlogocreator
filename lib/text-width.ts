// How wide a line of Octarine Bold really is.
//
// The posters size their headlines to fill the card without running off
// the edge, which means knowing the width of the words before they're
// drawn. Guessing from the number of letters isn't good enough — an "m"
// is over three times the width of an "i", so "Cambridge" is a fifth
// wider than "Edinburgh" despite both being nine letters.
//
// The table below is each character's width as a multiple of the font
// size, measured from the real Octarine Bold font file in a browser
// (`ctx.measureText` at 1000px). Adding up the characters lands within
// about 1% of the browser's own measurement of the whole word.

const OCTARINE_BOLD: Record<string, number> = {
  "0": 0.755, "1": 0.418, "2": 0.65, "3": 0.661, "4": 0.665, "5": 0.688,
  "6": 0.63, "7": 0.529, "8": 0.656, "9": 0.63,
  A: 0.73, B: 0.769, C: 0.821, D: 0.806, E: 0.629, F: 0.588, G: 0.856,
  H: 0.793, I: 0.333, J: 0.47, K: 0.693, L: 0.551, M: 1.033, N: 0.814,
  O: 0.872, P: 0.722, Q: 0.866, R: 0.755, S: 0.688, T: 0.611, U: 0.78,
  V: 0.744, W: 1.245, X: 0.727, Y: 0.687, Z: 0.67,
  a: 0.656, b: 0.659, c: 0.596, d: 0.659, e: 0.636, f: 0.368, g: 0.654,
  h: 0.632, i: 0.297, j: 0.29, k: 0.584, l: 0.293, m: 0.958, n: 0.631,
  o: 0.646, p: 0.659, q: 0.659, r: 0.47, s: 0.547, t: 0.388, u: 0.631,
  v: 0.567, w: 0.915, x: 0.56, y: 0.565, z: 0.529,
  " ": 0.3, "&": 0.761, "/": 0.434, "-": 0.504, "–": 0.504, "'": 0.188,
  ".": 0.257, ",": 0.259, ":": 0.257,
};

// Anything unusual (an accent, an emoji) gets a middling width rather
// than counting as nothing.
const FALLBACK_WIDTH = 0.66;

// A little slack so a 1% measuring error can't push a headline over the
// edge of the card.
const SAFETY = 1.02;

export function textWidth(
  text: string,
  fontSize: number,
  letterSpacingEm = 0,
): number {
  let units = 0;
  for (const ch of text) {
    units += OCTARINE_BOLD[ch] ?? FALLBACK_WIDTH;
    units += letterSpacingEm;
  }
  return units * fontSize * SAFETY;
}

// The biggest font size at which the text still fits the width given.
export function fitToWidth(
  text: string,
  maxWidth: number,
  idealSize: number,
  letterSpacingEm = 0,
): number {
  const atOne = textWidth(text, 1, letterSpacingEm);
  if (atOne <= 0) return idealSize;
  return Math.floor(Math.min(idealSize, maxWidth / atOne));
}

// Breaks text into lines that each fit the width, filling one line
// before starting the next ("Leicester / East Midlands" becomes
// "Leicester / East" and "Midlands" rather than a word per line).
export function wrapToWidth(
  text: string,
  maxWidth: number,
  fontSize: number,
  letterSpacingEm = 0,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (
      current &&
      textWidth(candidate, fontSize, letterSpacingEm) > maxWidth
    ) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}
