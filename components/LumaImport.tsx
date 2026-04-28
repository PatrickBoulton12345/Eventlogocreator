"use client";

import { useState } from "react";
import type { PostData } from "@/lib/types";
import type { LumaImported } from "@/lib/luma";

type Props = {
  data: PostData;
  onChange: (next: PostData) => void;
};

export function LumaImport({ data, onChange }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<LumaImported | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleImport() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/luma?url=${encodeURIComponent(trimmed)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `Import failed (${res.status})`);
      }
      const imported = json as LumaImported;
      const conflicts = listConflicts(data, imported);
      if (conflicts.length > 0) {
        setPending(imported);
      } else {
        applyImport(imported);
        setSuccess("Imported");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't import";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function applyImport(imported: LumaImported) {
    onChange({
      ...data,
      customEventLabel:
        data.eventType === "custom" && imported.name
          ? imported.name.toLowerCase()
          : data.customEventLabel,
      location: imported.location || data.location,
      date: imported.date || data.date,
      time: imported.time || data.time,
      signupUrl: imported.signupUrl || data.signupUrl,
    });
    setUrl("");
  }

  function confirmOverwrite() {
    if (!pending) return;
    applyImport(pending);
    setPending(null);
    setSuccess("Imported");
  }

  return (
    <div className="font-body rounded-lg border-2 border-black/15 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="font-headline text-lg font-bold tracking-tight">
          import from luma
        </span>
        <span className="text-xs text-black/55">optional</span>
      </div>
      <p className="text-sm text-black/65">
        Paste a Luma event link (lu.ma or luma.com) and we&apos;ll fill in the
        location, date, time, and sign-up URL.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
            setSuccess(null);
          }}
          placeholder="https://lu.ma/your-event"
          disabled={loading}
          className="flex-1 rounded-md border-2 border-black/15 bg-white px-3 py-2.5 text-base text-black placeholder:text-black/35 focus:border-black focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={loading || !url.trim()}
          className={
            "rounded-md px-5 py-2.5 text-base font-bold transition " +
            (loading || !url.trim()
              ? "bg-black/10 text-black/40 cursor-not-allowed"
              : "bg-[#FE5500] text-white hover:bg-[#e04800] cursor-pointer")
          }
        >
          {loading ? "Importing…" : "Import"}
        </button>
      </div>
      {error && (
        <div className="rounded-md border-2 border-red-400/50 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}
      {success && !error && (
        <div className="rounded-md border-2 border-[#79CAC4]/50 bg-[#79CAC4]/10 p-3 text-sm text-black/80">
          {success} — review the form below before downloading.
        </div>
      )}

      {pending && (
        <OverwriteModal
          conflicts={listConflicts(data, pending)}
          onCancel={() => setPending(null)}
          onConfirm={confirmOverwrite}
        />
      )}
    </div>
  );
}

function listConflicts(data: PostData, imported: LumaImported): string[] {
  const out: string[] = [];
  if (
    imported.location &&
    data.location &&
    data.location !== imported.location
  ) {
    out.push(`Location: "${data.location}" → "${imported.location}"`);
  }
  if (imported.date && data.date && data.date !== imported.date) {
    out.push(`Date: ${data.date} → ${imported.date}`);
  }
  if (imported.time && data.time && data.time !== imported.time) {
    out.push(`Time: ${data.time} → ${imported.time}`);
  }
  if (
    imported.signupUrl &&
    data.signupUrl &&
    data.signupUrl !== imported.signupUrl
  ) {
    out.push("Sign-up link will be replaced");
  }
  if (
    data.eventType === "custom" &&
    imported.name &&
    data.customEventLabel &&
    data.customEventLabel.toLowerCase() !== imported.name.toLowerCase()
  ) {
    out.push(
      `Custom event name: "${data.customEventLabel}" → "${imported.name.toLowerCase()}"`,
    );
  }
  return out;
}

function OverwriteModal({
  conflicts,
  onCancel,
  onConfirm,
}: {
  conflicts: string[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-body"
      onClick={onCancel}
    >
      <div
        className="max-w-md w-full rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-headline text-2xl font-bold tracking-tight mb-2">
          overwrite existing details?
        </h3>
        <p className="text-sm text-black/70 mb-4">
          You&apos;ve already filled in some fields. Importing will replace
          them with what&apos;s on the Luma page:
        </p>
        <ul className="text-sm text-black/85 mb-6 list-disc pl-5 flex flex-col gap-1.5">
          {conflicts.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border-2 border-black/15 bg-white px-4 py-2 text-sm font-medium text-black hover:border-black/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-[#FE5500] px-4 py-2 text-sm font-bold text-white hover:bg-[#e04800]"
          >
            Overwrite
          </button>
        </div>
      </div>
    </div>
  );
}
