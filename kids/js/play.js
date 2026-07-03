(function () {
  const stage = document.getElementById("stage");
  const burstLayer = document.getElementById("burst-layer");
  const hint = document.getElementById("hint");

  const BURST_COLORS = [
    "#FF3366", "#FF6B35", "#FFD23F", "#3DD68C",
    "#00C2FF", "#7B61FF", "#FF61DC", "#F9A8D4",
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

  let currentChar = null;
  let hideHintTimer = null;
  let lastEmoji = null;

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

  function removeCurrent() {
    if (!currentChar) return;
    const el = currentChar;
    currentChar = null;
    el.classList.add("is-leaving");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  function showOnScreen(content, type) {
    removeCurrent();

    const burstColor = pick(BURST_COLORS);
    const { x, y, rot } = randomPosition();

    const el = document.createElement("div");
    el.className = `char char--${type}`;
    el.textContent = content;
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.setProperty("--rot", rot + "deg");

    stage.appendChild(el);
    currentChar = el;

    spawnBurst(x, y, burstColor);
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
