"use client";

import { useRef } from "react";
import {
  EVENT_TYPES,
  type EventType,
  type PostData,
  type Socials,
} from "@/lib/types";
import { findChapterSocials } from "@/lib/chapters";

type Props = {
  data: PostData;
  onChange: (next: PostData) => void;
};

export function EventForm({ data, onChange }: Props) {
  // Remembers what we last auto-filled for instagram / twitter so we only
  // overwrite our own autofill — never a value the organiser typed by hand.
  const autofilled = useRef<{ instagram: string; twitter: string }>({
    instagram: "",
    twitter: "",
  });

  const set = <K extends keyof PostData>(key: K, value: PostData[K]) =>
    onChange({ ...data, [key]: value });

  // Keeps the newest form values to hand, so the map lookup below can
  // finish late without undoing anything typed in the meantime.
  const latest = useRef(data);
  latest.current = data;

  const setLocation = (value: string) => {
    // A new address means the old map pin no longer belongs to it.
    onChange({ ...data, location: value, lat: null, lng: null });
  };

  // Finds the venue on the map once the organiser leaves the field, which
  // is what the map at the bottom of the pub social card is drawn around.
  const findOnMap = async (location: string) => {
    const q = location.trim();
    if (!q) return;
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const found = (await res.json()) as { lat?: number; lng?: number };
      if (typeof found.lat !== "number" || typeof found.lng !== "number") return;
      const current = latest.current;
      if (current.location.trim() !== q) return;
      onChange({ ...current, lat: found.lat, lng: found.lng });
    } catch {
      // Couldn't find it — the card simply leaves the map off.
    }
  };

  const setSocial = (key: keyof Socials, value: string) => {
    // If the organiser edits Instagram or Twitter by hand, stop treating
    // that value as ours so a later chapter change won't replace it.
    if (key === "instagram" || key === "twitter") {
      autofilled.current[key] = value;
    }
    onChange({ ...data, socials: { ...data.socials, [key]: value } });
  };

  const setChapter = (value: string) => {
    const match = findChapterSocials(value);
    let nextSocials = data.socials;

    if (match) {
      const tryFill = (key: "instagram" | "twitter", incoming?: string) => {
        if (!incoming) return;
        const current = nextSocials[key];
        // Only fill if the field is empty or still holds our last autofill.
        if (current === "" || current === autofilled.current[key]) {
          nextSocials = { ...nextSocials, [key]: incoming };
          autofilled.current[key] = incoming;
        }
      };
      tryFill("instagram", match.instagram);
      tryFill("twitter", match.twitter);
    }

    onChange({ ...data, chapter: value, socials: nextSocials });
  };

  return (
    <div className="font-body flex flex-col gap-8">
      <Section title="Event type" required>
        <div className="grid grid-cols-2 gap-3">
          {EVENT_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("eventType", opt.value)}
              className={
                "rounded-md border-2 px-4 py-3 text-left text-base font-medium transition " +
                (data.eventType === opt.value
                  ? "border-black bg-black text-[#EBE3D0]"
                  : "border-black/15 bg-white text-black hover:border-black/40")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {data.eventType === "custom" && (
        <Field
          label="Custom event name"
          required
          hint="Will appear as the headline (lowercase). Keep it short — 1-3 words."
        >
          <input
            type="text"
            value={data.customEventLabel}
            onChange={(e) => set("customEventLabel", e.target.value)}
            placeholder="e.g. growth summit"
            className={inputCx}
            maxLength={40}
          />
        </Field>
      )}

      <Section title="The basics">
        <Field
          label="Chapter name"
          required
          hint="Type your chapter (e.g. LFG Reading) — Instagram and X handles fill in automatically if we have them on file."
        >
          <input
            type="text"
            value={data.chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. LFG Manchester"
            className={inputCx}
          />
        </Field>
        <Field label="Location" required>
          <input
            type="text"
            value={data.location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => findOnMap(data.location)}
            placeholder="e.g. The Castle, Manchester M4 1ND"
            className={inputCx}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" required>
            <input
              type="date"
              value={data.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputCx}
            />
          </Field>
          <Field label="Start time" required>
            <input
              type="time"
              value={data.time}
              onChange={(e) => set("time", e.target.value)}
              className={inputCx}
            />
          </Field>
        </div>
      </Section>

      <Section title="Optional details">
        <Field label="Sign-up link">
          <input
            type="url"
            value={data.signupUrl}
            onChange={(e) => set("signupUrl", e.target.value)}
            placeholder="https://lookingforgrowth.uk/manchester/hack"
            className={inputCx}
          />
        </Field>
        <Field label="Contact email">
          <input
            type="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="manchester@lookingforgrowth.uk"
            className={inputCx}
          />
        </Field>
      </Section>

      <Section title="Chapter socials">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Instagram">
            <SocialInput
              value={data.socials.instagram}
              onChange={(v) => setSocial("instagram", v)}
              placeholder="lfgmanchester"
            />
          </Field>
          <Field label="Facebook">
            <SocialInput
              value={data.socials.facebook}
              onChange={(v) => setSocial("facebook", v)}
              placeholder="lfgmanchester"
            />
          </Field>
          <Field label="TikTok">
            <SocialInput
              value={data.socials.tiktok}
              onChange={(v) => setSocial("tiktok", v)}
              placeholder="lfgmanchester"
            />
          </Field>
          <Field label="LinkedIn">
            <SocialInput
              value={data.socials.linkedin}
              onChange={(v) => setSocial("linkedin", v)}
              placeholder="lfg-manchester"
            />
          </Field>
          <Field label="X (Twitter)">
            <SocialInput
              value={data.socials.twitter}
              onChange={(v) => setSocial("twitter", v)}
              placeholder="lfgmanchester"
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}

const inputCx =
  "w-full rounded-md border-2 border-black/15 bg-white px-3 py-2.5 text-base text-black placeholder:text-black/35 focus:border-black focus:outline-none";

function Section({
  title,
  required,
  children,
}: {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b-2 border-black/15 pb-2">
        <h2 className="font-headline text-xl font-bold tracking-tight">
          {title}
        </h2>
        {required && <span className="text-[#FE5500] font-bold">*</span>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-black/80">
        {label}
        {required && <span className="text-[#FE5500] ml-1">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-black/55">{hint}</span>}
    </label>
  );
}

function SocialInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex">
      <span className="inline-flex items-center rounded-l-md border-2 border-r-0 border-black/15 bg-black/5 px-3 text-black/60">
        @
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/^@+/, ""))}
        placeholder={placeholder}
        className={inputCx + " rounded-l-none"}
      />
    </div>
  );
}
