"use client";

import { useEffect, useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import { Poster } from "./Poster";
import {
  buildExportFilename,
  PHOTO_FRAMING_RESET,
  PHOTO_ZOOM_MAX,
  validate,
  type PostData,
} from "@/lib/types";
import { POSTER_HEIGHT, POSTER_WIDTH } from "./posters/PosterFrame";

type Props = { data: PostData; onChange: (next: PostData) => void };

export function PostPreview({ data, onChange }: Props) {
  const posterRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    function recalc() {
      const w = wrapperRef.current;
      if (!w) return;
      const availableW = w.clientWidth;
      const availableH = window.innerHeight - 240;
      const sW = availableW / POSTER_WIDTH;
      const sH = availableH / POSTER_HEIGHT;
      setScale(Math.min(sW, sH, 0.6));
    }
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // Dragging the preview moves the photo behind the words.
  const drag = useRef<{ x: number; y: number; photoX: number; photoY: number } | null>(
    null,
  );
  const hasPhoto = !!data.photoUrl;
  const zoom = data.photoZoom ?? 1;

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!hasPhoto) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      photoX: data.photoX ?? 50,
      photoY: data.photoY ?? 50,
    };
  }

  function moveDrag(e: React.PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start) return;
    // Screen pixels → share of the card; dragging right shows more of the
    // photo's left side, as if pulling the photo along with the pointer.
    const across = (e.clientX - start.x) / (POSTER_WIDTH * scale);
    const down = (e.clientY - start.y) / (POSTER_HEIGHT * scale);
    const speed = 150 / zoom;
    onChange({
      ...data,
      photoX: clampPercent(start.photoX - across * speed),
      photoY: clampPercent(start.photoY - down * speed),
    });
  }

  function endDrag() {
    drag.current = null;
  }

  const missing = validate(data);
  const canDownload = missing.length === 0;

  async function download() {
    if (!posterRef.current || !canDownload) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(posterRef.current, {
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        pixelRatio: 1,
        cacheBust: true,
        quality: 0.95,
        style: { transform: "none" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = buildExportFilename(data);
      link.click();
    } catch (err) {
      console.error(err);
      alert("Couldn't export. Check the browser console for details.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={wrapperRef}
        className="relative bg-black/5 rounded-lg p-4 flex items-center justify-center overflow-hidden"
        style={{ minHeight: 400 }}
      >
        <div
          style={{
            width: POSTER_WIDTH * scale,
            height: POSTER_HEIGHT * scale,
            position: "relative",
          }}
        >
          <div
            ref={posterRef}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            // Stops the browser picking up the photo itself as a dragged image.
            onDragStart={(e) => e.preventDefault()}
            style={{
              cursor: hasPhoto ? (drag.current ? "grabbing" : "grab") : undefined,
              touchAction: hasPhoto ? "none" : undefined,
              userSelect: "none",
              width: POSTER_WIDTH,
              height: POSTER_HEIGHT,
              position: "absolute",
              top: 0,
              left: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Poster data={data} />
          </div>
        </div>
      </div>

      {hasPhoto && (
        <div className="font-body flex flex-col gap-2 rounded-md border-2 border-black/10 bg-white p-3">
          <div className="text-sm text-black/70">
            <span className="font-medium text-black">Move the photo:</span> drag it on
            the preview above.
          </div>
          <label className="flex items-center gap-3 text-sm text-black/70">
            <span className="font-medium text-black">Zoom</span>
            <input
              type="range"
              min={1}
              max={PHOTO_ZOOM_MAX}
              step={0.05}
              value={zoom}
              onChange={(e) => onChange({ ...data, photoZoom: Number(e.target.value) })}
              className="flex-1 accent-[#FE5500]"
            />
            <button
              type="button"
              onClick={() => onChange({ ...data, ...PHOTO_FRAMING_RESET })}
              className="text-black/55 underline hover:text-black"
            >
              Reset
            </button>
          </label>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="text-xs text-black/55 font-body">
          Output size: 1080 × 1350 px (Instagram portrait)
        </div>
        <button
          type="button"
          disabled={!canDownload || downloading}
          onClick={download}
          className={
            "font-headline rounded-md px-6 py-4 text-lg font-bold tracking-tight transition " +
            (canDownload
              ? "bg-[#FE5500] text-white hover:bg-[#e04800] cursor-pointer"
              : "bg-black/10 text-black/40 cursor-not-allowed")
          }
        >
          {downloading ? "Exporting…" : "Download JPG"}
        </button>
        {!canDownload && (
          <div className="rounded-md border-2 border-[#FE5500]/40 bg-[#FE5500]/5 p-3 text-sm text-black/75 font-body">
            <div className="font-medium mb-1">Still needed:</div>
            <ul className="list-disc pl-5">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function clampPercent(n: number): number {
  return Math.min(100, Math.max(0, n));
}
