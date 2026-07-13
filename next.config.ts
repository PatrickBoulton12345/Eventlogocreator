import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  // Make sure the headless-browser binary ships with the /api/card function.
  outputFileTracingIncludes: {
    "/api/card": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  devIndicators: false,
};

export default nextConfig;
