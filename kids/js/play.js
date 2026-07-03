(function () {
  const stage = document.getElementById("stage");
  const burstLayer = document.getElementById("burst-layer");
  const hint = document.getElementById("hint");

  const BURST_COLORS = [
    "#FF3366", "#FF6B35", "#FFD23F", "#3DD68C",
    "#00C2FF", "#7B61FF", "#FF61DC", "#F9A8D4",
  ];

  const LETTER_COLORS = [
    "#FFFFFF", "#FFF59D", "#FFAB91", "#80D8FF",
    "#B9F6CA", "#FFD180", "#EA80FC", "#F48FB1",
    "#84FFFF", "#FFE082",
  ];

  const ANIMALS = [
    "🐱", "🐶", "🐸", "🐥", "🐠", "🦆", "🐝", "🦋",
    "🐻", "🐰", "🐮", "🐷", "🦁", "🐯", "🐨", "🐼",
    "🦊", "🐢", "🐙", "🐘", "🦒", "🐧", "🦜", "🐿️",
  ];

  const EMOJIS = [
    ...ANIMALS,
    "🌙", "🌛", "🌜", "⭐", "☀️", "🌈",
    "🎈", "🎉", "💖", "🍎", "🍌", "🍓", "🧸",
    "🎵", "💫", "🌸", "🍭", "🫧", "🎠", "🍉",
  ];

  const NUMBER_NAMES = {
    0: "zero", 1: "um", 2: "dois", 3: "três", 4: "quatro",
    5: "cinco", 6: "seis", 7: "sete", 8: "oito", 9: "nove",
  };

  const PREFERRED_VOICE_NAMES = [
    "luciana (enhanced)",
    "luciana",
    "francisca (enhanced)",
    "francisca",
    "fernanda",
    "google português do brasil",
    "google português",
    "amanda",
    "vitória",
    "vitoria",
    "maria",
    "joana",
  ];

  const EMOJI_NAMES = {
    "🐱": "gatinho", "🐶": "cachorrinho", "🐸": "sapinho", "🐥": "pintinho",
    "🐠": "peixinho", "🦆": "patinho", "🐝": "abelhinha", "🦋": "borboleta",
    "🐻": "ursinho", "🐰": "coelhinho", "🐮": "vaquinha", "🐷": "porquinho",
    "🦁": "leãozinho", "🐯": "tigrinho", "🐨": "coala", "🐼": "pandinha",
    "🦊": "raposinha", "🐢": "tartaruguinha", "🐙": "polvo", "🐘": "elefantinho",
    "🦒": "girafa", "🐧": "penguim", "🦜": "papagaio", "🐿️": "esquilo",
    "🌙": "lua", "🌛": "lua", "🌜": "lua", "⭐": "estrela", "☀️": "sol",
    "🌈": "arco-íris", "🎈": "balão", "🎉": "festa", "💖": "coração",
    "🍎": "maçã", "🍌": "banana", "🍓": "morango", "🧸": "ursinho de pelúcia",
    "🎵": "música", "💫": "estrelinha", "🌸": "flor", "🍭": "pirulito",
    "🫧": "bolha", "🎠": "carrossel", "🍉": "melancia",
  };

  const MAX_CHARS = 10;
  const CHAR_LIFETIME_MS = 14000;

  let activeChars = [];
  let hideHintTimer = null;
  let lastEmoji = null;
  let ptVoice = null;
  let speechReady = false;

  const speech = window.speechSynthesis;

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickEmoji() {
    let emoji;
    do {
      emoji = pick(EMOJIS);
    } while (emoji === lastEmoji && EMOJIS.length > 1);
    lastEmoji = emoji;
    return emoji;
  }

  function isLetterOrNumber(key) {
    return /^[a-zA-Z0-9]$/.test(key);
  }

  function isFunctionKey(key) {
    return /^F([1-9]|1[0-2])$/.test(key);
  }

  function isFemaleVoice(voice) {
    const name = voice.name.toLowerCase();
    return (
      voice.gender === "female" ||
      /female|feminina|luciana|francisca|maria|amanda|vitória|vitoria|fernanda|joana/i.test(name)
    );
  }

  function isRoboticVoice(voice) {
    const name = voice.name.toLowerCase();
    return /compact|espeak|synthetic|robot|fred|junior|ralph/i.test(name);
  }

  function scoreVoice(voice) {
    const name = voice.name.toLowerCase();
    let score = 0;

    if (voice.lang === "pt-BR") score += 60;
    else if (voice.lang.startsWith("pt")) score += 35;

    if (voice.gender === "female") score += 45;
    else if (isFemaleVoice(voice)) score += 30;

    if (/enhanced|premium|neural|natural|wavenet|siri/i.test(name)) score += 80;

    const preferredIndex = PREFERRED_VOICE_NAMES.findIndex((v) => name.includes(v));
    if (preferredIndex !== -1) score += 100 - preferredIndex * 8;

    if (isRoboticVoice(voice)) score -= 80;

    if (voice.localService) score += 10;

    return score;
  }

  function loadVoice() {
    if (!speech) return;

    const voices = speech.getVoices();
    const ptVoices = voices.filter((v) => v.lang.startsWith("pt"));

    if (ptVoices.length === 0) {
      speechReady = true;
      return;
    }

    ptVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    ptVoice = ptVoices[0];
    speechReady = true;
  }

  function getSpeechText(content, type) {
    if (type === "emoji") {
      return EMOJI_NAMES[content] || "figurinha";
    }
    if (/[0-9]/.test(content)) {
      return NUMBER_NAMES[content] || content;
    }
    return content.toLowerCase();
  }

  function speak(content, type) {
    if (!speech || !speechReady) return;

    const text = getSpeechText(content, type);
    speech.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.88;
    utterance.pitch = 1.02;
    utterance.volume = 1;

    if (ptVoice) utterance.voice = ptVoice;

    speech.speak(utterance);
  }

  if (speech) {
    loadVoice();
    speech.addEventListener("voiceschanged", loadVoice);
  }

  function randomPosition() {
    const padX = 12;
    const padY = 10;
    const x = padX + Math.random() * (100 - padX * 2);
    const y = padY + Math.random() * (100 - padY * 2);
    const rot = -12 + Math.random() * 24;
    return { x, y, rot };
  }

  function spawnBurst(x, y, color) {
    const ring = document.createElement("div");
    ring.className = "burst";
    ring.style.left = x + "%";
    ring.style.top = y + "%";
    ring.style.width = "80px";
    ring.style.height = "80px";
    ring.style.background = `radial-gradient(circle, ${color}88 0%, ${color}00 70%)`;
    burstLayer.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove());

    for (let i = 0; i < 8; i++) {
      const spark = document.createElement("div");
      spark.className = "sparkle";
      const angle = (i / 8) * Math.PI * 2;
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

  function trimOldest() {
    while (activeChars.length >= MAX_CHARS) {
      removeChar(activeChars[0]);
    }
  }

  function showOnScreen(content, type) {
    trimOldest();

    const burstColor = pick(BURST_COLORS);
    const letterColor = type === "letter" ? pick(LETTER_COLORS) : null;
    const { x, y, rot } = randomPosition();

    const el = document.createElement("div");
    el.className = `char char--${type}`;
    el.textContent = content;
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.setProperty("--rot", rot + "deg");
    if (letterColor) el.style.color = letterColor;

    stage.appendChild(el);
    activeChars.push(el);

    setTimeout(() => removeChar(el), CHAR_LIFETIME_MS);

    spawnBurst(x, y, burstColor);
    speak(content, type);
    hideHint();
  }

  function hideHint() {
    if (hideHintTimer) clearTimeout(hideHintTimer);
    hint.classList.add("is-hidden");
  }

  function handleKey(key) {
    if (isLetterOrNumber(key)) {
      showOnScreen(key.toUpperCase(), "letter");
      return;
    }
    showOnScreen(pickEmoji(), "emoji");
  }

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (isFunctionKey(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        showOnScreen(pickEmoji(), "emoji");
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      handleKey(e.key);
    },
    true
  );

  document.addEventListener("pointerdown", () => {
    if (speech && !speechReady) loadVoice();

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const roll = Math.random();

    if (roll < 0.55) {
      showOnScreen(pick(letters.split("")), "letter");
    } else {
      showOnScreen(pickEmoji(), "emoji");
    }
  });

  hideHintTimer = setTimeout(hideHint, 4000);
})();
