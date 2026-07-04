(function () {
  const ASSET_BASE = new URL("/kids/", window.location.origin);
  const CONFIG_KEY = "tecladinho-reels-config";
  const HOLD_MS = 2000;
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const ILLUS = () => window.TecladinhoIllus;

  const configPanel = document.getElementById("config-panel");
  const holdProgress = document.getElementById("hold-progress");
  const animalListEl = document.getElementById("cfg-animal-list");
  const colorListEl = document.getElementById("cfg-color-list");
  const wordListEl = document.getElementById("cfg-word-list");
  const bodyListEl = document.getElementById("cfg-body-list");
  const reelsAnimalsSection = document.getElementById("cfg-reels-animals-section");
  const reelsColorsSection = document.getElementById("cfg-reels-colors-section");
  const reelsWordsSection = document.getElementById("cfg-reels-words-section");
  const reelsBodySection = document.getElementById("cfg-reels-body-section");

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
  ];

  const ANIMALS_BY_ID = Object.fromEntries(ANIMALS.map((a) => [a.id, a]));

  const WORDS = [
    { id: "papai", name: "papai", label: "Papai" },
    { id: "mamae", name: "mamãe", label: "Mamãe" },
    { id: "titio", name: "titio", label: "Titio" },
    { id: "titia", name: "titia", label: "Titia" },
    { id: "vovo", name: "vovó", label: "Vovó" },
    { id: "avo", name: "vovô", label: "Vovô" },
    { id: "bola", name: "bola", label: "Bola" },
    { id: "brincar", name: "brincar", label: "Brincar" },
    { id: "lua", name: "lua", label: "Lua" },
    { id: "sol", name: "sol", label: "Sol" },
    { id: "morango", name: "morango", label: "Morango" },
    { id: "banana", name: "banana", label: "Banana" },
    { id: "maca", name: "maçã", label: "Maçã" },
    { id: "agua", name: "água", label: "Água" },
    { id: "leite", name: "leite", label: "Leite" },
    { id: "estrela", name: "estrela", label: "Estrela" },
    { id: "flor", name: "flor", label: "Flor" },
    { id: "bebe", name: "bebê", label: "Bebê" },
    { id: "pao", name: "pão", label: "Pão" },
    { id: "abraco", name: "abraço", label: "Abraço" },
    { id: "beijo", name: "beijo", label: "Beijo" },
    { id: "dormir", name: "dormir", label: "Dormir" },
  ];

  const BODY_PARTS = [
    { id: "cabeca", name: "cabeça", label: "Cabeça", bg: "#FFE0B2" },
    { id: "pe", name: "pé", label: "Pé", bg: "#E1BEE7" },
    { id: "olhos", name: "olhos", label: "Olhos", bg: "#BBDEFB" },
    { id: "orelha", name: "orelha", label: "Orelha", bg: "#FFECB3" },
    { id: "nariz", name: "nariz", label: "Nariz", bg: "#FFCDD2" },
    { id: "boca", name: "boca", label: "Boca", bg: "#F8BBD0" },
    { id: "mao", name: "mão", label: "Mão", bg: "#FFCCBC" },
    { id: "braco", name: "braço", label: "Braço", bg: "#FFAB91" },
    { id: "perna", name: "perna", label: "Perna", bg: "#C5CAE9" },
    { id: "barriga", name: "barriga", label: "Barriga", bg: "#DCEDC8" },
    { id: "cabelo", name: "cabelo", label: "Cabelo", bg: "#D7CCC8" },
    { id: "dente", name: "dente", label: "Dente", bg: "#E0F7FA" },
  ];

  const COLORS = [
    { id: "vermelho", name: "vermelho", label: "Vermelho", hex: "#E53935", object: "Morango" },
    { id: "azul", name: "azul", label: "Azul", hex: "#1E88E5", object: "Bola" },
    { id: "amarelo", name: "amarelo", label: "Amarelo", hex: "#FDD835", text: "#333", object: "Banana" },
    { id: "verde", name: "verde", label: "Verde", hex: "#43A047", object: "Maçã" },
    { id: "laranja", name: "laranja", label: "Laranja", hex: "#FB8C00", object: "Laranja" },
    { id: "roxo", name: "roxo", label: "Roxo", hex: "#8E24AA", object: "Uva" },
    { id: "rosa", name: "rosa", label: "Rosa", hex: "#EC407A", object: "Flor" },
    { id: "branco", name: "branco", label: "Branco", hex: "#E8EAF6", text: "#333", object: "Nuvem" },
    { id: "preto", name: "preto", label: "Preto", hex: "#212121", object: "Gato" },
    { id: "marrom", name: "marrom", label: "Marrom", hex: "#6D4C41", object: "Urso" },
    { id: "cinza", name: "cinza", label: "Cinza", hex: "#757575", object: "Elefante" },
  ];

  const REELS_LETTER_BACKGROUNDS = [
    { bg: "#5C6BC0", fg: "#FFFFFF" },
    { bg: "#26A69A", fg: "#FFFFFF" },
    { bg: "#EF5350", fg: "#FFFFFF" },
    { bg: "#FFA726", fg: "#333333" },
    { bg: "#AB47BC", fg: "#FFFFFF" },
    { bg: "#42A5F5", fg: "#FFFFFF" },
  ];

  const ANIMAL_BACKGROUNDS = [
    "#FFD54F", "#FFCC80", "#FFE082", "#FFF59D", "#FFECB3", "#FFE0B2",
  ];

  const WORD_BACKGROUNDS = [
    "#81D4FA", "#80DEEA", "#A5D6A7", "#CE93D8", "#F48FB1", "#90CAF9",
  ];

  const NUMBER_NAMES = {
    0: "zero", 1: "um", 2: "dois", 3: "três", 4: "quatro",
    5: "cinco", 6: "seis", 7: "sete", 8: "oito", 9: "nove",
  };

  function defaultAnimalToggles() {
    return Object.fromEntries(ANIMALS.map((a) => [a.id, true]));
  }

  function defaultColorToggles() {
    return Object.fromEntries(COLORS.map((c) => [c.id, true]));
  }

  function defaultWordToggles() {
    return Object.fromEntries(WORDS.map((w) => [w.id, true]));
  }

  function defaultBodyToggles() {
    return Object.fromEntries(BODY_PARTS.map((b) => [b.id, true]));
  }

  function defaultReelsCategories() {
    return { animals: true, colors: true, letters: true, words: true, body: true };
  }

  const DEFAULT_CONFIG = {
    animals: defaultAnimalToggles(),
    colors: defaultColorToggles(),
    words: defaultWordToggles(),
    body: defaultBodyToggles(),
    reelsCategories: defaultReelsCategories(),
  };

  function cloneData(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadConfig() {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (!saved) return cloneData(DEFAULT_CONFIG);
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        animals: { ...defaultAnimalToggles(), ...parsed.animals },
        colors: { ...defaultColorToggles(), ...parsed.colors },
        words: { ...defaultWordToggles(), ...parsed.words },
        body: { ...defaultBodyToggles(), ...parsed.body },
        reelsCategories: { ...defaultReelsCategories(), ...parsed.reelsCategories },
      };
    } catch {
      return cloneData(DEFAULT_CONFIG);
    }
  }

  let config = loadConfig();
  let variants = {};
  let currentAudio = null;
  let speechPrimed = false;
  let pendingSpeak = null;
  let configOpen = false;
  let touchHoldTimer = null;
  let touchHoldStart = null;
  let touchHoldRaf = null;

  function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  function assetUrl(path) {
    const parts = path.split("/").map((part) => encodeURIComponent(part));
    return new URL(parts.join("/"), ASSET_BASE).href;
  }

  function illus(type, id) {
    return ILLUS()?.[type]?.(id) || null;
  }

  function animalSoundSrc(id) {
    const sounds = variants[id]?.sounds;
    if (sounds?.length) {
      return assetUrl(sounds[Math.floor(Math.random() * sounds.length)]);
    }
    return assetUrl(`audio/sounds/${id}-1.mp3`);
  }

  function getEnabledAnimals() {
    return ANIMALS.filter((a) => config.animals[a.id]);
  }

  function getEnabledColors() {
    return COLORS.filter((c) => config.colors[c.id]);
  }

  function getEnabledWords() {
    return WORDS.filter((w) => config.words[w.id]);
  }

  function getEnabledBodyParts() {
    return BODY_PARTS.filter((b) => config.body[b.id]);
  }

  let feedResetGuard = false;

  function buildReelsFeed() {
    const items = [];

    if (config.reelsCategories.animals) {
      getEnabledAnimals().forEach((animal, i) => {
        const illustration = illus("animal", animal.id);
        if (!illustration) return;
        items.push({
          type: "animal",
          animalId: animal.id,
          label: animal.label,
          illustration,
          bg: ANIMAL_BACKGROUNDS[i % ANIMAL_BACKGROUNDS.length],
        });
      });
    }

    if (config.reelsCategories.colors) {
      for (const color of getEnabledColors()) {
        const illustration = illus("color", color.id);
        if (!illustration) continue;
        items.push({
          type: "color",
          id: color.id,
          label: color.label,
          name: color.name,
          hex: color.hex,
          text: color.text,
          illustration,
          object: color.object,
        });
      }
    }

    if (config.reelsCategories.letters) {
      LETTERS.split("").forEach((char, i) => {
        const palette = REELS_LETTER_BACKGROUNDS[i % REELS_LETTER_BACKGROUNDS.length];
        items.push({ type: "letter", char, bg: palette.bg, fg: palette.fg });
      });
    }

    if (config.reelsCategories.words) {
      getEnabledWords().forEach((word, i) => {
        const illustration = illus("word", word.id);
        if (!illustration) return;
        items.push({
          type: "word",
          wordId: word.id,
          label: word.label,
          name: word.name,
          illustration,
          bg: WORD_BACKGROUNDS[i % WORD_BACKGROUNDS.length],
        });
      });
    }

    if (config.reelsCategories.body) {
      for (const part of getEnabledBodyParts()) {
        const illustration = illus("body", part.id);
        if (!illustration) continue;
        items.push({
          type: "body",
          id: part.id,
          label: part.label,
          name: part.name,
          bg: part.bg,
          illustration,
        });
      }
    }

    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    if (items.length === 0) {
      if (!feedResetGuard) {
        feedResetGuard = true;
        config.reelsCategories = defaultReelsCategories();
        config.colors = defaultColorToggles();
        config.words = defaultWordToggles();
        config.body = defaultBodyToggles();
        config.animals = defaultAnimalToggles();
        saveConfig();
        return buildReelsFeed();
      }
      for (const color of COLORS) {
        const illustration = illus("color", color.id);
        if (!illustration) continue;
        items.push({
          type: "color",
          id: color.id,
          label: color.label,
          name: color.name,
          hex: color.hex,
          text: color.text,
          illustration,
          object: color.object,
        });
      }
      LETTERS.split("").forEach((char, i) => {
        const palette = REELS_LETTER_BACKGROUNDS[i % REELS_LETTER_BACKGROUNDS.length];
        items.push({ type: "letter", char, bg: palette.bg, fg: palette.fg });
      });
    }

    feedResetGuard = false;
    return items;
  }

  function wordToFile(word) {
    return word.replace(/ /g, "-");
  }

  function getAudioSrc(content, type) {
    let path;
    if (type === "animal") {
      path = `audio/words/${wordToFile(ANIMALS_BY_ID[content].name)}.mp3`;
    } else if (/[0-9]/.test(content)) {
      path = `audio/numbers/${wordToFile(NUMBER_NAMES[content])}.mp3`;
    } else {
      path = `audio/letters/${content.toLowerCase()}.mp3`;
    }
    return assetUrl(path);
  }

  function stopSpeaking() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio = null;
    }
  }

  function playAudio(src, onEnd, { chain = false } = {}) {
    if (!chain) stopSpeaking();

    let finished = false;
    let safety = null;
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = src;
    currentAudio = audio;

    const done = () => {
      if (finished) return;
      finished = true;
      if (safety) clearTimeout(safety);
      if (currentAudio === audio) currentAudio = null;
      onEnd?.();
    };

    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("error", () => {
      if (!speechPrimed && !chain) {
        pendingSpeak = () => playAudio(src, onEnd, { chain });
        return;
      }
      done();
    }, { once: true });

    audio.play().then(() => {
      pendingSpeak = null;
      safety = setTimeout(done, 6000);
    }).catch(() => {
      if (!speechPrimed && !chain) {
        pendingSpeak = () => playAudio(src, onEnd, { chain });
        return;
      }
      done();
    });
  }

  function playAudioSequence(sources, onEnd) {
    pendingSpeak = () => playAudioSequence(sources, onEnd);
    let i = 0;
    function next() {
      if (i >= sources.length) {
        pendingSpeak = null;
        onEnd?.();
        return;
      }
      const idx = i + 1;
      const src = sources[i++];
      playAudio(src, next, { chain: idx > 1 });
    }
    stopSpeaking();
    next();
  }

  function unlockSpeech() {
    if (!speechPrimed) {
      speechPrimed = true;
      const prime = new Audio(assetUrl("audio/letters/a.mp3"));
      prime.volume = 0.01;
      prime.play().then(() => prime.pause()).catch(() => {});
    }
    if (pendingSpeak) {
      const retry = pendingSpeak;
      pendingSpeak = null;
      retry();
    }
  }

  function speakReelsItem(item) {
    if (item.type === "animal") {
      playAudioSequence([
        getAudioSrc(item.animalId, "animal"),
        animalSoundSrc(item.animalId),
      ]);
      return;
    }
    if (item.type === "color") {
      playAudio(assetUrl(`audio/words/${wordToFile(item.name)}.mp3`));
      return;
    }
    if (item.type === "letter") {
      if (/[0-9]/.test(item.char)) {
        playAudio(assetUrl(`audio/numbers/${wordToFile(NUMBER_NAMES[item.char])}.mp3`));
      } else {
        playAudio(assetUrl(`audio/letters/${item.char.toLowerCase()}.mp3`));
      }
      return;
    }
    if (item.type === "word") {
      playAudio(assetUrl(`audio/words/${wordToFile(item.name)}.mp3`));
      return;
    }
    if (item.type === "body") {
      playAudio(assetUrl(`audio/body/${wordToFile(item.name)}.mp3`));
      return;
    }
  }

  function refreshReels() {
    if (window.TecladinhoReels) window.TecladinhoReels.refresh();
  }

  function syncReelsConfigSections() {
    reelsAnimalsSection.classList.toggle("is-disabled-section", !config.reelsCategories.animals);
    reelsColorsSection.classList.toggle("is-disabled-section", !config.reelsCategories.colors);
    reelsWordsSection.classList.toggle("is-disabled-section", !config.reelsCategories.words);
    reelsBodySection.classList.toggle("is-disabled-section", !config.reelsCategories.body);
  }

  function thumbHtml(type, id, fallback) {
    const src = illus(type, id);
    return src
      ? `<img src="${src}" alt="" width="48" height="48" loading="lazy" class="config__color-thumb">`
      : `<span class="config__word-fallback">${fallback}</span>`;
  }

  function buildBodyConfigList() {
    bodyListEl.innerHTML = "";
    BODY_PARTS.forEach((part) => {
      const label = document.createElement("label");
      label.className = "config__animal";
      label.innerHTML = `
        <input type="checkbox" data-body="${part.id}" ${config.body[part.id] ? "checked" : ""}>
        ${thumbHtml("body", part.id, part.label.charAt(0))}
        <span>${part.label}</span>
      `;
      label.querySelector("input").addEventListener("change", (e) => {
        config.body[part.id] = e.target.checked;
        saveConfig();
        refreshReels();
      });
      bodyListEl.appendChild(label);
    });
  }

  function buildColorConfigList() {
    colorListEl.innerHTML = "";
    COLORS.forEach((color) => {
      const label = document.createElement("label");
      label.className = "config__animal config__color";
      label.innerHTML = `
        <input type="checkbox" data-color="${color.id}" ${config.colors[color.id] ? "checked" : ""}>
        ${thumbHtml("color", color.id, color.label.charAt(0))}
        <span class="config__swatch" style="background:${color.hex}"></span>
        <span>${color.label} · ${color.object}</span>
      `;
      label.querySelector("input").addEventListener("change", (e) => {
        config.colors[color.id] = e.target.checked;
        saveConfig();
        refreshReels();
      });
      colorListEl.appendChild(label);
    });
  }

  function buildWordConfigList() {
    wordListEl.innerHTML = "";
    WORDS.forEach((word) => {
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
        refreshReels();
      });
      wordListEl.appendChild(label);
    });
  }

  function buildAnimalConfigList() {
    animalListEl.innerHTML = "";
    ANIMALS.forEach((animal) => {
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
        refreshReels();
      });
      animalListEl.appendChild(label);
    });
  }

  function syncConfigUI() {
    document.getElementById("cfg-reels-animals").checked = config.reelsCategories.animals;
    document.getElementById("cfg-reels-colors").checked = config.reelsCategories.colors;
    document.getElementById("cfg-reels-letters").checked = config.reelsCategories.letters;
    document.getElementById("cfg-reels-words").checked = config.reelsCategories.words;
    document.getElementById("cfg-reels-body").checked = config.reelsCategories.body;
    animalListEl.querySelectorAll("[data-animal]").forEach((input) => {
      input.checked = config.animals[input.dataset.animal];
    });
    colorListEl.querySelectorAll("[data-color]").forEach((input) => {
      input.checked = config.colors[input.dataset.color];
    });
    wordListEl.querySelectorAll("[data-word]").forEach((input) => {
      input.checked = config.words[input.dataset.word];
    });
    bodyListEl.querySelectorAll("[data-body]").forEach((input) => {
      input.checked = config.body[input.dataset.body];
    });
    syncReelsConfigSections();
  }

  function openConfig() {
    configOpen = true;
    configPanel.classList.add("is-open");
    configPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("config-open");
    syncConfigUI();
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
    if (touchHoldRaf) cancelAnimationFrame(touchHoldRaf);
    touchHoldRaf = null;
  }

  function cancelTouchHold() {
    if (touchHoldTimer) clearTimeout(touchHoldTimer);
    touchHoldTimer = null;
    touchHoldStart = null;
    hideHoldProgress();
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

  document.getElementById("config-close").addEventListener("click", closeConfig);
  configPanel.addEventListener("click", (e) => {
    if (e.target === configPanel) closeConfig();
  });

  ["animals", "colors", "letters", "words", "body"].forEach((cat) => {
    document.getElementById(`cfg-reels-${cat}`).addEventListener("change", (e) => {
      config.reelsCategories[cat] = e.target.checked;
      saveConfig();
      syncConfigUI();
      refreshReels();
    });
  });

  document.getElementById("cfg-select-all-animals").addEventListener("click", () => {
    ANIMALS.forEach((a) => { config.animals[a.id] = true; });
    saveConfig();
    syncConfigUI();
    refreshReels();
  });

  document.getElementById("cfg-deselect-all-animals").addEventListener("click", () => {
    ANIMALS.forEach((a) => { config.animals[a.id] = false; });
    saveConfig();
    syncConfigUI();
    refreshReels();
  });

  document.getElementById("cfg-select-all-colors").addEventListener("click", () => {
    COLORS.forEach((c) => { config.colors[c.id] = true; });
    saveConfig();
    syncConfigUI();
    refreshReels();
  });

  document.getElementById("cfg-deselect-all-colors").addEventListener("click", () => {
    COLORS.forEach((c) => { config.colors[c.id] = false; });
    saveConfig();
    syncConfigUI();
    refreshReels();
  });

  document.getElementById("cfg-select-all-words").addEventListener("click", () => {
    WORDS.forEach((w) => { config.words[w.id] = true; });
    saveConfig();
    syncConfigUI();
    refreshReels();
  });

  document.getElementById("cfg-deselect-all-words").addEventListener("click", () => {
    WORDS.forEach((w) => { config.words[w.id] = false; });
    saveConfig();
    syncConfigUI();
    refreshReels();
  });

  document.getElementById("cfg-select-all-body").addEventListener("click", () => {
    BODY_PARTS.forEach((b) => { config.body[b.id] = true; });
    saveConfig();
    syncConfigUI();
    refreshReels();
  });

  document.getElementById("cfg-deselect-all-body").addEventListener("click", () => {
    BODY_PARTS.forEach((b) => { config.body[b.id] = false; });
    saveConfig();
    syncConfigUI();
    refreshReels();
  });

  function onTwoFingerHoldEnd(remainingPointers) {
    const holdDuration = touchHoldStart ? Date.now() - touchHoldStart : 0;
    if (remainingPointers >= 2) return;
    if (touchHoldTimer && holdDuration < HOLD_MS) cancelTouchHold();
    else if (remainingPointers === 0) cancelTouchHold();
  }

  function bootReels() {
    try {
      window.TecladinhoReels.init({
        root: document.getElementById("reels"),
        buildFeed: buildReelsFeed,
        speakItem: speakReelsItem,
        unlockSpeech,
        stopSpeak: stopSpeaking,
        onTwoFingerHoldStart: startTouchHold,
        onTwoFingerHoldEnd: onTwoFingerHoldEnd,
      });
      buildAnimalConfigList();
      buildColorConfigList();
      buildWordConfigList();
      buildBodyConfigList();
      window.TecladinhoReels.activate();
      window.__reelsReady = true;
      if (window.__reelsMarkReady) window.__reelsMarkReady();
    } catch (err) {
      console.error("Tecladinho Reels boot failed:", err);
      const track = document.querySelector(".reels__track");
      if (track) {
        track.innerHTML = "<p class=\"reels__empty\">Erro ao carregar. Recarregue a página.</p>";
      }
    }
  }

  bootReels();
  loadManifest();

  async function loadManifest() {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(assetUrl("data/manifest.json"), { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) variants = await res.json();
    } catch {
      /* optional */
    }
  }
})();
