// Chapter → social handles lookup, sourced from
// "LFG Socials_ Chapters [INTERNAL]". Used to autofill the Instagram
// and Twitter (X) fields when an organiser types the chapter name.
//
// Match logic: we strip "lfg" and punctuation from the typed chapter,
// then check whether any of a chapter's `keywords` appears as a
// whole-word match. First matching entry wins (order matters for
// overlapping names — e.g. South West vs South Wales).

export type ChapterSocials = {
  instagram?: string;
  twitter?: string;
};

type ChapterEntry = {
  name: string;
  keywords: string[]; // lowercase tokens / phrases to match against the typed chapter
  socials: ChapterSocials;
};

// Order matters: more specific multi-word keywords are listed before
// shorter ones that could overlap (e.g. "south west" before "south").
const CHAPTERS: ChapterEntry[] = [
  {
    name: "Hammersmith & Fulham",
    keywords: ["hammersmith", "fulham"],
    socials: { twitter: "lfghammersmith" },
  },
  {
    name: "Reading & Berkshire",
    keywords: ["reading", "berkshire"],
    socials: { instagram: "lfgreading", twitter: "lfgreading" },
  },
  {
    name: "South West England",
    keywords: ["south west england", "south west", "southwest"],
    socials: { instagram: "lfgsouthwest", twitter: "lfgsouthwest" },
  },
  {
    name: "South Wales",
    keywords: ["south wales"],
    socials: { twitter: "LFG_SouthWales" },
  },
  {
    name: "West Midlands",
    keywords: ["west midlands"],
    socials: { instagram: "lfg_west_midlands", twitter: "LFG_WM" },
  },
  {
    name: "Leicester / East Midlands",
    keywords: ["leicester", "leceister", "east midlands"],
    socials: { twitter: "LFG_Leicester" },
  },
  {
    name: "Milton Keynes",
    keywords: ["milton keynes"],
    socials: {},
  },
  {
    name: "Kent",
    keywords: ["kent", "rochester", "tunbridge wells", "tunbridge", "tonbridge"],
    socials: { instagram: "lookingforgrowthrochester", twitter: "lfgrochester" },
  },
  {
    name: "Barnet",
    keywords: ["barnet"],
    socials: { twitter: "barnetlfg" },
  },
  {
    name: "Brighton",
    keywords: ["brighton"],
    socials: {},
  },
  {
    name: "Cambridge",
    keywords: ["cambridge"],
    socials: { twitter: "lfg_cambridge" },
  },
  {
    name: "Ealing",
    keywords: ["ealing"],
    socials: {},
  },
  {
    name: "Edinburgh",
    keywords: ["edinburgh"],
    socials: {},
  },
  {
    name: "Lambeth",
    keywords: ["lambeth"],
    socials: { instagram: "lambethlfgchapter" },
  },
  {
    name: "Leeds",
    keywords: ["leeds"],
    socials: { instagram: "lfgleeds", twitter: "lfg_leeds" },
  },
  {
    name: "Liverpool",
    keywords: ["liverpool"],
    socials: {},
  },
  {
    name: "Manchester",
    keywords: ["manchester"],
    socials: { twitter: "LFGManchester" },
  },
  {
    name: "Newcastle",
    keywords: ["newcastle"],
    socials: { twitter: "lfg_newcastle" },
  },
  {
    name: "Oxford",
    keywords: ["oxford"],
    socials: {},
  },
  {
    name: "Putney",
    keywords: ["putney"],
    socials: {},
  },
  {
    name: "Sheffield",
    keywords: ["sheffield"],
    socials: { instagram: "lfgsheffield", twitter: "lfgsheffield" },
  },
  {
    name: "Southwark",
    keywords: ["southwark"],
    socials: {},
  },
  {
    name: "Swindon",
    keywords: ["swindon"],
    socials: {},
  },
  {
    name: "Westminster",
    keywords: ["westminster"],
    socials: { instagram: "lfgwestminster", twitter: "lfg_westminster" },
  },
];

function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[@&/]/g, " ")
    .replace(/\blfg\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesKeyword(haystack: string, keyword: string): boolean {
  const pattern = new RegExp(`(?:^|\\s)${keyword.replace(/\s+/g, "\\s+")}(?:\\s|$)`);
  return pattern.test(haystack);
}

export function findChapterSocials(chapterName: string): ChapterSocials | null {
  const cleaned = normalise(chapterName);
  if (!cleaned) return null;

  for (const entry of CHAPTERS) {
    for (const keyword of entry.keywords) {
      if (matchesKeyword(cleaned, keyword)) {
        return entry.socials;
      }
    }
  }
  return null;
}
