(function () {
  const C = () => window.AcheCatalog;
  const ILLUS = () => window.TecladinhoIllus;

  let root = null;
  let choicesEl = null;
  let timerEl = null;
  let burstEl = null;
  let deps = {};
  let round = null;
  let timerInterval = null;
  let timerTicks = 0;
  let missCount = 0;
  let acceptingInput = false;
  let audioGen = 0;

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
          question: "onde",
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
          bg: "#ECEFF1",
          question: "onde",
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
          question: "onde",
        });
      });
    }

    if (config.categories.body) {
      C().BODY_PARTS.forEach((part, i) => {
        if (!config.body[part.id]) return;
        if (part.bodyBall) {
          pool.push({
            uid: `body:${part.id}`,
            kind: "body",
            id: part.id,
            label: part.label,
            name: part.name,
            article: C().articleFor(part.id),
            bodyBall: true,
            bg: part.bg,
            question: "onde",
          });
          return;
        }
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
          question: "onde",
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

  function startRound() {
    stopTimer();
    missCount = 0;
    const config = deps.getConfig();
    const pool = buildPool(config);
    const count = Math.min(Math.max(config.choiceCount || 2, 2), 3);

    if (pool.length < count) {
      choicesEl.innerHTML = `<p class="ache__empty">Escolha mais itens nas configurações.</p>`;
      return;
    }

    const target = pool[Math.floor(Math.random() * pool.length)];
    const choices = homogeneousChoices(target, pool, count);

    round = { target, choices, pool };
    renderChoices(choices);
    acceptingInput = false;
    playQuestion(false);
  }

  function renderChoices(choices) {
    choicesEl.innerHTML = "";
    choicesEl.className = `ache__choices ache__choices--${choices.length}`;
    choices.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ache__choice";
      btn.dataset.uid = item.uid;
      btn.style.background = item.bg || "#ECEFF1";
      btn.setAttribute("aria-label", item.label);

      const stage = document.createElement("div");
      stage.className = "ache__choice-stage";

      if (item.kind === "color") {
        const swatch = document.createElement("div");
        const outline = item.outline ? " ache__color-swatch--outline" : "";
        swatch.className = `ache__color-swatch${outline}`;
        swatch.style.setProperty("--swatch-fill", item.hex || "#888");
        stage.appendChild(swatch);
      } else if (item.bodyBall) {
        const ball = document.createElement("div");
        ball.className = "ache__body-ball";
        stage.appendChild(ball);
      } else {
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
      }

      btn.appendChild(stage);
      btn.addEventListener("click", () => onChoice(item));
      choicesEl.appendChild(btn);
    });
  }

  function getChoiceButton(uid) {
    return choicesEl.querySelector(`[data-uid="${uid}"]`);
  }

  function onChoice(item) {
    if (!acceptingInput || !round) return;
    deps.unlockAudio?.();

    if (item.uid === round.target.uid) {
      acceptingInput = false;
      stopTimer();
      celebrate();
      deps.playFeedback?.("win", () => {
        setTimeout(startRound, 700);
      });
      return;
    }

    missCount += 1;
    acceptingInput = false;
    stopTimer();
    const btn = getChoiceButton(item.uid);
    btn?.classList.add("is-wrong");
    setTimeout(() => btn?.classList.remove("is-wrong"), 500);

    deps.playFeedback?.("retry", () => {
      if (missCount >= (deps.getConfig().hintAfterMisses || 2)) {
        getChoiceButton(round.target.uid)?.classList.add("is-hint");
      }
      playQuestion(true);
    });
  }

  function celebrate() {
    burstEl.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const star = document.createElement("span");
      star.className = "ache__star";
      star.textContent = "⭐";
      star.style.left = `${10 + Math.random() * 80}%`;
      star.style.top = `${10 + Math.random() * 50}%`;
      star.style.animationDelay = `${Math.random() * 0.25}s`;
      burstEl.appendChild(star);
    }
    setTimeout(() => { burstEl.innerHTML = ""; }, 1200);
  }

  function playQuestion(isRetry) {
    if (!round) return;
    audioGen += 1;
    const gen = audioGen;
    choicesEl.querySelectorAll(".is-hint").forEach((el) => el.classList.remove("is-hint"));

    deps.speakQuestion?.(round.target, { gen, isRetry }).then(() => {
      if (gen !== audioGen) return;
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
    timerEl = root.querySelector(".ache__timer");
    burstEl = root.querySelector(".ache__burst");

    root.querySelector(".ache__repeat")?.addEventListener("click", () => {
      if (!round) return;
      deps.unlockAudio?.();
      playQuestion(true);
    });

    startRound();
  }

  window.AcheGame = { init, refresh, stopGame };
})();
