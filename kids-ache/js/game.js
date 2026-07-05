(function () {
  const C = () => window.AcheCatalog;
  const ILLUS = () => window.TecladinhoIllus;

  let root = null;
  let choicesEl = null;
  let promptEl = null;
  let timerEl = null;
  let burstEl = null;
  let deps = {};
  let round = null;
  let timerInterval = null;
  let timerTicks = 0;
  let missCount = 0;
  let acceptingInput = false;
  let audioGen = 0;
  let choicesRevealed = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickN(pool, n, excludeId) {
    const filtered = pool.filter((item) => item.uid !== excludeId);
    return shuffle(filtered).slice(0, n);
  }

  function buildPool(config) {
    const pool = [];
    const illus = ILLUS();
    if (!illus) return pool;

    if (config.categories.animals) {
      C().ANIMALS.forEach((animal, i) => {
        if (!config.animals[animal.id]) return;
        const illustration = illus.animal(animal.id);
        if (!illustration) return;
        pool.push({
          uid: `animal:${animal.id}`,
          kind: "animal",
          id: animal.id,
          label: animal.label,
          name: animal.name,
          article: C().articleFor(animal.id),
          illustration,
          bg: C().CHOICE_BACKGROUNDS[i % C().CHOICE_BACKGROUNDS.length],
        });
      });
    }

    if (config.categories.colors) {
      C().COLORS.forEach((color) => {
        if (!config.colors[color.id]) return;
        pool.push({
          uid: `color:${color.id}`,
          kind: "color",
          id: color.id,
          label: color.label,
          name: color.name,
          hex: color.hex,
          outline: color.outline,
          article: C().articleFor(color.id),
          bg: color.hex,
        });
      });
    }

    if (config.categories.words) {
      C().WORDS.forEach((word, i) => {
        if (!config.words[word.id]) return;
        const illustration = illus.word(word.id);
        if (!illustration) return;
        pool.push({
          uid: `word:${word.id}`,
          kind: "word",
          id: word.id,
          label: word.label,
          name: word.name,
          article: C().articleFor(word.id),
          illustration,
          bg: C().CHOICE_BACKGROUNDS[i % C().CHOICE_BACKGROUNDS.length],
        });
      });
    }

    if (config.categories.body) {
      C().BODY_PARTS.forEach((part) => {
        if (!config.body[part.id]) return;
        const illustration = illus.body(part.id);
        if (!illustration) return;
        pool.push({
          uid: `body:${part.id}`,
          kind: "body",
          id: part.id,
          label: part.label,
          name: part.name,
          article: C().articleFor(part.id),
          illustration,
          bg: part.bg,
        });
      });
    }

    if (config.categories.letters) {
      C().LETTERS.forEach((letter) => {
        if (config.letters && config.letters[letter.id] === false) return;
        pool.push({
          uid: `letter:${letter.char}`,
          kind: "letter",
          id: letter.id,
          char: letter.char,
          label: letter.label,
          name: letter.name,
          display: letter.char,
          article: "a",
          bg: letter.bg,
          fg: letter.fg,
        });
      });
    }

    if (config.categories.numbers) {
      C().NUMBERS.forEach((num) => {
        if (config.numbers && config.numbers[num.id] === false) return;
        pool.push({
          uid: `number:${num.id}`,
          kind: "number",
          id: num.id,
          char: num.char,
          label: num.label,
          name: num.name,
          display: num.display,
          article: "o",
          bg: num.bg,
          fg: num.fg,
        });
      });
    }

    if (!config.mixCategories) {
      const kinds = [...new Set(pool.map((p) => p.kind))];
      if (kinds.length > 1) {
        const pickKind = kinds[Math.floor(Math.random() * kinds.length)];
        return pool.filter((p) => p.kind === pickKind);
      }
    }

    return pool;
  }

  function homogeneousChoices(target, pool, count) {
    const sameKind = pool.filter((p) => p.kind === target.kind);
    const distractors = pickN(sameKind, count - 1, target.uid);
    return shuffle([target, ...distractors]);
  }

  function poolsByKind(pool) {
    const map = new Map();
    pool.forEach((item) => {
      if (!map.has(item.kind)) map.set(item.kind, []);
      map.get(item.kind).push(item);
    });
    return map;
  }

  function setPrompt(target) {
    if (!promptEl || !target) return;
    promptEl.textContent = C().questionPromptText(target);
  }

  function hideChoices() {
    choicesRevealed = false;
    choicesEl.classList.add("is-hidden");
  }

  function showChoices() {
    choicesRevealed = true;
    choicesEl.classList.remove("is-hidden");
    choicesEl.classList.add("is-ready");
  }

  function startRound() {
    stopTimer();
    missCount = 0;
    choicesRevealed = false;
    const config = deps.getConfig();
    const pool = buildPool(config);
    const count = C().normalizeChoiceCount(config.choiceCount);

    if (pool.length < count) {
      promptEl.textContent = "";
      choicesEl.classList.remove("is-hidden");
      choicesEl.innerHTML = `<p class="ache__empty">Escolha mais itens nas configurações (mínimo ${count}).</p>`;
      return;
    }

    const byKind = poolsByKind(pool);
    const eligible = [...byKind.values()].filter((items) => items.length >= count);
    if (!eligible.length) {
      promptEl.textContent = "";
      choicesEl.classList.remove("is-hidden");
      choicesEl.innerHTML = `<p class="ache__empty">Ative pelo menos ${count} itens na mesma categoria.</p>`;
      return;
    }

    const kindPool = eligible[Math.floor(Math.random() * eligible.length)];
    const target = kindPool[Math.floor(Math.random() * kindPool.length)];
    const choices = homogeneousChoices(target, pool, count);
    if (choices.length < count) {
      promptEl.textContent = "";
      choicesEl.classList.remove("is-hidden");
      choicesEl.innerHTML = `<p class="ache__empty">Ative mais itens desta categoria.</p>`;
      return;
    }

    round = { target, choices, pool };
    choicesEl.innerHTML = "";
    hideChoices();
    setPrompt(target);
    playQuestion(false);
  }

  function renderChoices(choices) {
    choicesEl.innerHTML = "";
    const { cols, rows } = C().gridFor(choices.length);
    choicesEl.className = "ache__choices";
    choicesEl.dataset.count = String(choices.length);
    choicesEl.dataset.cols = String(cols);
    choicesEl.style.setProperty("--grid-cols", String(cols));
    choicesEl.style.setProperty("--grid-rows", String(rows));

    choices.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ache__choice";
      btn.dataset.uid = item.uid;
      btn.style.background = item.bg || "#ECEFF1";
      btn.setAttribute("aria-label", item.label);

      if (item.kind === "color") {
        btn.classList.add("ache__choice--color");
        if (item.outline) btn.classList.add("ache__choice--color-light");
      }

      const stage = document.createElement("div");
      stage.className = "ache__choice-stage";

      if (item.kind === "letter" || item.kind === "number") {
        const glyph = document.createElement("div");
        glyph.className = "ache__glyph";
        glyph.textContent = item.display || item.char;
        glyph.style.color = item.fg || "#FFFFFF";
        stage.appendChild(glyph);
        btn.appendChild(stage);
      } else if (item.kind !== "color") {
        const img = document.createElement("img");
        img.className = "ache__illus";
        img.src = item.illustration;
        img.alt = item.label;
        img.decoding = "async";
        img.addEventListener("error", () => {
          const fb = ILLUS()?.fallback?.(item.kind === "animal" ? "animal" : item.kind, item.id);
          if (fb && img.src !== fb) img.src = fb;
        }, { once: true });
        stage.appendChild(img);
        btn.appendChild(stage);
      }
      btn.addEventListener("pointerdown", () => pulseChoice(btn));
      btn.addEventListener("click", () => onChoice(item, btn));
      choicesEl.appendChild(btn);
    });
  }

  function getChoiceButton(uid) {
    return choicesEl.querySelector(`[data-uid="${uid}"]`);
  }

  function pulseChoice(btn) {
    if (!btn || !acceptingInput) return;
    btn.classList.remove("is-pressed");
    void btn.offsetWidth;
    btn.classList.add("is-pressed");
    setTimeout(() => btn.classList.remove("is-pressed"), 320);
  }

  function spawnCardBurst(btn) {
    if (!btn) return;
    const layer = document.createElement("div");
    layer.className = "ache__choice-fx";
    const particles = ["✨", "⭐", "💫", "🌟"];
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement("span");
      spark.className = "ache__choice-spark";
      spark.textContent = particles[i % particles.length];
      const angle = (i / 8) * Math.PI * 2;
      spark.style.setProperty("--spark-x", `${Math.cos(angle) * 52}px`);
      spark.style.setProperty("--spark-y", `${Math.sin(angle) * 52}px`);
      spark.style.animationDelay = `${i * 0.03}s`;
      layer.appendChild(spark);
    }
    btn.appendChild(layer);
    setTimeout(() => layer.remove(), 900);
  }

  function onChoice(item, btn) {
    if (!acceptingInput || !round) return;
    deps.unlockAudio?.();
    const choiceBtn = btn || getChoiceButton(item.uid);

    if (item.uid === round.target.uid) {
      acceptingInput = false;
      stopTimer();
      choiceBtn?.classList.add("is-correct");
      spawnCardBurst(choiceBtn);
      celebrate(choiceBtn);
      deps.playFeedback?.("win", () => {
        setTimeout(startRound, 500);
      }, round.target);
      return;
    }

    missCount += 1;
    acceptingInput = false;
    stopTimer();
    choiceBtn?.classList.add("is-wrong");
    setTimeout(() => choiceBtn?.classList.remove("is-wrong"), 500);
    const correctBtn = getChoiceButton(round.target.uid);
    correctBtn?.classList.add("is-reveal");
    setTimeout(() => correctBtn?.classList.remove("is-reveal"), 2200);

    deps.playFeedback?.("retry", () => {
      if (missCount >= (deps.getConfig().hintAfterMisses || 2)) {
        correctBtn?.classList.add("is-hint");
      }
      acceptingInput = true;
      startTimer();
    }, round.target);
  }

  function celebrate(btn) {
    burstEl.innerHTML = "";
    const icons = ["⭐", "✨", "🌟", "💫", "👏", "🎉"];
    for (let i = 0; i < 18; i++) {
      const star = document.createElement("span");
      star.className = "ache__star";
      star.textContent = icons[i % icons.length];
      star.style.left = `${8 + Math.random() * 84}%`;
      star.style.top = `${8 + Math.random() * 55}%`;
      star.style.animationDelay = `${Math.random() * 0.35}s`;
      burstEl.appendChild(star);
    }
    if (btn) {
      const rect = btn.getBoundingClientRect();
      for (let i = 0; i < 8; i++) {
        const star = document.createElement("span");
        star.className = "ache__star ache__star--card";
        star.textContent = i % 2 === 0 ? "👏" : "✨";
        star.style.left = `${rect.left + rect.width * (0.2 + Math.random() * 0.6)}px`;
        star.style.top = `${rect.top + rect.height * (0.2 + Math.random() * 0.6)}px`;
        star.style.animationDelay = `${Math.random() * 0.15}s`;
        burstEl.appendChild(star);
      }
    }
    setTimeout(() => { burstEl.innerHTML = ""; }, 1600);
  }

  function playQuestion(isRetry) {
    if (!round) return;
    audioGen += 1;
    const gen = audioGen;
    acceptingInput = false;
    stopTimer();
    setPrompt(round.target);

    if (!isRetry) {
      hideChoices();
    }

    deps.speakQuestion?.(round.target, { gen, isRetry }).then(() => {
      if (gen !== audioGen) return;
      if (!choicesRevealed) {
        renderChoices(round.choices);
        showChoices();
      }
      if (missCount >= (deps.getConfig().hintAfterMisses || 2)) {
        getChoiceButton(round.target.uid)?.classList.add("is-hint");
      }
      acceptingInput = true;
      startTimer();
    });
  }

  function startTimer() {
    stopTimer();
    const sec = deps.getConfig().timerSec || 10;
    timerTicks = sec;
    timerEl.style.setProperty("--timer-pct", "1");
    timerEl.classList.add("is-active");
    deps.playTick?.(timerTicks);

    timerInterval = setInterval(() => {
      timerTicks -= 1;
      timerEl.style.setProperty("--timer-pct", String(Math.max(timerTicks, 0) / sec));
      if (timerTicks > 0) {
        deps.playTick?.(timerTicks);
        return;
      }
      stopTimer();
      if (!acceptingInput || !round) return;
      acceptingInput = false;
      playQuestion(true);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerEl.classList.remove("is-active");
    timerEl.style.setProperty("--timer-pct", "0");
  }

  function stopGame() {
    stopTimer();
    audioGen += 1;
    acceptingInput = false;
    choicesRevealed = false;
    round = null;
    deps.stopAudio?.();
  }

  function refresh() {
    stopGame();
    startRound();
  }

  function init(options) {
    deps = options;
    root = options.root;
    choicesEl = root.querySelector(".ache__choices");
    promptEl = root.querySelector(".ache__prompt");
    timerEl = root.querySelector(".ache__timer");
    burstEl = root.querySelector(".ache__burst");

    root.querySelector(".ache__repeat")?.addEventListener("click", () => {
      if (!round || !acceptingInput) return;
      deps.unlockAudio?.();
      playQuestion(true);
    });

    startRound();
  }

  window.AcheGame = { init, refresh, stopGame };
})();
