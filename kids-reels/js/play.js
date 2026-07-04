(function () {
  const ASSET_BASE = new URL("../kids/", window.location.href);
  const CONFIG_KEY = "tecladinho-reels-config";
  const HOLD_MS = 2000;
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

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
    { id: "cabeca", name: "cabeça", label: "Cabeça", bg: "#FFE0B2", image: "images/body/cabeca.jpg" },
    { id: "pe", name: "pé", label: "Pé", bg: "#E1BEE7", image: "images/body/pe.jpg" },
    { id: "olhos", name: "olhos", label: "Olhos", bg: "#BBDEFB", image: "images/body/olhos.jpg" },
    { id: "orelha", name: "orelha", label: "Orelha", bg: "#FFECB3", image: "images/body/orelha.jpg" },
    { id: "nariz", name: "nariz", label: "Nariz", bg: "#FFCDD2", image: "images/body/nariz.jpg" },
    { id: "boca", name: "boca", label: "Boca", bg: "#F8BBD0", image: "images/body/boca.jpg" },
    { id: "mao", name: "mão", label: "Mão", bg: "#FFCCBC", image: "images/body/mao.jpg" },
    { id: "braco", name: "braço", label: "Braço", bg: "#FFAB91", image: "images/body/braco.png" },
    { id: "perna", name: "perna", label: "Perna", bg: "#C5CAE9", image: "images/body/perna.jpg" },
    { id: "barriga", name: "barriga", label: "Barriga", bg: "#DCEDC8", image: "images/body/barriga.jpg" },
    { id: "cabelo", name: "cabelo", label: "Cabelo", bg: "#D7CCC8", image: "images/body/cabelo.jpg" },
    { id: "dente", name: "dente", label: "Dente", bg: "#E0F7FA", image: "images/body/dente.jpg" },
  ];

  const COLORS = [
    { id: "vermelho", name: "vermelho", label: "Vermelho", hex: "#E53935", image: "images/colors/vermelho.jpg", object: "Morango" },
    { id: "azul", name: "azul", label: "Azul", hex: "#1E88E5", image: "images/colors/azul.png", object: "Bola" },
    { id: "amarelo", name: "amarelo", label: "Amarelo", hex: "#FDD835", text: "#333", image: "images/colors/amarelo.jpg", object: "Banana" },
    { id: "verde", name: "verde", label: "Verde", hex: "#43A047", image: "images/colors/verde.jpg", object: "Maçã" },
    { id: "laranja", name: "laranja", label: "Laranja", hex: "#FB8C00", image: "images/colors/laranja.jpg", object: "Laranja" },
    { id: "roxo", name: "roxo", label: "Roxo", hex: "#8E24AA", image: "images/colors/roxo.jpg", object: "Uva" },
    { id: "rosa", name: "rosa", label: "Rosa", hex: "#EC407A", image: "images/colors/rosa.jpg", object: "Flor" },
    { id: "branco", name: "branco", label: "Branco", hex: "#E8EAF6", text: "#333", image: "images/colors/branco.jpg", object: "Nuvem" },
    { id: "preto", name: "preto", label: "Preto", hex: "#212121", image: "images/colors/preto.jpg", object: "Gato" },
    { id: "marrom", name: "marrom", label: "Marrom", hex: "#6D4C41", image: "images/colors/marrom.jpg", object: "Urso" },
    { id: "cinza", name: "cinza", label: "Cinza", hex: "#757575", image: "images/colors/cinza.jpg", object: "Elefante" },
  ];

  const REELS_LETTER_BACKGROUNDS = [
    { bg: "#5C6BC0", fg: "#FFFFFF" },
    { bg: "#26A69A", fg: "#FFFFFF" },
    { bg: "#EF5350", fg: "#FFFFFF" },
    { bg: "#FFA726", fg: "#333333" },
    { bg: "#AB47BC", fg: "#FFFFFF" },
    { bg: "#42A5F5", fg: "#FFFFFF" },
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

  function loadConfig() {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (!saved) return structuredClone(DEFAULT_CONFIG);
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
      return structuredClone(DEFAULT_CONFIG);
    }
  }

  let variants = {};
  let config = loadConfig();
  let currentAudio = null;
  let speechPrimed = false;
  let configOpen = false;
  let touchHoldTimer = null;
  let touchHoldStart = null;
  let touchHoldRaf = null;
  let activePointers = new Set();

  function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  function assetUrl(path) {
    return new URL(path, ASSET_BASE).href;
  }

  function animalImages(id) {
    const list = variants[id]?.images;
    return list?.length ? list.map(assetUrl) : [assetUrl(`images/animals/${id}.jpg`)];
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

  function animalVideos(id) {
    const list = variants[id]?.videos;
    const fromManifest = list?.filter((p) => p.startsWith("videos/animals/")) || [];
    if (fromManifest.length) return fromManifest;
    return [`videos/animals/${id}-1.mp4`, `videos/animals/${id}.mp4`];
  }

  function wordVideos(id) {
    const list = variants[id]?.videos;
    const fromManifest = list?.filter((p) => p.startsWith("videos/words/")) || [];
    if (fromManifest.length) return fromManifest;
    return [`videos/words/${id}-1.mp4`];
  }

  let feedResetGuard = false;

  function buildReelsFeed() {
    const items = [];

    if (config.reelsCategories.animals) {
      for (const animal of getEnabledAnimals()) {
        for (const src of animalVideos(animal.id)) {
          items.push({ type: "animal", animalId: animal.id, label: animal.label, src });
        }
      }
    }

    if (config.reelsCategories.colors) {
      for (const color of getEnabledColors()) {
        items.push({
          type: "color",
          id: color.id,
          label: color.label,
          name: color.name,
          hex: color.hex,
          text: color.text,
          image: color.image,
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
      for (const word of getEnabledWords()) {
        for (const src of wordVideos(word.id)) {
          items.push({
            type: "word",
            wordId: word.id,
            label: word.label,
            name: word.name,
            src,
          });
        }
      }
    }

    if (config.reelsCategories.body) {
      for (const part of getEnabledBodyParts()) {
        items.push({
          type: "body",
          id: part.id,
          label: part.label,
          name: part.name,
          bg: part.bg,
          image: part.image,
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
        items.push({
          type: "color",
          id: color.id,
          label: color.label,
          name: color.name,
          hex: color.hex,
          text: color.text,
          image: color.image,
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

  function playAudio(src, onEnd) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.onended = null;
      currentAudio = null;
    }

    let finished = false;
    const audio = new Audio(src);
    currentAudio = audio;

    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(safety);
      if (currentAudio === audio) currentAudio = null;
      onEnd?.();
    };

    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("error", done, { once: true });
    const safety = setTimeout(done, 3500);
    audio.play().catch(done);
  }

  function unlockSpeech() {
    if (speechPrimed) return;
    speechPrimed = true;
    const prime = new Audio(assetUrl("audio/letters/a.mp3"));
    prime.volume = 0.01;
    prime.play().then(() => prime.pause()).catch(() => {});
  }

  function speakReelsItem(item, onEnd) {
    if (item.type === "animal") {
      playAudio(getAudioSrc(item.animalId, "animal"), onEnd);
      return;
    }
    if (item.type === "color") {
      playAudio(assetUrl(`audio/words/${wordToFile(item.name)}.mp3`), onEnd);
      return;
    }
    if (item.type === "letter") {
      if (/[0-9]/.test(item.char)) {
        playAudio(assetUrl(`audio/numbers/${wordToFile(NUMBER_NAMES[item.char])}.mp3`), onEnd);
      } else {
        playAudio(assetUrl(`audio/letters/${item.char.toLowerCase()}.mp3`), onEnd);
      }
      return;
    }
    if (item.type === "word") {
      playAudio(assetUrl(`audio/words/${wordToFile(item.name)}.mp3`), onEnd);
      return;
    }
    if (item.type === "body") {
      playAudio(assetUrl(`audio/body/${wordToFile(item.name)}.mp3`), onEnd);
      return;
    }
    onEnd?.();
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

  function buildBodyConfigList() {
    bodyListEl.innerHTML = "";
    BODY_PARTS.forEach((part) => {
      const label = document.createElement("label");
      label.className = "config__animal";
      label.innerHTML = `
        <input type="checkbox" data-body="${part.id}" ${config.body[part.id] ? "checked" : ""}>
        <img src="${assetUrl(part.image)}" alt="" width="48" height="48" loading="lazy" class="config__color-thumb">
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
        <img src="${assetUrl(color.image)}" alt="" width="48" height="48" loading="lazy" class="config__color-thumb">
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
      const thumb = wordVideos(word.id)[0];
      const thumbHtml = thumb
        ? `<video src="${assetUrl(thumb)}" muted playsinline preload="metadata" width="48" height="48"></video>`
        : `<span class="config__word-fallback">${word.label.charAt(0)}</span>`;
      label.innerHTML = `
        <input type="checkbox" data-word="${word.id}" ${config.words[word.id] ? "checked" : ""}>
        ${thumbHtml}
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
        <img src="${animalImages(animal.id)[0]}" alt="" width="48" height="48" loading="lazy">
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
  }, { passive: true });

  document.addEventListener("pointercancel", (e) => {
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) cancelTouchHold();
  }, { passive: true });

  function bootReels() {
    try {
      window.TecladinhoReels.init({
        root: document.getElementById("reels"),
        buildFeed: buildReelsFeed,
        assetUrl,
        speakItem: speakReelsItem,
        unlockSpeech,
      });
      buildAnimalConfigList();
      buildColorConfigList();
      buildWordConfigList();
      buildBodyConfigList();
      window.TecladinhoReels.activate();
    } catch (err) {
      console.error("Tecladinho Reels boot failed:", err);
      const track = document.querySelector(".reels__track");
      if (track) {
        track.innerHTML = "<p class=\"reels__empty\">Erro ao carregar. Recarregue a página.</p>";
      }
    }
  }

  async function loadManifest() {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(assetUrl("data/manifest.json"), { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        variants = await res.json();
        buildAnimalConfigList();
        buildWordConfigList();
        refreshReels();
      }
    } catch {
      /* manifest optional */
    }
  }

  bootReels();
  loadManifest();
})();
