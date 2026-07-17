(function () {
  const stage = document.getElementById("stage");
  const burstLayer = document.getElementById("burst-layer");
  const hint = document.getElementById("hint");
  const configPanel = document.getElementById("config-panel");
  const configOpenBtn = document.getElementById("config-open");
  const holdProgress = document.getElementById("hold-progress");
  const animalListEl = document.getElementById("cfg-animal-list");

  const HOLD_MS = 2000;
  const CHAR_LIFETIME_MS = 14000;
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const ANIMALS = [
    { id: "gato", name: "gato", label: "Gato" },
    { id: "cachorro", name: "cachorro", label: "Cachorro" },
    { id: "vaca", name: "vaca", label: "Vaca" },
    { id: "porco", name: "porco", label: "Porco" },
    { id: "galinha", name: "galinha", label: "Galinha" },
    { id: "pinto", name: "pinto", label: "Pintinho" },
    { id: "pato", name: "pato", label: "Pato" },
    { id: "galo", name: "galo", label: "Galo" },
    { id: "sapo", name: "sapo", label: "Sapo" },
    { id: "leao", name: "leão", label: "Leão" },
    { id: "tigre", name: "tigre", label: "Tigre" },
    { id: "elefante", name: "elefante", label: "Elefante" },
    { id: "urso", name: "urso", label: "Urso" },
    { id: "raposa", name: "raposa", label: "Raposa" },
    { id: "abelha", name: "abelha", label: "Abelha" },
    { id: "papagaio", name: "papagaio", label: "Papagaio" },
    { id: "jacare", name: "jacaré", label: "Jacaré" },
    { id: "cavalo", name: "cavalo", label: "Cavalo" },
    { id: "ovelha", name: "ovelha", label: "Ovelha" },
    { id: "coruja", name: "coruja", label: "Coruja" },
    { id: "lobo", name: "lobo", label: "Lobo" },
    { id: "macaco", name: "macaco", label: "Macaco" },
    { id: "coelho", name: "coelho", label: "Coelho" },
    { id: "peixe", name: "peixe", label: "Peixe" },
    { id: "pinguim", name: "pinguim", label: "Pinguim" },
    { id: "tartaruga", name: "tartaruga", label: "Tartaruga" },
    { id: "borboleta", name: "borboleta", label: "Borboleta" },
    { id: "coala", name: "coala", label: "Coala" },
    { id: "panda", name: "panda", label: "Panda" },
    { id: "girafa", name: "girafa", label: "Girafa" },
    { id: "polvo", name: "polvo", label: "Polvo" },
    { id: "esquilo", name: "esquilo", label: "Esquilo" },
    { id: "zebra", name: "zebra", label: "Zebra" },
    { id: "golfinho", name: "golfinho", label: "Golfinho" },
    { id: "baleia", name: "baleia", label: "Baleia" },
    { id: "cabra", name: "cabra", label: "Cabra" },
    { id: "lhama", name: "lhama", label: "Lhama" },
    { id: "cervo", name: "cervo", label: "Cervo" },
    { id: "rato", name: "rato", label: "Rato" },
  ];

  const ANIMALS_BY_ID = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

  let variants = {};

  const BURST_COLORS = [
    "#FF3366", "#FF6B35", "#FFD23F", "#3DD68C",
    "#00C2FF", "#7B61FF", "#FF61DC", "#F9A8D4",
  ];

  const LETTER_COLORS = [
    "#FFFFFF", "#FFF59D", "#FFAB91", "#80D8FF",
    "#B9F6CA", "#FFD180", "#EA80FC", "#F48FB1",
    "#84FFFF", "#FFE082",
  ];

  const NUMBER_NAMES = {
    0: "zero", 1: "um", 2: "dois", 3: "três", 4: "quatro",
    5: "cinco", 6: "seis", 7: "sete", 8: "oito", 9: "nove",
  };

  function defaultAnimalToggles() {
    return Object.fromEntries(ANIMALS.map((a) => [a.id, true]));
  }

  const DEFAULT_CONFIG = {
    lettersOnly: false,
    animalsOnly: false,
    singleCentered: false,
    animalSounds: true,
    animals: defaultAnimalToggles(),
  };

  let config = loadConfig();
  let activeChars = [];
  let hideHintTimer = null;
  let lastAnimalId = null;
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
      const parsed = JSON.parse(saved);
      const merged = {
        ...DEFAULT_CONFIG,
        ...parsed,
        animals: { ...defaultAnimalToggles(), ...parsed.animals },
      };
      delete merged.emojisOnly;
      delete merged.categories;
      delete merged.animalReels;
      delete merged.reelsCategories;
      delete merged.colors;
      delete merged.words;
      return merged;
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

  function animalImages(id) {
    const list = variants[id]?.images;
    if (list?.length) return list;
    return [`images/animals/${id}.jpg`, `images/animals/${id}-1.jpg`];
  }

  function animalIllustrationFallback(id) {
    return window.TecladinhoIllus?.animal?.(id)
      || window.TecladinhoIllus?.fallback?.("animal", id)
      || null;
  }

  function animalSounds(id) {
    const list = variants[id]?.sounds;
    return list?.length ? list : [`audio/sounds/${id}.mp3`];
  }

  function pickAnimalImage(id) {
    return pick(animalImages(id));
  }

  function pickAnimalSound(id) {
    return pick(animalSounds(id));
  }

  function assetUrl(path) {
    return new URL(path, window.location.href).href;
  }

  function getEnabledAnimals() {
    return ANIMALS.filter((a) => config.animals[a.id]);
  }

  function pickAnimal() {
    const pool = getEnabledAnimals();
    if (pool.length === 0) return ANIMALS[0];
    let animal;
    do {
      animal = pick(pool);
    } while (animal.id === lastAnimalId && pool.length > 1);
    lastAnimalId = animal.id;
    return animal;
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

  function buildAnimalConfigList() {
    animalListEl.innerHTML = "";
    ANIMALS.forEach((animal) => {
      const label = document.createElement("label");
      label.className = "config__animal";
      label.innerHTML = `
        <input type="checkbox" data-animal="${animal.id}" ${config.animals[animal.id] ? "checked" : ""}>
        <img src="${animalImages(animal.id)[0]}" alt="" width="48" height="48" loading="lazy">
        <span>${animal.label}</span>
      `;
      const thumb = label.querySelector("img");
      thumb?.addEventListener("error", () => {
        const fb = animalIllustrationFallback(animal.id);
        if (fb && thumb.src !== fb) thumb.src = fb;
      }, { once: true });
      label.querySelector("input").addEventListener("change", (e) => {
        config.animals[animal.id] = e.target.checked;
        saveConfig();
      });
      animalListEl.appendChild(label);
    });
  }

  function syncConfigUI() {
    document.getElementById("cfg-letters-only").checked = config.lettersOnly;
    document.getElementById("cfg-animals-only").checked = config.animalsOnly;
    document.getElementById("cfg-single-centered").checked = config.singleCentered;
    document.getElementById("cfg-animal-sounds").checked = config.animalSounds;
    animalListEl.querySelectorAll("[data-animal]").forEach((input) => {
      input.checked = config.animals[input.dataset.animal];
    });
    applyBodyModes();
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
    touchHoldStart = null;
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
    if (type === "animal") {
      const animal = ANIMALS_BY_ID[content];
      path = `audio/words/${wordToFile(animal?.id || content)}.mp3`;
    } else if (/[0-9]/.test(content)) {
      const word = NUMBER_NAMES[content];
      path = `audio/numbers/${wordToFile(word)}.mp3`;
    } else {
      path = `audio/letters/${content.toLowerCase()}.mp3`;
    }
    return assetUrl(path);
  }

  function getAnimalSoundSrc(animalId, soundPath) {
    return assetUrl(soundPath || pickAnimalSound(animalId));
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

  function speak(content, type, soundPath) {
    const src = getAudioSrc(content, type);
    const playAnimalSound = () => {
      if (type !== "animal" || !config.animalSounds) return;
      playAudio(getAnimalSoundSrc(content, soundPath));
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

  function showLetter(content) {
    if (config.singleCentered) clearAllChars();
    else trimOldest();

    const burstColor = pick(BURST_COLORS);
    const letterColor = pick(LETTER_COLORS);
    const pos = config.singleCentered ? centerPosition() : randomPosition();

    const el = document.createElement("div");
    el.className = "char char--letter";
    el.textContent = content;
    el.style.left = pos.x + "%";
    el.style.top = pos.y + "%";
    el.style.setProperty("--rot", pos.rot + "deg");
    el.style.color = letterColor;

    stage.appendChild(el);
    activeChars.push(el);

    if (!config.singleCentered) {
      setTimeout(() => removeChar(el), CHAR_LIFETIME_MS);
    }

    spawnBurst(pos.x, pos.y, burstColor);
    speak(content, "letter");
    hideHint();
  }

  function showAnimal(animal) {
    if (config.singleCentered) clearAllChars();
    else trimOldest();

    const burstColor = pick(BURST_COLORS);
    const pos = config.singleCentered ? centerPosition() : randomPosition();

    const el = document.createElement("div");
    el.className = "char char--animal";
    el.style.left = pos.x + "%";
    el.style.top = pos.y + "%";
    el.style.setProperty("--rot", pos.rot + "deg");

    const img = document.createElement("img");
    const soundPath = pickAnimalSound(animal.id);
    img.src = assetUrl(pickAnimalImage(animal.id));
    img.alt = animal.label;
    img.draggable = false;
    img.addEventListener("error", () => {
      const fb = animalIllustrationFallback(animal.id);
      if (fb && img.src !== fb) img.src = fb;
    }, { once: true });
    el.appendChild(img);

    stage.appendChild(el);
    activeChars.push(el);

    if (!config.singleCentered) {
      setTimeout(() => removeChar(el), CHAR_LIFETIME_MS);
    }

    spawnBurst(pos.x, pos.y, burstColor);
    speak(animal.id, "animal", soundPath);
    hideHint();
  }

  function hideHint() {
    if (hideHintTimer) clearTimeout(hideHintTimer);
    hint.classList.add("is-hidden");
  }

  function handlePlayInput(key) {
    if (config.animalsOnly) {
      showAnimal(pickAnimal());
      return;
    }
    if (config.lettersOnly) {
      if (isLetterOrNumber(key)) showLetter(key.toUpperCase());
      else showLetter(pickLetter());
      return;
    }
    if (isLetterOrNumber(key)) {
      showLetter(key.toUpperCase());
      return;
    }
    showAnimal(pickAnimal());
  }

  function handleTouchPlay() {
    if (config.animalsOnly) {
      showAnimal(pickAnimal());
      return;
    }
    if (config.lettersOnly) {
      showLetter(pickLetter());
      return;
    }
    if (Math.random() < 0.55) showLetter(pickLetter());
    else showAnimal(pickAnimal());
  }

  document.getElementById("config-close").addEventListener("click", closeConfig);
  configOpenBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    openConfig();
  });

  configPanel.addEventListener("click", (e) => {
    if (e.target === configPanel) closeConfig();
  });

  document.getElementById("cfg-letters-only").addEventListener("change", (e) => {
    config.lettersOnly = e.target.checked;
    if (config.lettersOnly) config.animalsOnly = false;
    saveConfig();
    syncConfigUI();
  });

  document.getElementById("cfg-animals-only").addEventListener("change", (e) => {
    config.animalsOnly = e.target.checked;
    if (config.animalsOnly) config.lettersOnly = false;
    saveConfig();
    syncConfigUI();
  });

  document.getElementById("cfg-single-centered").addEventListener("change", (e) => {
    config.singleCentered = e.target.checked;
    saveConfig();
    syncConfigUI();
    if (config.singleCentered) clearAllChars();
  });

  document.getElementById("cfg-animal-sounds").addEventListener("change", (e) => {
    config.animalSounds = e.target.checked;
    saveConfig();
  });

  document.getElementById("cfg-select-all-animals").addEventListener("click", () => {
    ANIMALS.forEach((a) => { config.animals[a.id] = true; });
    saveConfig();
    syncConfigUI();
  });

  document.getElementById("cfg-deselect-all-animals").addEventListener("click", () => {
    ANIMALS.forEach((a) => { config.animals[a.id] = false; });
    saveConfig();
    syncConfigUI();
  });

  document.addEventListener("keydown", (e) => {
    if (configOpen) return;
    if (e.metaKey || e.ctrlKey || e.altKey) {
      e.preventDefault();
      return;
    }
    if (e.repeat) return;
    e.preventDefault();
    if (!keyHoldStart) startKeyHold(e.key);
  }, true);

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

  document.addEventListener("pointerdown", (e) => {
    if (configOpen) return;
    activePointers.add(e.pointerId);
    if (activePointers.size >= 2) startTouchHold();
  }, { passive: true });

  document.addEventListener("pointerup", (e) => {
    const wasTwoFinger = activePointers.size >= 2;
    const holdDuration = touchHoldStart ? Date.now() - touchHoldStart : 0;
    activePointers.delete(e.pointerId);
    if (wasTwoFinger && touchHoldTimer) {
      if (holdDuration < HOLD_MS) cancelTouchHold();
      return;
    }
    if (activePointers.size < 2) cancelTouchHold();
    if (configOpen || wasTwoFinger) return;
    if (activePointers.size > 0) return;
    handleTouchPlay();
  }, { passive: true });

  document.addEventListener("pointercancel", (e) => {
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) cancelTouchHold();
  }, { passive: true });

  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());
  document.addEventListener("gestureend", (e) => e.preventDefault());

  let lastTouchEnd = 0;
  document.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTouchEnd < 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  async function init() {
    try {
      const res = await fetch(assetUrl("data/manifest.json"));
      if (res.ok) variants = await res.json();
    } catch {
      /* fallback */
    }
    buildAnimalConfigList();
    applyBodyModes();
    hideHintTimer = setTimeout(hideHint, 4000);
  }

  init();
})();
