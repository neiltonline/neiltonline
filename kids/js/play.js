(function () {
  const stage = document.getElementById("stage");
  const burstLayer = document.getElementById("burst-layer");
  const hint = document.getElementById("hint");

  const COLORS = [
    "#FF3366", "#FF6B35", "#FFD23F", "#3DD68C",
    "#00C2FF", "#7B61FF", "#FF61DC", "#FFFFFF",
  ];

  const EMOJIS = [
    "🎈", "🌈", "⭐", "🦋", "🐱", "🐶", "🍎", "🚗",
    "🎵", "💫", "🌸", "🎀", "🦄", "🐸", "🍓", "🌙",
    "☀️", "🎉", "💖", "🐠", "🦆", "🍌", "🎠", "🐥",
    "🍉", "🎪", "🧸", "🫧", "🌺", "🍭", "🐝", "🎨",
  ];

  const KEY_EMOJIS = {
    " ": "✨",
    Enter: "🎉",
    Backspace: "💨",
    Tab: "➡️",
    ArrowUp: "⬆️",
    ArrowDown: "⬇️",
    ArrowLeft: "⬅️",
    ArrowRight: "➡️",
    Escape: "🌙",
    Shift: "🌟",
    Control: "🎮",
    Alt: "🎵",
    Meta: "🍎",
    CapsLock: "🔆",
    Delete: "🫧",
    "=": "➕",
    "-": "➖",
    "[": "📦",
    "]": "🎁",
    ";": "🎶",
    "'": "💕",
    ",": "🌼",
    ".": "🔵",
    "/": "🌀",
    "\\": "⚡",
    "`": "☁️",
  };

  let currentChar = null;
  let hideHintTimer = null;

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function isLetterOrNumber(key) {
    return /^[a-zA-Z0-9]$/.test(key);
  }

  function randomPosition() {
    const padX = 12;
    const padY = 10;
    const x = padX + Math.random() * (100 - padX * 2);
    const y = padY + Math.random() * (100 - padY * 2);
    const rot = -18 + Math.random() * 36;
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

    const color = pick(COLORS);
    const { x, y, rot } = randomPosition();

    const el = document.createElement("div");
    el.className = `char char--${type}`;
    el.textContent = content;
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.color = color;
    el.style.setProperty("--rot", rot + "deg");
    el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;

    stage.appendChild(el);
    currentChar = el;

    spawnBurst(x, y, color);
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

    const emoji = KEY_EMOJIS[key] || pick(EMOJIS);
    showOnScreen(emoji, "emoji");
  }

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === "F5" || e.key === "F11") return;

    e.preventDefault();

    if (e.key.length === 1 || KEY_EMOJIS[e.key] || e.key.startsWith("Arrow") || e.key === "Enter" || e.key === "Backspace" || e.key === "Tab" || e.key === "Delete" || e.key === " ") {
      handleKey(e.key);
    } else {
      showOnScreen(pick(EMOJIS), "emoji");
    }
  });

  document.addEventListener("pointerdown", () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const roll = Math.random();

    if (roll < 0.55) {
      showOnScreen(pick(letters.split("")), "letter");
    } else {
      showOnScreen(pick(EMOJIS), "emoji");
    }
  });

  hideHintTimer = setTimeout(hideHint, 4000);
})();
