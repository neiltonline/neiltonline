(function () {
  const ASSET_BASE = new URL("/kids/", window.location.origin);
  const CONFIG_KEY = "tecladinho-ache-config";
  const PARENT_HOLD_MS = 2500;
  const C = () => window.AcheCatalog;

  const configPanel = document.getElementById("config-panel");
  const holdProgress = document.getElementById("hold-progress");
  const animalListEl = document.getElementById("cfg-animal-list");
  const colorListEl = document.getElementById("cfg-color-list");
  const wordListEl = document.getElementById("cfg-word-list");
  const bodyListEl = document.getElementById("cfg-body-list");

  function defaultToggles(items) {
    return Object.fromEntries(items.map((i) => [i.id, true]));
  }

  const DEFAULT_CONFIG = {
    categories: { animals: true, shapes: true, words: false, body: false },
    mixCategories: true,
    choiceCount: 2,
    timerSec: 10,
    hintAfterMisses: 2,
    animals: defaultToggles(C().ANIMALS),
    colors: defaultToggles(C().COLORS),
    words: defaultToggles(C().WORDS),
    body: defaultToggles(C().BODY_PARTS),
  };

  function loadConfig() {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (!saved) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        categories: { ...DEFAULT_CONFIG.categories, ...parsed.categories },
        animals: { ...defaultToggles(C().ANIMALS), ...parsed.animals },
        colors: { ...defaultToggles(C().COLORS), ...parsed.colors },
        words: { ...defaultToggles(C().WORDS), ...parsed.words },
        body: { ...defaultToggles(C().BODY_PARTS), ...parsed.body },
        choiceCount: parsed.choiceCount === 3 ? 3 : 2,
        timerSec: [8, 10, 12, 15].includes(parsed.timerSec) ? parsed.timerSec : 10,
        hintAfterMisses: parsed.hintAfterMisses === 1 ? 1 : 2,
        mixCategories: parsed.mixCategories !== false,
      };
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
  }

  let config = loadConfig();
  let configOpen = false;
  let audioCtx = null;
  let speechPrimed = false;
  let currentAudio = null;
  let chainGen = 0;
  const audioPool = new Map();

  const pointerPositions = new Map();
  let activePointers = new Set();
  let parentHoldTimer = null;
  let parentHoldStart = null;
  let parentHoldRaf = null;
  const PARENT_CORNER = 0.16;

  function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  function assetUrl(path) {
    const parts = path.split("/").map((p) => encodeURIComponent(p));
    return new URL(parts.join("/"), ASSET_BASE).href;
  }

  function wordAudioPath(name, kind) {
    if (kind === "body") return `audio/body/${C().wordToFile(name)}.mp3`;
    return `audio/words/${C().wordToFile(name)}.mp3`;
  }

  function warmAudio(src) {
    if (!src) return null;
    let audio = audioPool.get(src);
    if (!audio) {
      audio = new Audio(src);
      audio.preload = "auto";
      audioPool.set(src, audio);
    }
    return audio;
  }

  function stopAudio() {
    chainGen += 1;
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.pause();
      currentAudio = null;
    }
  }

  function ensureAudioUnlocked() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch { /* ignore */ }
    }
    if (audioCtx?.state === "suspended") audioCtx.resume().catch(() => {});
    if (!speechPrimed) {
      speechPrimed = true;
      if (audioCtx) {
        try {
          const buffer = audioCtx.createBuffer(1, 1, 22050);
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start(0);
        } catch { /* ignore */ }
      }
    }
  }

  function playOne(src, gen) {
    return new Promise((resolve) => {
      if (!src || gen !== chainGen) {
        resolve();
        return;
      }
      const audio = warmAudio(src);
      let done = false;
      const finish = () => {
        if (done || gen !== chainGen) return;
        done = true;
        audio.onended = null;
        audio.onerror = null;
        if (currentAudio === audio) currentAudio = null;
        resolve();
      };
      currentAudio = audio;
      audio.currentTime = 0;
      audio.onended = finish;
      audio.onerror = finish;
      const p = audio.play();
      if (p) p.catch(finish);
      setTimeout(finish, 8000);
    });
  }

  function playChain(sources, gen) {
    return sources.reduce(
      (promise, src) => promise.then(() => playOne(src, gen)),
      Promise.resolve(),
    );
  }

  function questionSources(target) {
    const sources = [];
    if (target.question === "qual") {
      sources.push(assetUrl(`audio/quiz/qual-e-${target.article}.mp3`));
      sources.push(assetUrl(`audio/quiz/shapes/${target.shapeSlug}.mp3`));
    } else {
      sources.push(assetUrl(`audio/quiz/onde-esta-${target.article}.mp3`));
      sources.push(assetUrl(wordAudioPath(target.name, target.kind === "body" ? "body" : "word")));
    }
    return sources;
  }

  function speakQuestion(target, { gen, isRetry }) {
    stopAudio();
    const token = ++chainGen;
    ensureAudioUnlocked();
    const sources = questionSources(target);
    sources.forEach((s) => warmAudio(s));
    return playChain(sources, token);
  }

  function playFeedback(type, onEnd) {
    stopAudio();
    const token = ++chainGen;
    const src = type === "win"
      ? assetUrl("audio/quiz/muito-bem.mp3")
      : assetUrl("audio/quiz/tenta-de-novo.mp3");
    playOne(src, token).then(onEnd);
  }

  function playTick(remaining) {
    if (!audioCtx) ensureAudioUnlocked();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const freq = remaining <= 3 ? 880 : 520;
      osc.frequency.value = freq;
      gain.gain.value = remaining <= 3 ? 0.12 : 0.07;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch { /* ignore */ }
  }

  function thumbHtml(type, id, fallback) {
    const src = window.TecladinhoIllus?.[type]?.(id);
    if (src) return `<img class="config__thumb" src="${src}" alt="">`;
    return `<span class="config__thumb config__thumb--letter">${fallback}</span>`;
  }

  function colorThumbHtml(color) {
    const outline = color.outline ? " config__shape-preview--outline" : "";
    return `<span class="config__shape-preview config__shape-preview--${color.shape}${outline}" style="--shape-fill:${color.hex}"></span>`;
  }

  function buildAnimalConfigList() {
    animalListEl.innerHTML = "";
    C().ANIMALS.forEach((animal) => {
      const label = document.createElement("label");
      label.className = "config__animal";
      label.innerHTML = `
        <input type="checkbox" data-animal="${animal.id}" ${config.animals[animal.id] ? "checked" : ""}>
        ${thumbHtml("animal", animal.id, animal.label.charAt(0))}
        <span>${animal.label}</span>
      `;
      label.querySelector("input").addEventListener("change", (e) => {
        config.animals[animal.id] = e.target.checked;
        saveConfig();
        window.AcheGame.refresh();
      });
      animalListEl.appendChild(label);
    });
  }

  function buildColorConfigList() {
    colorListEl.innerHTML = "";
    C().COLORS.forEach((color) => {
      const label = document.createElement("label");
      label.className = "config__animal";
      label.innerHTML = `
        <input type="checkbox" data-color="${color.id}" ${config.colors[color.id] ? "checked" : ""}>
        ${colorThumbHtml(color)}
        <span>${color.label}</span>
      `;
      label.querySelector("input").addEventListener("change", (e) => {
        config.colors[color.id] = e.target.checked;
        saveConfig();
        window.AcheGame.refresh();
      });
      colorListEl.appendChild(label);
    });
  }

  function buildWordConfigList() {
    wordListEl.innerHTML = "";
    C().WORDS.forEach((word) => {
      const label = document.createElement("label");
      label.className = "config__animal";
      label.innerHTML = `
        <input type="checkbox" data-word="${word.id}" ${config.words[word.id] ? "checked" : ""}>
        ${thumbHtml("word", word.id, word.label.charAt(0))}
        <span>${word.label}</span>
      `;
      label.querySelector("input").addEventListener("change", (e) => {
        config.words[word.id] = e.target.checked;
        saveConfig();
        window.AcheGame.refresh();
      });
      wordListEl.appendChild(label);
    });
  }

  function buildBodyConfigList() {
    bodyListEl.innerHTML = "";
    C().BODY_PARTS.forEach((part) => {
      const label = document.createElement("label");
      label.className = "config__animal";
      const thumb = part.bodyBall
        ? `<span class="config__thumb config__thumb--ball"></span>`
        : thumbHtml("body", part.id, part.label.charAt(0));
      label.innerHTML = `
        <input type="checkbox" data-body="${part.id}" ${config.body[part.id] ? "checked" : ""}>
        ${thumb}
        <span>${part.label}</span>
      `;
      label.querySelector("input").addEventListener("change", (e) => {
        config.body[part.id] = e.target.checked;
        saveConfig();
        window.AcheGame.refresh();
      });
      bodyListEl.appendChild(label);
    });
  }

  function syncConfigUI() {
    document.getElementById("cfg-cat-animals").checked = config.categories.animals;
    document.getElementById("cfg-cat-shapes").checked = config.categories.shapes;
    document.getElementById("cfg-cat-words").checked = config.categories.words;
    document.getElementById("cfg-cat-body").checked = config.categories.body;
    document.getElementById("cfg-mix").checked = config.mixCategories;
    document.getElementById("cfg-choices-2").checked = config.choiceCount === 2;
    document.getElementById("cfg-choices-3").checked = config.choiceCount === 3;
    document.getElementById("cfg-timer").value = String(config.timerSec);
    document.getElementById("cfg-hint").checked = config.hintAfterMisses === 2;
  }

  function openConfig() {
    configOpen = true;
    configPanel.classList.add("is-open");
    configPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("config-open");
    syncConfigUI();
    hideParentHoldProgress();
    window.AcheGame.stopGame();
  }

  function closeConfig() {
    configOpen = false;
    configPanel.classList.remove("is-open");
    configPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("config-open");
    window.AcheGame.refresh();
  }

  function showParentHoldProgress(pct) {
    holdProgress.classList.add("is-active");
    holdProgress.setAttribute("aria-hidden", "false");
    holdProgress.style.setProperty("--hold-deg", `${pct * 360}deg`);
  }

  function hideParentHoldProgress() {
    holdProgress.classList.remove("is-active");
    holdProgress.setAttribute("aria-hidden", "true");
    holdProgress.style.setProperty("--hold-deg", "0deg");
    if (parentHoldRaf) cancelAnimationFrame(parentHoldRaf);
    parentHoldRaf = null;
  }

  function isTopLeftCorner(x, y) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return x < w * PARENT_CORNER && y < h * PARENT_CORNER;
  }

  function isBottomRightCorner(x, y) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return x > w * (1 - PARENT_CORNER) && y > h * (1 - PARENT_CORNER);
  }

  function hasOppositeCornerHold() {
    if (activePointers.size < 2) return false;
    const points = [...pointerPositions.values()];
    return points.some((p) => isTopLeftCorner(p.x, p.y))
      && points.some((p) => isBottomRightCorner(p.x, p.y));
  }

  function cancelParentHold() {
    if (parentHoldTimer) clearTimeout(parentHoldTimer);
    parentHoldTimer = null;
    parentHoldStart = null;
    if (parentHoldRaf) cancelAnimationFrame(parentHoldRaf);
    parentHoldRaf = null;
    hideParentHoldProgress();
  }

  function startParentHold() {
    if (parentHoldTimer || configOpen) return;
    parentHoldStart = Date.now();
    showParentHoldProgress(0);
    const tick = () => {
      if (!parentHoldStart) return;
      const pct = Math.min((Date.now() - parentHoldStart) / PARENT_HOLD_MS, 1);
      showParentHoldProgress(pct);
      if (pct < 1) parentHoldRaf = requestAnimationFrame(tick);
    };
    tick();
    parentHoldTimer = setTimeout(() => {
      parentHoldTimer = null;
      parentHoldStart = null;
      if (parentHoldRaf) cancelAnimationFrame(parentHoldRaf);
      parentHoldRaf = null;
      openConfig();
    }, PARENT_HOLD_MS);
  }

  function updateParentHold() {
    if (hasOppositeCornerHold()) {
      if (!parentHoldTimer) startParentHold();
      return;
    }
    cancelParentHold();
  }

  function wireParentGate() {
    const onDown = (e) => {
      activePointers.add(e.pointerId);
      pointerPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });
      updateParentHold();
    };
    const onMove = (e) => {
      if (!activePointers.has(e.pointerId)) return;
      pointerPositions.set(e.pointerId, { x: e.clientX, y: e.clientY });
      updateParentHold();
    };
    const onUp = (e) => {
      activePointers.delete(e.pointerId);
      pointerPositions.delete(e.pointerId);
      updateParentHold();
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  }

  function wireConfig() {
    document.getElementById("config-close").addEventListener("click", closeConfig);
    configPanel.addEventListener("click", (e) => {
      if (e.target === configPanel) closeConfig();
    });

    ["animals", "shapes", "words", "body"].forEach((cat) => {
      document.getElementById(`cfg-cat-${cat}`).addEventListener("change", (e) => {
        config.categories[cat] = e.target.checked;
        saveConfig();
        window.AcheGame.refresh();
      });
    });

    document.getElementById("cfg-mix").addEventListener("change", (e) => {
      config.mixCategories = e.target.checked;
      saveConfig();
      window.AcheGame.refresh();
    });

    document.getElementById("cfg-choices-2").addEventListener("change", (e) => {
      if (e.target.checked) {
        config.choiceCount = 2;
        saveConfig();
        window.AcheGame.refresh();
      }
    });

    document.getElementById("cfg-choices-3").addEventListener("change", (e) => {
      if (e.target.checked) {
        config.choiceCount = 3;
        saveConfig();
        window.AcheGame.refresh();
      }
    });

    document.getElementById("cfg-timer").addEventListener("change", (e) => {
      config.timerSec = Number(e.target.value);
      saveConfig();
    });

    document.getElementById("cfg-hint").addEventListener("change", (e) => {
      config.hintAfterMisses = e.target.checked ? 2 : 99;
      saveConfig();
    });

    document.getElementById("cfg-select-all-animals").addEventListener("click", () => {
      C().ANIMALS.forEach((a) => { config.animals[a.id] = true; });
      saveConfig();
      buildAnimalConfigList();
      window.AcheGame.refresh();
    });
    document.getElementById("cfg-deselect-all-animals").addEventListener("click", () => {
      C().ANIMALS.forEach((a) => { config.animals[a.id] = false; });
      saveConfig();
      buildAnimalConfigList();
      window.AcheGame.refresh();
    });
    document.getElementById("cfg-select-all-colors").addEventListener("click", () => {
      C().COLORS.forEach((c) => { config.colors[c.id] = true; });
      saveConfig();
      buildColorConfigList();
      window.AcheGame.refresh();
    });
    document.getElementById("cfg-deselect-all-colors").addEventListener("click", () => {
      C().COLORS.forEach((c) => { config.colors[c.id] = false; });
      saveConfig();
      buildColorConfigList();
      window.AcheGame.refresh();
    });
    document.getElementById("cfg-select-all-words").addEventListener("click", () => {
      C().WORDS.forEach((w) => { config.words[w.id] = true; });
      saveConfig();
      buildWordConfigList();
      window.AcheGame.refresh();
    });
    document.getElementById("cfg-deselect-all-words").addEventListener("click", () => {
      C().WORDS.forEach((w) => { config.words[w.id] = false; });
      saveConfig();
      buildWordConfigList();
      window.AcheGame.refresh();
    });
    document.getElementById("cfg-select-all-body").addEventListener("click", () => {
      C().BODY_PARTS.forEach((b) => { config.body[b.id] = true; });
      saveConfig();
      buildBodyConfigList();
      window.AcheGame.refresh();
    });
    document.getElementById("cfg-deselect-all-body").addEventListener("click", () => {
      C().BODY_PARTS.forEach((b) => { config.body[b.id] = false; });
      saveConfig();
      buildBodyConfigList();
      window.AcheGame.refresh();
    });
  }

  function boot() {
    buildAnimalConfigList();
    buildColorConfigList();
    buildWordConfigList();
    buildBodyConfigList();
    wireConfig();
    wireParentGate();

    window.AcheGame.init({
      root: document.getElementById("ache"),
      getConfig: () => config,
      speakQuestion,
      playFeedback,
      playTick,
      stopAudio,
      unlockAudio: ensureAudioUnlocked,
    });

    document.body.addEventListener("pointerdown", ensureAudioUnlocked, { once: true });
    window.__acheReady = true;
  }

  boot();
})();
