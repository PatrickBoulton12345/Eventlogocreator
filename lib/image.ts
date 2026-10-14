// Browser-side helpers for the card's photo.

// Twice the card's width: plenty of detail even when zoomed in.
const MAX_SIDE = 2160;
// Keeps a photo comfortably inside the server's request size limit.
const MAX_DATA_URL = 3_000_000;

export function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Reads a picture the organiser uploaded, pasted or dropped, shrinking a
// big photo so it previews quickly and can be sent to the renderer.
export async function fileToDataUrl(file: Blob): Promise<string> {
  const raw = await readAsDataUrl(file);
  if (file.type === "image/svg+xml") return raw;
  return shrink(raw).catch(() => raw);
}

// Fetches a picture the preview already shows (e.g. /api/photo?…) as a
// data: URL, trying twice.
export async function urlToDataUrl(url: string): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url).catch(() => null);
    if (res?.ok) {
      const blob = await res.blob();
      const dataUrl = await readAsDataUrl(blob);
      return blob.type === "image/svg+xml" ? dataUrl : shrink(dataUrl).catch(() => dataUrl);
    }
  }
  throw new Error("Couldn't load the photo for the download. Try again in a moment.");
}

// Scales a photo down to MAX_SIDE on its longer side, as a JPEG. Small
// photos come back untouched.
async function shrink(dataUrl: string): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  if (scale === 1 && dataUrl.length <= MAX_DATA_URL) return dataUrl;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}
