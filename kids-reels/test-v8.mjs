import { chromium, devices } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";

const BUILD = "8";
const ROOT = "/workspace";

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".mp3": "audio/mpeg",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://127.0.0.1");
        let path = url.pathname;
        if (path.endsWith("/")) path += "index.html";
        const filePath = join(ROOT, path);
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function evaluate(page) {
  await page.waitForFunction(() => window.__reelsReady, null, { timeout: 10000 });
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const active = document.querySelector(".reels__slide.is-active");
    return {
      ready: !!window.__reelsReady,
      slides: document.querySelectorAll(".reels__slide:not(.reels__boot-slide)").length,
      videos: document.querySelectorAll("video").length,
      images: document.querySelectorAll(".reels__illus, .reels__color-object").length,
      mediaHidden: active?.classList.contains("is-media-hidden"),
      holdVisible: getComputedStyle(document.getElementById("hold-progress")).visibility,
      feedSample: window.TecladinhoReels ? null : null,
    };
  });
}

const server = await startServer();
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ ...devices["iPhone 13"], locale: "pt-BR" });

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(`${base}/kids-reels/?v=${BUILD}`, { waitUntil: "networkidle", timeout: 30000 });
const boot = await evaluate(page);

// Tap to unlock audio
await page.mouse.click(200, 400);
await page.waitForTimeout(2000);

const afterTap = await page.evaluate(() => ({
  mediaHidden: document.querySelector(".reels__slide.is-active")?.classList.contains("is-media-hidden"),
  label: document.querySelector(".reels__label")?.textContent,
  hasImg: !!document.querySelector(".reels__illus, .reels__color-object"),
}));

// Two-finger hold simulation
await page.evaluate(() => {
  const root = document.getElementById("reels");
  root.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, bubbles: true, clientX: 100, clientY: 300 }));
  root.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 2, bubbles: true, clientX: 200, clientY: 300 }));
});
await page.waitForTimeout(2100);
const configOpen = await page.evaluate(() => document.getElementById("config-panel").classList.contains("is-open"));

await browser.close();
server.close();

const ok = boot.ready
  && boot.slides === 3
  && boot.videos === 0
  && boot.holdVisible === "visible"
  && configOpen
  && errors.length === 0;

console.log(JSON.stringify({ ok, boot, afterTap, configOpen, errors }, null, 2));
process.exit(ok ? 0 : 1);
