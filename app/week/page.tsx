"use client";

import { useState } from "react";
import Link from "next/link";
import { LfgWordmark } from "@/components/Wordmark";

type WeekEvent = {
  name: string;
  startDate: string;
  date: string;
  url: string;
  caption: string;
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default function WeekPage() {
  const [days, setDays] = useState(7);
  const [events, setEvents] = useState<WeekEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWeek(nextDays = days) {
    setLoading(true);
    setError(null);
    setEvents(null);
    try {
      const res = await fetch(`/api/week?days=${nextDays}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Failed (${res.status})`);
      setEvents(json.events as WeekEvent[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function downloadZip() {
    setZipping(true);
    setError(null);
    try {
      const res = await fetch(`/api/week-zip?days=${days}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Failed to build ZIP (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `lfg-event-cards-${today}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't build the ZIP");
    } finally {
      setZipping(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b-2 border-black/10 bg-[#EBE3D0]">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LfgWordmark color="#000" size={28} />
            <span className="hidden sm:inline-block text-xs text-black/55 font-body uppercase tracking-[0.2em]">
              This Week&apos;s Cards
            </span>
          </div>
          <Link
            href="/"
            className="text-xs text-black/55 font-body underline hover:text-black"
          >
            ← back to single card
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight leading-none mb-2">
            this week&apos;s events
          </h1>
          <p className="font-body text-black/65 max-w-2xl">
            Pulls every upcoming LFG event from the Luma calendar, builds a card
            for each, and lets you download them all in one ZIP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <label className="font-body text-sm text-black/65">
            Next{" "}
            <select
              value={days}
              onChange={(e) => {
                const v = Number(e.target.value);
                setDays(v);
                if (events) loadWeek(v);
              }}
              className="border-2 border-black/15 rounded-md px-2 py-1 bg-white font-bold"
            >
              <option value={7}>7</option>
              <option value={14}>14</option>
              <option value={30}>30</option>
              <option value={90}>90</option>
            </select>{" "}
            days
          </label>

          <button
            type="button"
            onClick={() => loadWeek()}
            disabled={loading}
            className={
              "rounded-md px-5 py-2.5 text-base font-bold transition " +
              (loading
                ? "bg-black/10 text-black/40 cursor-not-allowed"
                : "bg-[#FE5500] text-white hover:bg-[#e04800] cursor-pointer")
            }
          >
            {loading ? "Checking…" : "Check upcoming events"}
          </button>

          {events && events.length > 0 && (
            <button
              type="button"
              onClick={downloadZip}
              disabled={zipping}
              className={
                "rounded-md px-5 py-2.5 text-base font-bold transition " +
                (zipping
                  ? "bg-black/10 text-black/40 cursor-not-allowed"
                  : "bg-black text-white hover:bg-black/80 cursor-pointer")
              }
            >
              {zipping ? "Building ZIP…" : `Download all ${events.length} as ZIP`}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-md border-2 border-red-400/50 bg-red-50 p-3 text-sm text-red-900 mb-6 font-body">
            {error}
          </div>
        )}

        {events && events.length === 0 && (
          <p className="font-body text-black/65">
            No LFG events found in the next {days} days.
          </p>
        )}

        {events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev) => (
              <div key={ev.url} className="flex flex-col gap-3">
                <div className="font-body">
                  <div className="font-headline text-xl font-bold tracking-tight leading-tight">
                    {ev.name}
                  </div>
                  <div className="text-sm text-black/60">
                    {formatDate(ev.date)}
                  </div>
                </div>
                <div className="border-2 border-black/10 rounded-lg overflow-hidden bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/card?luma=${encodeURIComponent(ev.url)}`}
                    alt={`${ev.name} card`}
                    width={1080}
                    height={1350}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                </div>
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-body text-xs text-black/50 underline hover:text-black break-all"
                >
                  {ev.url}
                </a>
                <Caption text={ev.caption} />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t-2 border-black/10 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-4 text-xs text-black/55 font-body">
          LFG Event Post Creator · this week&apos;s cards
        </div>
      </footer>
    </main>
  );
}

function Caption({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — the textarea below is selectable as a fallback.
    }
  }

  return (
    <div className="border-2 border-black/10 bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black/10">
        <span className="font-body text-xs font-bold uppercase tracking-[0.15em] text-black/55">
          caption
        </span>
        <button
          type="button"
          onClick={copy}
          className={
            "font-body text-xs font-bold px-3 py-1 transition " +
            (copied
              ? "bg-[#79CAC4] text-black"
              : "bg-[#FE5500] text-white hover:bg-[#e04800] cursor-pointer")
          }
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre className="font-body text-xs text-black/80 whitespace-pre-wrap p-3 m-0">
        {text}
      </pre>
    </div>
  );
}
