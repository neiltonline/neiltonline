import { chromium, devices } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ ...devices["iPhone 13"] });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto("https://www.neiltonline.com/kids-reels/?v=7", { waitUntil: "networkidle", timeout: 45000 }).catch(async () => {
  await page.goto("http://127.0.0.1:8765/kids-reels/?v=7", { waitUntil: "networkidle", timeout: 30000 });
});

await page.waitForTimeout(1500);

const before = await page.evaluate(() => ({
  slides: document.querySelectorAll(".reels__track .reels__slide").length,
  ready: !!window.__reelsReady,
  videos: document.querySelectorAll("video").length,
}));

// simulate swipe up
await page.mouse.move(195, 600);
await page.mouse.down();
await page.mouse.move(195, 300, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(600);

const after = await page.evaluate(() => ({
  slides: document.querySelectorAll(".reels__track .reels__slide").length,
  videos: document.querySelectorAll("video").length,
  letter: document.querySelector(".reels__slide.is-active .reels__letter")?.textContent,
  label: document.querySelector(".reels__slide.is-active .reels__label")?.textContent,
}));

console.log(JSON.stringify({ before, after, errors }, null, 2));
const ok = before.slides === 3 && before.ready && after.slides === 3 && errors.length === 0;
process.exit(ok ? 0 : 1);
