(function () {
  const ASSET_BASE = new URL("/kids/", window.location.origin);
  const CONFIG_KEY = "tecladinho-reels-config";
  const PARENT_HOLD_MS = 2500;
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
    { id: "coelho", name: "coelho", label: "Coelho" },
    { id: "peixe", name: "peixe", label: "Peixe" },
    { id: "pinguim", name: "pinguim", label: "Pinguim" },
    { id: "tartaruga", name: "tartaruga", label: "Tartaruga" },
    { id: "borboleta", name: "borboleta", label: "Borboleta" },
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
    { id: "melancia", name: "melancia", label: "Melancia" },
    { id: "laranja", name: "laranja", label: "Laranja" },
    { id: "agua", name: "água", label: "Água" },
    { id: "leite", name: "leite", label: "Leite" },
    { id: "estrela", name: "estrela", label: "Estrela" },
    { id: "flor", name: "flor", label: "Flor" },
    { id: "bebe", name: "bebê", label: "Bebê" },
    { id: "pao", name: "pão", label: "Pão" },
    { id: "abraco", name: "abraço", label: "Abraço" },
    { id: "beijo", name: "beijo", label: "Beijo" },
    { id: "dormir", name: "dormir", label: "Dormir" },
    { id: "balao", name: "balão", label: "Balão" },
    { id: "bolha", name: "bolha", label: "Bolha" },
    { id: "carrossel", name: "carrossel", label: "Carrossel" },
    { id: "coracao", name: "coração", label: "Coração" },
    { id: "festa", name: "festa", label: "Festa" },
    { id: "musica", name: "música", label: "Música" },
    { id: "pirulito", name: "pirulito", label: "Pirulito" },
    { id: "arcoiris", name: "arco-íris", label: "Arco-íris" },
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
    { id: "vermelho", name: "vermelho", label: "Vermelho", hex: "#E53935", shape: "circle" },
    { id: "azul", name: "azul", label: "Azul", hex: "#1E88E5", shape: "square" },
    { id: "amarelo", name: "amarelo", label: "Amarelo", hex: "#FDD835", text: "#333", shape: "triangle" },
    { id: "verde", name: "verde", label: "Verde", hex: "#43A047", shape: "hexagon" },
    { id: "laranja", name: "laranja", label: "Laranja", hex: "#FB8C00", shape: "diamond" },
    { id: "roxo", name: "roxo", label: "Roxo", hex: "#8E24AA", shape: "pentagon" },
    { id: "rosa", name: "rosa", label: "Rosa", hex: "#EC407A", shape: "circle" },
    { id: "branco", name: "branco", label: "Branco", hex: "#FFFFFF", text: "#333", shape: "square", outline: true },
    { id: "preto", name: "preto", label: "Preto", hex: "#212121", shape: "triangle" },
    { id: "marrom", name: "marrom", label: "Marrom", hex: "#6D4C41", shape: "hexagon" },
    { id: "cinza", name: "cinza", label: "Cinza", hex: "#757575", shape: "diamond" },
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
    tapRepeat: true,
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
        tapRepeat: parsed.tapRepeat !== false,
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
  let speakGeneration = 0;
  let audioCtx = null;
  const audioPool = new Map();
  let configOpen = false;
  let parentHoldRaf = null;

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

  function pickAnimalSound(id) {
    const canonical = `audio/sounds/${id}.mp3`;
    const manifestSounds = (variants[id]?.sounds || []).filter((path) => {
      const file = path.split("/").pop() || "";
      return file === `${id}.mp3` || file.startsWith(`${id}-`);
    });
    const pool = manifestSounds.length
      ? manifestSounds
      : [canonical, `audio/sounds/${id}-1.mp3`];
    const preferred = pool.find((path) => path.endsWith(`/${id}.mp3`));
    return assetUrl(preferred || pool[0]);
  }

  function interleavePools(pools) {
    const queues = pools.filter((pool) => pool.length > 0).map((pool) => [...pool]);
    const items = [];
    while (queues.length) {
      shuffleInPlace(queues);
      for (let i = queues.length - 1; i >= 0; i--) {
        if (!queues[i].length) {
          queues.splice(i, 1);
          continue;
        }
        items.push(queues[i].shift());
        if (!queues[i].length) queues.splice(i, 1);
      }
    }
    return items;
  }

  function animalWordSrc(id) {
    const animal = ANIMALS_BY_ID[id];
    if (!animal) return null;
    return assetUrl(`audio/words/${wordToFile(animal.name)}.mp3`);
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

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildReelsFeed() {
    const blocks = [];

    if (config.reelsCategories.animals) {
      const animalItems = [];
      getEnabledAnimals().forEach((animal, i) => {
        const illustration = illus("animal", animal.id);
        if (!illustration) return;
        animalItems.push({
          type: "animal",
          animalId: animal.id,
          label: animal.label,
          illustration,
          bg: ANIMAL_BACKGROUNDS[i % ANIMAL_BACKGROUNDS.length],
          wordAudio: animalWordSrc(animal.id),
          soundAudio: pickAnimalSound(animal.id),
        });
      });
      if (animalItems.length) blocks.push(shuffleInPlace(animalItems));
    }

    if (config.reelsCategories.colors) {
      const colorItems = getEnabledColors().map((color) => ({
        type: "color",
        id: color.id,
        label: color.label,
        name: color.name,
        hex: color.hex,
        text: color.text,
        shape: color.shape,
        outline: color.outline,
        bg: "#ECEFF1",
      }));
      if (colorItems.length) blocks.push(shuffleInPlace(colorItems));
    }

    if (config.reelsCategories.words) {
      const wordItems = [];
      getEnabledWords().forEach((word, i) => {
        const illustration = illus("word", word.id);
        if (!illustration) return;
        wordItems.push({
          type: "word",
          wordId: word.id,
          label: word.label,
          name: word.name,
          illustration,
          bg: WORD_BACKGROUNDS[i % WORD_BACKGROUNDS.length],
        });
      });
      if (wordItems.length) blocks.push(shuffleInPlace(wordItems));
    }

    if (config.reelsCategories.body) {
      const bodyItems = [];
      for (const part of getEnabledBodyParts()) {
        if (part.id === "barriga") {
          bodyItems.push({
            type: "body",
            id: part.id,
            label: part.label,
            name: part.name,
            bg: part.bg,
            illustration: null,
            bodyBall: true,
          });
          continue;
        }
        const illustration = illus("body", part.id);
        if (!illustration) continue;
        bodyItems.push({
          type: "body",
          id: part.id,
          label: part.label,
          name: part.name,
          bg: part.bg,
          illustration,
          bodyBall: false,
        });
      }
      if (bodyItems.length) blocks.push(shuffleInPlace(bodyItems));
    }

    if (config.reelsCategories.letters) {
      const letterItems = LETTERS.split("").map((char, i) => {
        const palette = REELS_LETTER_BACKGROUNDS[i % REELS_LETTER_BACKGROUNDS.length];
        return { type: "letter", char, bg: palette.bg, fg: palette.fg };
      });
      if (letterItems.length) blocks.push(shuffleInPlace(letterItems));
    }

    const items = interleavePools(blocks);

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
          shape: color.shape,
          outline: color.outline,
          bg: "#ECEFF1",
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

  function abortCurrentAudio() {
    if (!currentAudio) return;
    const audio = currentAudio;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.currentTime = 0;
    currentAudio = null;
  }

  function cancelSpeech() {
    speakGeneration += 1;
    abortCurrentAudio();
    pendingSpeak = null;
  }

  function startSpeech(item) {
    speakGeneration += 1;
    abortCurrentAudio();
    const gen = speakGeneration;
    pendingSpeak = () => {
      if (gen === speakGeneration) speakReelsItem(item, { immediate: true });
    };
    return gen;
  }

  function stopSpeaking() {
    cancelSpeech();
  }

  function warmAudio(src) {
    if (!src || audioPool.has(src)) return audioPool.get(src);
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = src;
    audio.load();
    audioPool.set(src, audio);
    return audio;
  }

  function preloadAudio(src) {
    if (!src) return Promise.resolve(null);
    const audio = warmAudio(src);
    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      return Promise.resolve(audio);
    }
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        audio.removeEventListener("canplaythrough", done);
        audio.removeEventListener("canplay", done);
        audio.removeEventListener("loadeddata", done);
        resolve(audio);
      };
      const timer = setTimeout(done, 1000);
      audio.addEventListener("canplaythrough", done, { once: true });
      audio.addEventListener("canplay", done, { once: true });
      audio.addEventListener("loadeddata", done, { once: true });
      audio.load();
    });
  }

  function audioSourcesForItem(item) {
    if (!item) return [];
    if (item.type === "animal") {
      const word = item.wordAudio || animalWordSrc(item.animalId);
      const sound = item.soundAudio || pickAnimalSound(item.animalId);
      return [word, sound].filter(Boolean);
    }
    if (item.type === "color") {
      return [assetUrl(`audio/words/${wordToFile(item.name)}.mp3`)];
    }
    if (item.type === "letter") {
      if (/[0-9]/.test(item.char)) {
        return [assetUrl(`audio/numbers/${wordToFile(NUMBER_NAMES[item.char])}.mp3`)];
      }
      return [assetUrl(`audio/letters/${item.char.toLowerCase()}.mp3`)];
    }
    if (item.type === "word") {
      return [assetUrl(`audio/words/${wordToFile(item.name)}.mp3`)];
    }
    if (item.type === "body") {
      return [assetUrl(`audio/body/${wordToFile(item.name)}.mp3`)];
    }
    return [];
  }

  function warmItem(item) {
    if (!item) return;
    audioSourcesForItem(item).forEach((src) => preloadAudio(src));
    if (item.illustration) {
      const probe = new Image();
      probe.src = item.illustration;
    }
  }

  function ensureAudioUnlocked() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        /* ignore */
      }
    }
    if (audioCtx?.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    if (!speechPrimed) {
      speechPrimed = true;
      if (audioCtx) {
        try {
          const buffer = audioCtx.createBuffer(1, 1, 22050);
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start(0);
        } catch {
          /* ignore */
        }
      }
      const prime = warmAudio(assetUrl("audio/letters/a.mp3"));
      prime.volume = 0.001;
      prime.play().catch(() => {});
    }
  }

  function playAudio(src, onEnd, { chain = false, gen, immediate = false } = {}) {
    if (!src) {
      onEnd?.();
      return;
    }
    const token = gen ?? speakGeneration;
    if (!chain) abortCurrentAudio();

    const audio = warmAudio(src);
    let ended = false;

    const finish = (invokeEnd = true) => {
      if (ended || token !== speakGeneration) return;
      ended = true;
      audio.onended = null;
      audio.onerror = null;
      if (currentAudio === audio) currentAudio = null;
      if (invokeEnd) onEnd?.();
    };

    const startPlay = () => {
      if (ended || token !== speakGeneration) return;
      audio.currentTime = 0;
      currentAudio = audio;
      audio.onended = () => finish(true);
      audio.onerror = () => finish(true);
      const playPromise = audio.play();
      if (!playPromise) return;
      playPromise.then(() => {
        if (token === speakGeneration) pendingSpeak = null;
      }).catch(() => {
        if (token !== speakGeneration) return;
        if (audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          const retry = () => {
            if (token !== speakGeneration || !audio.paused) return;
            startPlay();
          };
          audio.addEventListener("canplay", retry, { once: true });
          audio.addEventListener("loadeddata", retry, { once: true });
          return;
        }
        ended = true;
        audio.onended = null;
        audio.onerror = null;
        if (currentAudio === audio) currentAudio = null;
      });
    };

    if (immediate) {
      startPlay();
      return;
    }

    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPlay();
    } else {
      const onReady = () => {
        if (ended || token !== speakGeneration) return;
        startPlay();
      };
      audio.addEventListener("canplaythrough", onReady, { once: true });
      audio.addEventListener("canplay", onReady, { once: true });
      audio.addEventListener("loadeddata", onReady, { once: true });
      setTimeout(onReady, 800);
      audio.load();
    }
  }

  function speakAnimalItem(item, gen, immediate = false) {
    const wordSrc = item.wordAudio || animalWordSrc(item.animalId);
    const soundSrc = item.soundAudio || pickAnimalSound(item.animalId);

    preloadAudio(wordSrc);
    if (soundSrc) preloadAudio(soundSrc);

    playAudio(wordSrc, () => {
      if (gen !== speakGeneration || !soundSrc) return;
      playAudio(soundSrc, null, { chain: true, gen, immediate: true });
    }, { gen, immediate });
  }

  function colorThumbHtml(color) {
    const outline = color.outline ? " config__shape-preview--outline" : "";
    return `<span class="config__shape-preview config__shape-preview--${color.shape}${outline}" style="--shape-fill:${color.hex}"></span>`;
  }

  function unlockSpeech() {
    ensureAudioUnlocked();
    if (pendingSpeak) {
      const retry = pendingSpeak;
      pendingSpeak = null;
      retry();
    }
  }

  function speakReelsItem(item, options = {}) {
    if (!item) return;
    const immediate = Boolean(options.immediate);
    const gen = startSpeech(item);
    warmItem(item);

    if (item.type === "animal") {
      speakAnimalItem(item, gen, immediate);
      return;
    }
    if (item.type === "color") {
      playAudio(assetUrl(`audio/words/${wordToFile(item.name)}.mp3`), null, { gen, immediate });
      return;
    }
    if (item.type === "letter") {
      if (/[0-9]/.test(item.char)) {
        playAudio(assetUrl(`audio/numbers/${wordToFile(NUMBER_NAMES[item.char])}.mp3`), null, { gen, immediate });
      } else {
        playAudio(assetUrl(`audio/letters/${item.char.toLowerCase()}.mp3`), null, { gen, immediate });
      }
      return;
    }
    if (item.type === "word") {
      playAudio(assetUrl(`audio/words/${wordToFile(item.name)}.mp3`), null, { gen, immediate });
      return;
    }
    if (item.type === "body") {
      playAudio(assetUrl(`audio/body/${wordToFile(item.name)}.mp3`), null, { gen, immediate });
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

  function bodyThumbHtml(part) {
    if (part.id === "barriga") {
      return `<span class="config__shape-preview config__shape-preview--circle" style="--shape-fill:#FDD835"></span>`;
    }
    return thumbHtml("body", part.id, part.label.charAt(0));
  }

  function buildBodyConfigList() {
    bodyListEl.innerHTML = "";
    BODY_PARTS.forEach((part) => {
      const label = document.createElement("label");
      label.className = "config__animal";
      label.innerHTML = `
        <input type="checkbox" data-body="${part.id}" ${config.body[part.id] ? "checked" : ""}>
        ${bodyThumbHtml(part)}
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
        ${colorThumbHtml(color)}
        <span>${color.label}</span>
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
    document.getElementById("cfg-tap-repeat").checked = config.tapRepeat;
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

  function openConfig() {
    configOpen = true;
    configPanel.classList.add("is-open");
    configPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("config-open");
    syncConfigUI();
    hideParentHoldProgress();
  }

  function closeConfig() {
    configOpen = false;
    configPanel.classList.remove("is-open");
    configPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("config-open");
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

  document.getElementById("cfg-tap-repeat").addEventListener("change", (e) => {
    config.tapRepeat = e.target.checked;
    saveConfig();
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

  function illusFallback(item) {
    if (!item || item.type !== "animal") return null;
    return ILLUS()?.fallback?.("animal", item.animalId) || null;
  }

  function bootReels() {
    try {
      window.TecladinhoReels.init({
        root: document.getElementById("reels"),
        buildFeed: buildReelsFeed,
        speakItem: speakReelsItem,
        unlockSpeech,
        stopSpeak: stopSpeaking,
        warmItem,
        illusFallback,
        onParentHoldComplete: openConfig,
        onParentHoldProgress: showParentHoldProgress,
        onParentHoldCancel: hideParentHoldProgress,
        isConfigOpen: () => configOpen,
        parentHoldMs: () => PARENT_HOLD_MS,
        tapToRepeat: () => config.tapRepeat,
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

  async function initApp() {
    await loadManifest();
    bootReels();
  }

  initApp();
})();
