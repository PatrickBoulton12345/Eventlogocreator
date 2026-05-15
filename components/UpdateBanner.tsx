"use client";

import { useEffect, useState } from "react";

// Bump the version suffix to re-show the banner after a future update.
const STORAGE_KEY = "lfg-event-creator-banner-dismissed-v1";

export function UpdateBanner() {
  // Start hidden so the server-rendered markup matches the first client
  // paint; flip to visible after we've checked localStorage.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — fall back to in-session dismissal
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-[#FE5500] text-black border-b-2 border-black/10">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 text-sm font-body">
          <span className="inline-flex items-center rounded-full bg-black px-2 py-0.5 text-[#FE5500] text-xs font-bold uppercase tracking-wider shrink-0">
            New
          </span>
          <span>
            Type your chapter name (e.g. <strong>LFG Reading</strong>) and we'll
            fill in the Instagram and X handles automatically.
          </span>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss update"
          className="shrink-0 rounded-md border-2 border-black/20 bg-black/0 px-2 py-1 text-sm font-medium text-black hover:bg-black hover:text-[#FE5500] transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
