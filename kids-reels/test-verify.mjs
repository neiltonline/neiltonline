import { chromium, devices } from "playwright";

const BUILD = "6";

async function testScenario(name, page, url) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && /\.(js|css)/.test(r.url())) {
      errors.push(`${r.status()} ${r.url()}`);
    }
  });

  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  const state = await page.evaluate(() => ({
    href: location.href,
    slides: document.querySelectorAll(".reels__slide:not(.reels__boot-slide)").length,
    bootSlide: !!document.querySelector(".reels__boot-slide"),
    fail: !!document.getElementById("reels-fail"),
    ready: !!window.__reelsReady,
    hint: document.querySelector(".reels__swipe-hint")?.textContent?.trim(),
    letter: document.querySelector(".reels__slide.is-active .reels__letter, .reels__slide .reels__letter")?.textContent,
    label: document.querySelector(".reels__label")?.textContent,
    bg: document.querySelector(".reels__slide.is-active, .reels__slide")?.style?.background || null,
    computedBg: (() => {
      const el = document.querySelector(".reels__slide.is-active") || document.querySelector(".reels__slide:not(.reels__boot-slide)") || document.querySelector(".reels__slide");
      return el ? getComputedStyle(el).backgroundColor : null;
    })(),
    scripts: [...document.scripts].map((s) => s.src).filter(Boolean),
    reelsH: getComputedStyle(document.documentElement).getPropertyValue("--reels-h"),
  }));

  const ok = state.ready && state.slides > 0 && !state.fail && errors.length === 0;
  return { name, url, ok, state, errors };
}

const browser = await chromium.launch({ headless: true });
const iphone = devices["iPhone 13"];
const results = [];

for (const url of [
  `https://www.neiltonline.com/kids-reels/?v=${BUILD}`,
  "https://www.neiltonline.com/kids-reels",
  "https://neiltonline.com/kids-reels/",
]) {
  const page = await browser.newPage({ ...iphone, locale: "pt-BR" });
  results.push(await testScenario(`prod-${url}`, page, url));
  if (url.includes("www.neiltonline.com/kids-reels/?v=")) {
    await page.screenshot({ path: "/workspace/kids-reels/test-screenshot.png" });
  }
  await page.close();
}

// Local test with relative paths broken (simulate old bug)
const page2 = await browser.newPage({ ...iphone });
await page2.goto("http://127.0.0.1:8765/kids-reels/?v=6", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
if (page2.url().includes("127.0.0.1")) {
  results.push(await testScenario("local", page2, page2.url()));
}
await page2.close();

await browser.close();

let allOk = true;
for (const r of results) {
  console.log(`\n${r.ok ? "PASS" : "FAIL"} ${r.name}`);
  console.log(JSON.stringify({ state: r.state, errors: r.errors }, null, 2));
  if (!r.ok) allOk = false;
}

process.exit(allOk ? 0 : 1);
