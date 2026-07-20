import { existsSync } from "node:fs";
import type { Browser } from "puppeteer-core";
import type { PostData } from "@/lib/types";

// Shared headless-browser rendering used by /api/card (single card) and
// /api/week-zip (a batch of cards from one browser instance).

const LOCAL_BROWSERS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];

export async function launchBrowser(): Promise<Browser> {
  const puppeteer = await import("puppeteer-core");

  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const local =
    process.env.CHROME_PATH || LOCAL_BROWSERS.find((p) => existsSync(p));
  if (!local) {
    throw new Error("No local Chrome/Edge found for rendering; set CHROME_PATH");
  }
  return puppeteer.launch({ executablePath: local, headless: true });
}

// Screenshots one card. `origin` is the site's own base URL, used to reach
// the /render page that draws the poster.
export async function renderCardJpeg(
  browser: Browser,
  data: PostData,
  origin: string,
): Promise<Buffer> {
  const encoded = Buffer.from(JSON.stringify(data), "utf8").toString(
    "base64url",
  );
  const renderUrl = `${origin}/render?d=${encoded}`;

  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await page.goto(renderUrl, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    const jpeg = await page.screenshot({
      type: "jpeg",
      quality: 92,
      clip: { x: 0, y: 0, width: 1080, height: 1350 },
    });
    return Buffer.from(jpeg);
  } finally {
    await page.close().catch(() => {});
  }
}
