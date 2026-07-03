(function () {
  const stage = document.getElementById("stage");
  const burstLayer = document.getElementById("burst-layer");
  const hint = document.getElementById("hint");
  const configPanel = document.getElementById("config-panel");
  const holdProgress = document.getElementById("hold-progress");
  const settingsBtn = document.getElementById("settings-btn");

  const HOLD_MS = 2500;
  const CHAR_LIFETIME_MS = 14000;
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const BURST_COLORS = [
    "#FF3366", "#FF6B35", "#FFD23F", "#3DD68C",
    "#00C2FF", "#7B61FF", "#FF61DC", "#F9A8D4",
  ];

  const LETTER_COLORS = [
    "#FFFFFF", "#FFF59D", "#FFAB91", "#80D8FF",
    "#B9F6CA", "#FFD180", "#EA80FC", "#F48FB1",
    "#84FFFF", "#FFE082",
  ];

  const EMOJI_CATEGORIES = {
    animals: [
      "🐱", "🐶", "🐸", "🐥", "🐠", "🦆", "🐝", "🦋",
      "🐻", "🐰", "🐮", "🐷", "🦁", "🐯", "🐨", "🐼",
      "🦊", "🐢", "🐙", "🐘", "🦒", "🐧", "🦜", "🐿️", "🐊",
    ],
    nature: ["🌙", "🌛", "🌜", "⭐", "☀️", "🌈", "💫", "🌸"],
    food: ["🍎", "🍌", "🍓", "🍉", "🍭"],
    objects: ["🎈", "🎉", "💖", "🧸", "🎵", "🫧", "🎠"],
  };

  const NUMBER_NAMES = {
    0: "zero", 1: "um", 2: "dois", 3: "três", 4: "quatro",
    5: "cinco", 6: "seis", 7: "sete", 8: "oito", 9: "nove",
  };

  const EMOJI_NAMES = {
    "🐱": "gato", "🐶": "cachorro", "🐸": "sapo", "🐥": "pinto",
    "🐠": "peixe", "🦆": "pato", "🐝": "abelha", "🦋": "borboleta",
    "🐻": "urso", "🐰": "coelho", "🐮": "vaca", "🐷": "porco",
    "🦁": "leão", "🐯": "tigre", "🐨": "coala", "🐼": "panda",
    "🦊": "raposa", "🐢": "tartaruga", "🐙": "polvo", "🐘": "elefante",
    "🦒": "girafa", "🐧": "pinguim", "🦜": "papagaio", "🐿️": "esquilo",
    "🐊": "jacaré",
    "🌙": "lua", "🌛": "lua", "🌜": "lua", "⭐": "estrela", "☀️": "sol",
    "🌈": "arco-íris", "🎈": "balão", "🎉": "festa", "💖": "coração",
    "🍎": "maçã", "🍌": "banana", "🍓": "morango", "🧸": "urso",
    "🎵": "música", "💫": "estrela", "🌸": "flor", "🍭": "pirulito",
    "🫧": "bolha", "🎠": "carrossel", "🍉": "melancia",
  };

  const ANIMAL_SOUND_SLUGS = {
    "🐱": "gato", "🐶": "cachorro", "🐸": "sapo", "🐥": "pinto",
    "🐠": "peixe", "🦆": "pato", "🐝": "abelha", "🦋": "borboleta",
    "🐻": "urso", "🐰": "coelho", "🐮": "vaca", "🐷": "porco",
    "🦁": "leao", "🐯": "tigre", "🐨": "coala", "🐼": "panda",
    "🦊": "raposa", "🐢": "tartaruga", "🐙": "polvo", "🐘": "elefante",
    "🦒": "girafa", "🐧": "pinguim", "🦜": "papagaio", "🐿️": "esquilo",
    "🐊": "jacare",
  };

  const DEFAULT_CONFIG = {
    lettersOnly: false,
    emojisOnly: false,
    singleCentered: false,
    animalSounds: true,
    categories: {
      animals: true,
      nature: true,
      food: true,
      objects: true,
    },
  };

  let config = loadConfig();
  let activeChars = [];
  let hideHintTimer = null;
  let lastEmoji = null;
  let currentAudio = null;
  let configOpen = false;

  let keyHoldTimer = null;
  let keyHoldStart = null;
  let keyHoldRaf = null;
  let heldKey = null;

  let touchHoldTimer = null;
  let touchHoldStart = null;
  let touchHoldRaf = null;
  let activePointers = new Set();

  function loadConfig() {
    try {
      const saved = localStorage.getItem("tecladinho-config");
      if (!saved) return structuredClone(DEFAULT_CONFIG);
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved), categories: { ...DEFAULT_CONFIG.categories, ...JSON.parse(saved).categories } };
    } catch {
      return structuredClone(DEFAULT_CONFIG);
    }
  }

  function saveConfig() {
    localStorage.setItem("tecladinho-config", JSON.stringify(config));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getAvailableEmojis() {
    const pool = [];
    for (const [cat, emojis] of Object.entries(EMOJI_CATEGORIES)) {
      if (config.categories[cat]) pool.push(...emojis);
    }
    return pool;
  }

  function pickEmoji() {
    const pool = getAvailableEmojis();
    if (pool.length === 0) return "⭐";
    let emoji;
    do {
      emoji = pick(pool);
    } while (emoji === lastEmoji && pool.length > 1);
    lastEmoji = emoji;
    return emoji;
  }

  function pickLetter() {
    return pick(LETTERS.split(""));
  }

  function isLetterOrNumber(key) {
    return /^[a-zA-Z0-9]$/.test(key);
  }

  function getMaxChars() {
    return config.singleCentered ? 1 : 10;
  }

  function applyBodyModes() {
    document.body.classList.toggle("mode-single", config.singleCentered);
  }

  function syncConfigUI() {
    document.getElementById("cfg-letters-only").checked = config.lettersOnly;
    document.getElementById("cfg-emojis-only").checked = config.emojisOnly;
    document.getElementById("cfg-single-centered").checked = config.singleCentered;
    document.getElementById("cfg-animal-sounds").checked = config.animalSounds;
    document.getElementById("cfg-cat-animals").checked = config.categories.animals;
    document.getElementById("cfg-cat-nature").checked = config.categories.nature;
    document.getElementById("cfg-cat-food").checked = config.categories.food;
    document.getElementById("cfg-cat-objects").checked = config.categories.objects;
    applyBodyModes();
    const soundsWrap = document.getElementById("cfg-animal-sounds-wrap");
    soundsWrap.classList.toggle("is-disabled", !config.categories.animals);
  }

  function openConfig() {
    configOpen = true;
    configPanel.classList.add("is-open");
    configPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("config-open");
    syncConfigUI();
    cancelKeyHold();
    cancelTouchHold();
  }

  function closeConfig() {
    configOpen = false;
    configPanel.classList.remove("is-open");
    configPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("config-open");
  }

  function showHoldProgress() {
    holdProgress.classList.add("is-active");
    holdProgress.setAttribute("aria-hidden", "false");
  }

  function hideHoldProgress() {
    holdProgress.classList.remove("is-active");
    holdProgress.setAttribute("aria-hidden", "true");
    holdProgress.style.setProperty("--hold-deg", "0deg");
    if (keyHoldRaf) cancelAnimationFrame(keyHoldRaf);
    if (touchHoldRaf) cancelAnimationFrame(touchHoldRaf);
    keyHoldRaf = null;
    touchHoldRaf = null;
  }

  function cancelKeyHold() {
    if (keyHoldTimer) clearTimeout(keyHoldTimer);
    keyHoldTimer = null;
    keyHoldStart = null;
    heldKey = null;
    hideHoldProgress();
  }

  function cancelTouchHold() {
    if (touchHoldTimer) clearTimeout(touchHoldTimer);
    touchHoldTimer = null;
    hideHoldProgress();
  }

  function startKeyHold(key) {
    if (configOpen) return;
    cancelKeyHold();
    heldKey = key;
    keyHoldStart = Date.now();
    showHoldProgress();
    const tick = () => {
      if (!keyHoldStart) return;
      const pct = Math.min((Date.now() - keyHoldStart) / HOLD_MS, 1);
      holdProgress.style.setProperty("--hold-deg", `${pct * 360}deg`);
      if (pct < 1) keyHoldRaf = requestAnimationFrame(tick);
    };
    tick();
    keyHoldTimer = setTimeout(() => {
      cancelKeyHold();
      openConfig();
    }, HOLD_MS);
  }

  function startTouchHold() {
    if (configOpen) return;
    cancelTouchHold();
    touchHoldStart = Date.now();
    showHoldProgress();
    const tick = () => {
      const elapsed = Date.now() - touchHoldStart;
      const pct = Math.min(elapsed / HOLD_MS, 1);
      holdProgress.style.setProperty("--hold-deg", `${pct * 360}deg`);
      if (pct < 1) touchHoldRaf = requestAnimationFrame(tick);
    };
    tick();
    touchHoldTimer = setTimeout(() => {
      hideHoldProgress();
      openConfig();
    }, HOLD_MS);
  }

  function wordToFile(word) {
    return word.replace(/ /g, "-");
  }

  function getAudioSrc(content, type) {
    let path;
    if (type === "emoji") {
      const word = EMOJI_NAMES[content] || "figurinha";
      path = `audio/words/${wordToFile(word)}.mp3`;
    } else if (/[0-9]/.test(content)) {
      const word = NUMBER_NAMES[content];
      path = `audio/numbers/${wordToFile(word)}.mp3`;
    } else {
      path = `audio/letters/${content.toLowerCase()}.mp3`;
    }
    return new URL(path, window.location.href).href;
  }

  function getAnimalSoundSrc(emoji) {
    const slug = ANIMAL_SOUND_SLUGS[emoji];
    if (!slug) return null;
    return new URL(`audio/sounds/${slug}.mp3`, window.location.href).href;
  }

  function playAudio(src, onEnd) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.onended = null;
      currentAudio = null;
    }
    const audio = new Audio(src);
    currentAudio = audio;
    if (onEnd) {
      audio.addEventListener("ended", onEnd, { once: true });
    }
    audio.play().catch(() => onEnd?.());
  }

  function speak(content, type) {
    const src = getAudioSrc(content, type);

    const playAnimalSound = () => {
      if (type !== "emoji" || !config.animalSounds || !config.categories.animals) return;
      if (!EMOJI_CATEGORIES.animals.includes(content)) return;
      const soundSrc = getAnimalSoundSrc(content);
      if (soundSrc) playAudio(soundSrc);
    };

    playAudio(src, playAnimalSound);
  }

  function randomPosition() {
    const padX = 12;
    const padY = 10;
    return {
      x: padX + Math.random() * (100 - padX * 2),
      y: padY + Math.random() * (100 - padY * 2),
      rot: -12 + Math.random() * 24,
    };
  }

  function centerPosition() {
    return { x: 50, y: 50, rot: 0 };
  }

  function spawnBurst(x, y, color) {
    const ring = document.createElement("div");
    ring.className = "burst";
    ring.style.left = x + "%";
    ring.style.top = y + "%";
    ring.style.width = config.singleCentered ? "120px" : "80px";
    ring.style.height = config.singleCentered ? "120px" : "80px";
    ring.style.background = `radial-gradient(circle, ${color}88 0%, ${color}00 70%)`;
    burstLayer.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove());

    const sparkCount = config.singleCentered ? 12 : 8;
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement("div");
      spark.className = "sparkle";
      const angle = (i / sparkCount) * Math.PI * 2;
      const dist = 60 + Math.random() * 80;
      spark.style.left = x + "%";
      spark.style.top = y + "%";
      spark.style.background = color;
      spark.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      spark.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      burstLayer.appendChild(spark);
      spark.addEventListener("animationend", () => spark.remove());
    }
  }

  function removeChar(el) {
    if (!el || el.classList.contains("is-leaving")) return;
    activeChars = activeChars.filter((c) => c !== el);
    el.classList.add("is-leaving");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  function clearAllChars() {
    [...activeChars].forEach(removeChar);
  }

  function trimOldest() {
    const max = getMaxChars();
    while (activeChars.length >= max) {
      removeChar(activeChars[0]);
    }
  }

  function showOnScreen(content, type) {
    if (config.singleCentered) clearAllChars();
    else trimOldest();

    const burstColor = pick(BURST_COLORS);
    const letterColor = type === "letter" ? pick(LETTER_COLORS) : null;
    const pos = config.singleCentered ? centerPosition() : randomPosition();

    const el = document.createElement("div");
    el.className = `char char--${type}`;
    el.textContent = content;
    el.style.left = pos.x + "%";
    el.style.top = pos.y + "%";
    el.style.setProperty("--rot", pos.rot + "deg");
    if (letterColor) el.style.color = letterColor;

    stage.appendChild(el);
    activeChars.push(el);

    if (!config.singleCentered) {
      setTimeout(() => removeChar(el), CHAR_LIFETIME_MS);
    }

    spawnBurst(pos.x, pos.y, burstColor);
    speak(content, type);
    hideHint();
  }

  function hideHint() {
    if (hideHintTimer) clearTimeout(hideHintTimer);
    hint.classList.add("is-hidden");
  }

  function handlePlayInput(key) {
    if (config.emojisOnly) {
      showOnScreen(pickEmoji(), "emoji");
      return;
    }

    if (config.lettersOnly) {
      if (isLetterOrNumber(key)) {
        showOnScreen(key.toUpperCase(), "letter");
      } else {
        showOnScreen(pickLetter(), "letter");
      }
      return;
    }

    if (isLetterOrNumber(key)) {
      showOnScreen(key.toUpperCase(), "letter");
      return;
    }

    showOnScreen(pickEmoji(), "emoji");
  }

  function handleTouchPlay() {
    if (config.emojisOnly) {
      showOnScreen(pickEmoji(), "emoji");
      return;
    }
    if (config.lettersOnly) {
      showOnScreen(pickLetter(), "letter");
      return;
    }
    if (Math.random() < 0.55) {
      showOnScreen(pickLetter(), "letter");
    } else {
      showOnScreen(pickEmoji(), "emoji");
    }
  }

  document.getElementById("config-close").addEventListener("click", closeConfig);
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openConfig();
  });

  configPanel.addEventListener("click", (e) => {
    if (e.target === configPanel) closeConfig();
  });

  document.getElementById("cfg-letters-only").addEventListener("change", (e) => {
    config.lettersOnly = e.target.checked;
    if (config.lettersOnly) config.emojisOnly = false;
    saveConfig();
    syncConfigUI();
  });

  document.getElementById("cfg-emojis-only").addEventListener("change", (e) => {
    config.emojisOnly = e.target.checked;
    if (config.emojisOnly) config.lettersOnly = false;
    saveConfig();
    syncConfigUI();
  });

  document.getElementById("cfg-single-centered").addEventListener("change", (e) => {
    config.singleCentered = e.target.checked;
    saveConfig();
    applyBodyModes();
    if (config.singleCentered) clearAllChars();
  });

  document.getElementById("cfg-animal-sounds").addEventListener("change", (e) => {
    config.animalSounds = e.target.checked;
    saveConfig();
  });

  ["animals", "nature", "food", "objects"].forEach((cat) => {
    document.getElementById(`cfg-cat-${cat}`).addEventListener("change", (e) => {
      config.categories[cat] = e.target.checked;
      saveConfig();
      syncConfigUI();
    });
  });

  document.addEventListener(
    "keydown",
    (e) => {
      if (configOpen) return;

      if (e.metaKey || e.ctrlKey || e.altKey) {
        e.preventDefault();
        return;
      }

      if (e.repeat) return;

      e.preventDefault();

      if (!keyHoldStart) startKeyHold(e.key);
    },
    true
  );

  document.addEventListener("keyup", () => {
    if (configOpen) {
      cancelKeyHold();
      return;
    }

    if (!keyHoldStart) return;

    const duration = Date.now() - keyHoldStart;
    const key = heldKey;
    cancelKeyHold();

    if (duration < HOLD_MS && key) handlePlayInput(key);
  });

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (configOpen) return;
      activePointers.add(e.pointerId);

      if (activePointers.size >= 2) {
        startTouchHold();
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerup",
    (e) => {
      const wasTwoFinger = activePointers.size >= 2;
      const holdDuration = touchHoldStart ? Date.now() - touchHoldStart : 0;
      activePointers.delete(e.pointerId);

      if (wasTwoFinger && touchHoldTimer) {
        if (holdDuration < HOLD_MS) {
          cancelTouchHold();
        }
        return;
      }

      if (activePointers.size < 2) cancelTouchHold();

      if (configOpen || wasTwoFinger) return;
      if (activePointers.size > 0) return;

      handleTouchPlay();
    },
    { passive: true }
  );

  document.addEventListener(
    "pointercancel",
    (e) => {
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) cancelTouchHold();
    },
    { passive: true }
  );

  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());
  document.addEventListener("gestureend", (e) => e.preventDefault());

  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd < 300) e.preventDefault();
      lastTouchEnd = now;
    },
    { passive: false }
  );

  applyBodyModes();
  hideHintTimer = setTimeout(hideHint, 4000);
})();
