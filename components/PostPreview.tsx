"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Poster } from "./Poster";
import {
  buildExportFilename,
  validate,
  type PostData,
} from "@/lib/types";
import { POSTER_HEIGHT, POSTER_WIDTH } from "./posters/PosterFrame";

type Props = { data: PostData };

export function PostPreview({ data }: Props) {
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

  const missing = validate(data);
  const canDownload = missing.length === 0;

  async function download() {
    if (!posterRef.current || !canDownload) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        pixelRatio: 1,
        cacheBust: true,
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
            style={{
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
          {downloading ? "Exporting…" : "Download PNG"}
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
