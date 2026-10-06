"use client";

import { useEffect, useRef, useState } from "react";
import { PHOTO_FRAMING_RESET, type PostData } from "@/lib/types";
import type { CityPhoto } from "@/lib/photos";

type Props = {
  data: PostData;
  onChange: (next: PostData) => void;
};

// Offers photos of the chapter's city for the card background. The first
// one is picked automatically; the organiser can click another, upload
// their own, or go without.
export function PhotoPicker({ data, onChange }: Props) {
  // Every page of photos fetched so far for this chapter; the arrows step
  // through them, and the right arrow searches for more past the last.
  const [pages, setPages] = useState<CityPhoto[][]>([]);
  const [page, setPage] = useState(0);
  const [noMore, setNoMore] = useState(false);
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const photos = pages[page] ?? [];

  // Newest form values, so a search that finishes late doesn't undo
  // anything typed in the meantime.
  const latest = useRef(data);
  latest.current = data;
  // The photo we chose automatically, so a new chapter can replace it —
  // but never a photo the organiser picked or uploaded themselves.
  const autoPicked = useRef("");

  const chapter = data.chapter.trim();

  useEffect(() => {
    setPages([]);
    setPage(0);
    setNoMore(false);
    if (!chapter) {
      setPlace("");
      return;
    }
    let cancelled = false;
    // Wait for the organiser to stop typing before searching.
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/photos?chapter=${encodeURIComponent(chapter)}`);
        const json = (await res.json()) as { place: string; photos: CityPhoto[] };
        if (cancelled) return;
        setPages(json.photos?.length ? [json.photos] : []);
        setPlace(json.place ?? "");

        const current = latest.current;
        const first = json.photos?.[0];
        const untouched = !current.photoUrl || current.photoUrl === autoPicked.current;
        if (first && untouched) {
          autoPicked.current = first.url;
          onChange({
            ...current,
            ...PHOTO_FRAMING_RESET,
            photoUrl: first.url,
            photoCredit: first.credit,
          });
        }
      } catch {
        if (!cancelled) setPages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // onChange is a fresh function every render; the chapter is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  const choose = (url: string, credit: string) =>
    onChange({ ...latest.current, ...PHOTO_FRAMING_RESET, photoUrl: url, photoCredit: credit });

  // Shows the next eight, searching further if we haven't fetched them yet.
  const showMore = async () => {
    if (page + 1 < pages.length) {
      setPage(page + 1);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/photos?chapter=${encodeURIComponent(chapter)}&page=${pages.length + 1}`,
      );
      const json = (await res.json()) as { photos: CityPhoto[] };
      if (latest.current.chapter.trim() !== chapter) return;
      // Leave out any we've already shown.
      const shown = new Set(pages.flat().map((p) => p.url));
      const fresh = (json.photos ?? []).filter((p) => !shown.has(p.url));
      if (fresh.length === 0) {
        setNoMore(true);
        return;
      }
      setPages([...pages, fresh]);
      setPage(pages.length);
    } catch {
      setNoMore(true);
    } finally {
      setLoading(false);
    }
  };

  const atEnd = noMore && page === pages.length - 1;

  const upload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") choose(reader.result, "");
    };
    reader.readAsDataURL(file);
  };

  const uploaded = !!data.photoUrl?.startsWith("data:");

  return (
    <div className="flex flex-col gap-3">
      {!chapter && (
        <p className="text-sm text-black/55">
          Type your chapter name above and photos of your city will appear here.
        </p>
      )}
      {chapter && loading && photos.length === 0 && (
        <p className="text-sm text-black/55">Finding photos…</p>
      )}
      {chapter && !loading && photos.length === 0 && (
        <p className="text-sm text-black/55">
          No photos found for {place || chapter}. Upload your own below.
        </p>
      )}

      {photos.length > 0 && (
        <>
          <p className="text-sm text-black/55">
            Photos of {place}. Click one to use it, or use the arrow for more.
          </p>
          <div className="flex items-stretch gap-2">
          {page > 0 && (
            <ArrowButton direction="left" onClick={() => setPage(page - 1)} />
          )}
          <div className="grid flex-1 grid-cols-4 gap-2">
            {photos.map((p) => {
              const selected = data.photoUrl === p.url;
              return (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => choose(p.url, p.credit)}
                  title={p.credit}
                  className={
                    "relative aspect-[4/5] overflow-hidden rounded-md border-2 transition " +
                    (selected
                      ? "border-[#FE5500] ring-2 ring-[#FE5500]"
                      : "border-black/10 hover:border-black/40")
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.thumb} alt="" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
          <ArrowButton
            direction="right"
            onClick={showMore}
            disabled={loading || atEnd}
            label={loading ? "Finding more photos" : atEnd ? "No more photos found" : "More photos"}
          />
          </div>
          {atEnd && (
            <p className="text-xs text-black/55">
              That&apos;s all the photos we could find. Upload your own if none of these work.
            </p>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label
          className={
            "cursor-pointer rounded-md border-2 px-3 py-2 font-medium transition " +
            (uploaded
              ? "border-[#FE5500] bg-[#FE5500]/10"
              : "border-black/15 bg-white hover:border-black/40")
          }
        >
          {uploaded ? "Using your photo · change" : "Upload your own photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
        {data.photoUrl && (
          <button
            type="button"
            onClick={() => choose("", "")}
            className="text-black/55 underline hover:text-black"
          >
            No photo
          </button>
        )}
      </div>
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled = false,
  label,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const name = label ?? (direction === "left" ? "Previous photos" : "More photos");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={name}
      title={name}
      className={
        "flex w-10 shrink-0 items-center justify-center rounded-md border-2 text-xl font-bold transition " +
        (disabled
          ? "cursor-not-allowed border-black/10 bg-black/5 text-black/25"
          : "border-black/15 bg-white text-black hover:border-black hover:bg-[#FE5500] hover:text-white")
      }
    >
      {direction === "left" ? "←" : "→"}
    </button>
  );
}
