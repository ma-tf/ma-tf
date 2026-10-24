import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

import { startDevServer } from "@/scripts/dev-server.mts";

const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
const outputPath = fileURLToPath(new URL("../public/cv.pdf", import.meta.url));
const renderOnlyAskKeys = {
  TYPESAFE_API_KEY: "render-only",
  OPENAI_API_KEY: "render-only",
};

for (const [name, value] of Object.entries(renderOnlyAskKeys)) {
  process.env[name] ??= value;
}

async function main(): Promise<void> {
  const server = await startDevServer();

  try {
    await server.sitemap();

    const browser = await chromium.launch();

    try {
      const page = await browser.newPage();
      await page.emulateMedia({ media: "print" });
      const response = await page.goto(new URL("/cv", server.origin).href, {
        waitUntil: "networkidle",
      });
      if (!response?.ok()) throw new Error(`Could not render /cv (${response?.status()})`);
      await page.evaluate(() => document.fonts.ready);

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "16mm", right: "16mm", bottom: "16mm", left: "16mm" },
      });

      await mkdir(publicDirectory, { recursive: true });
      await writeFile(outputPath, pdf);
      console.log(`Wrote ${outputPath} (${pdf.byteLength} bytes).`);
    } finally {
      await browser.close();
    }
  } finally {
    await server.stop();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
