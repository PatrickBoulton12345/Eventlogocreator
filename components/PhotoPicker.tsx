"use client";

import { useEffect, useRef, useState } from "react";
import type { PostData } from "@/lib/types";
import type { CityPhoto } from "@/lib/photos";

type Props = {
  data: PostData;
  onChange: (next: PostData) => void;
};

// Offers photos of the chapter's city for the card background. The first
// one is picked automatically; the organiser can click another, upload
// their own, or go without.
export function PhotoPicker({ data, onChange }: Props) {
  const [photos, setPhotos] = useState<CityPhoto[]>([]);
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);

  // Newest form values, so a search that finishes late doesn't undo
  // anything typed in the meantime.
  const latest = useRef(data);
  latest.current = data;
  // The photo we chose automatically, so a new chapter can replace it —
  // but never a photo the organiser picked or uploaded themselves.
  const autoPicked = useRef("");

  const chapter = data.chapter.trim();

  useEffect(() => {
    if (!chapter) {
      setPhotos([]);
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
        setPhotos(json.photos ?? []);
        setPlace(json.place ?? "");

        const current = latest.current;
        const first = json.photos?.[0];
        const untouched = !current.photoUrl || current.photoUrl === autoPicked.current;
        if (first && untouched) {
          autoPicked.current = first.url;
          onChange({ ...current, photoUrl: first.url, photoCredit: first.credit });
        }
      } catch {
        if (!cancelled) setPhotos([]);
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
    onChange({ ...latest.current, photoUrl: url, photoCredit: credit });

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
            Photos of {place}. Click one to use it.
          </p>
          <div className="grid grid-cols-4 gap-2">
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
