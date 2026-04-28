export type EventType = "hackathon" | "litter-pick" | "pub-meeting" | "custom";

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "hackathon", label: "Hackathon" },
  { value: "litter-pick", label: "Litter Pick" },
  { value: "pub-meeting", label: "Pub Meeting" },
  { value: "custom", label: "Custom" },
];

export type Socials = {
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  twitter: string;
};

export type PostData = {
  eventType: EventType;
  customEventLabel: string;
  chapter: string;
  location: string;
  date: string;
  time: string;
  signupUrl: string;
  email: string;
  socials: Socials;
};

export const EMPTY_POST: PostData = {
  eventType: "hackathon",
  customEventLabel: "",
  chapter: "",
  location: "",
  date: "",
  time: "",
  signupUrl: "",
  email: "",
  socials: { instagram: "", facebook: "", tiktok: "", linkedin: "", twitter: "" },
};

export function getEventTypeLabel(data: PostData): string {
  if (data.eventType === "custom") {
    return data.customEventLabel.trim().toLowerCase() || "your event";
  }
  if (data.eventType === "hackathon") return "hackathon";
  if (data.eventType === "litter-pick") return "litter pick";
  return "pub meeting";
}

export function validate(data: PostData): string[] {
  const missing: string[] = [];
  if (!data.chapter.trim()) missing.push("Chapter name");
  if (!data.location.trim()) missing.push("Location");
  if (!data.date.trim()) missing.push("Date");
  if (!data.time.trim()) missing.push("Time");
  if (data.eventType === "custom" && !data.customEventLabel.trim()) {
    missing.push("Custom event name");
  }
  return missing;
}

export function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const weekday = date.toLocaleString("en-GB", { weekday: "long", timeZone: "UTC" });
  return `${weekday} ${day} ${month}`;
}

export function formatTimeForDisplay(time: string): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h >= 12 ? "pm" : "am";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  if (m === 0) return `${displayHour}${period}`;
  return `${displayHour}:${m.toString().padStart(2, "0")}${period}`;
}

export function buildExportFilename(data: PostData): string {
  const chapter = (data.chapter || "lfg")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const type =
    data.eventType === "custom"
      ? data.customEventLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : data.eventType;
  const date = data.date || "tbc";
  return `${chapter}-${type}-${date}.jpg`;
}
