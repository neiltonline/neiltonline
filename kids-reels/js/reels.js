(function () {
  const IS_COARSE = window.matchMedia("(pointer: coarse)").matches;
  const SWIPE_THRESHOLD = IS_COARSE ? 36 : 56;
  const SWIPE_MAX_MS = IS_COARSE ? 900 : 700;
  const FLICK_VELOCITY = 0.28;
  const TAP_MAX_MS = 280;
  const TAP_MAX_MOVE = 14;
  const SWIPED_KEY = "tecladinho-reels-swiped";
  const CURRENT_SLOT = 1;

  let root = null;
  let track = null;
  let swipeHint = null;
  let slots = [];
  let activeIndex = 0;
  let feed = [];
  let speechUnlocked = false;

  let deps = {};
  let pointerStartY = 0;
  let pointerStartX = 0;
  let pointerStartTime = 0;
  let dragging = false;
  let activePointers = new Set();

  function wrapIndex(index) {
    const n = feed.length;
    if (!n) return 0;
    return ((index % n) + n) % n;
  }

  function markSwiped() {
    try {
      localStorage.setItem(SWIPED_KEY, "1");
    } catch {
      /* ignore */
    }
    root?.classList.add("has-swiped");
    swipeHint?.classList.add("is-dismissed");
  }

  function syncSwipeHintState() {
    if (!root) return;
    try {
      if (localStorage.getItem(SWIPED_KEY)) {
        root.classList.add("has-swiped");
        swipeHint?.classList.add("is-dismissed");
      }
    } catch {
      /* ignore */
    }
  }

  function stopSpeechNow() {
    if (deps.stopSpeak) deps.stopSpeak();
  }

  function speakItem(item, onEnd) {
    if (!item || !deps.speakItem) {
      onEnd?.();
      return;
    }
    deps.speakItem(item, onEnd);
  }

  function unlockSpeech() {
    if (speechUnlocked) return;
    speechUnlocked = true;
    if (deps.unlockSpeech) deps.unlockSpeech();
  }

  function setSlideMediaHidden(slide, hidden) {
    if (!slide) return;
    slide.classList.toggle("is-media-hidden", hidden);
    slide.classList.toggle("is-audio-pending", hidden);
  }

  function onSlideActive() {
    stopSpeechNow();
    const item = feed[activeIndex];
    const slide = slots[CURRENT_SLOT];
    if (!item || !slide) return;

    setSlideMediaHidden(slide, true);

    speakItem(item, () => {
      setSlideMediaHidden(slide, false);
    });
  }

  function illustrationSrc(item) {
    if (item.external) return item.image;
    return deps.assetUrl(item.image);
  }

  function fillSlot(slot, feedIndex) {
    if (slot.dataset.feedIndex === String(feedIndex)) return;
    const item = feed[feedIndex];
    if (!item) return;

    slot.dataset.feedIndex = String(feedIndex);
    slot.className = "reels__slide";
    slot.replaceChildren();
    slot.style.background = "";

    if (item.type === "animal" || item.type === "word") {
      slot.classList.add(item.type === "animal" ? "reels__slide--animal" : "reels__slide--word");
      slot.style.background = item.bg || "#FFD54F";
      const stage = document.createElement("div");
      stage.className = "reels__illus-stage";
      const img = document.createElement("img");
      img.className = "reels__illus";
      img.src = illustrationSrc(item);
      img.alt = item.label;
      img.decoding = "async";
      const label = document.createElement("div");
      label.className = "reels__label";
      label.textContent = item.label;
      stage.append(img);
      slot.append(stage, label);
      return;
    }

    if (item.type === "color") {
      slot.classList.add("reels__slide--color");
      slot.style.background = item.hex;
      const stage = document.createElement("div");
      stage.className = "reels__color-stage";
      const img = document.createElement("img");
      img.className = "reels__color-object";
      img.src = deps.assetUrl(item.image);
      img.alt = item.object || item.label;
      img.decoding = "async";
      const objectTag = document.createElement("div");
      objectTag.className = "reels__color-object-name";
      objectTag.textContent = item.object || "";
      if (item.text) objectTag.style.color = item.text;
      const label = document.createElement("div");
      label.className = "reels__label";
      label.textContent = item.label;
      if (item.text) label.style.color = item.text;
      stage.append(img, objectTag);
      slot.append(stage, label);
      return;
    }

    if (item.type === "body") {
      slot.classList.add("reels__slide--body");
      slot.style.background = item.bg;
      const stage = document.createElement("div");
      stage.className = "reels__color-stage";
      const img = document.createElement("img");
      img.className = "reels__color-object";
      img.src = deps.assetUrl(item.image);
      img.alt = item.label;
      img.decoding = "async";
      const label = document.createElement("div");
      label.className = "reels__label";
      label.textContent = item.label;
      stage.append(img);
      slot.append(stage, label);
      return;
    }

    if (item.type === "letter") {
      slot.classList.add("reels__slide--letter");
      slot.style.background = item.bg;
      const glyph = document.createElement("div");
      glyph.className = "reels__letter";
      glyph.textContent = item.char;
      glyph.style.color = item.fg;
      slot.appendChild(glyph);
    }
  }

  function syncWindow() {
    if (!feed.length || slots.length !== 3) return;
    fillSlot(slots[0], wrapIndex(activeIndex - 1));
    fillSlot(slots[1], wrapIndex(activeIndex));
    fillSlot(slots[2], wrapIndex(activeIndex + 1));
    slots.forEach((slot, i) => slot.classList.toggle("is-active", i === CURRENT_SLOT));
    setTrackTransform(CURRENT_SLOT, false);
  }

  function setTrackTransform(slotIndex, animate) {
    track.classList.toggle("is-animating", animate);
    track.style.transform = translateY(slotIndex);
  }

  function onTransitionEnd(e) {
    if (e.target !== track || e.propertyName !== "transform") return;
    track.classList.remove("is-animating");
    if (!transitionCb) return;
    const cb = transitionCb;
    transitionCb = null;
    cb();
  }

  let transitionCb = null;

  function goNext() {
    if (feed.length < 2) return;
    markSwiped();
    stopSpeechNow();
    setTrackTransform(2, true);
    transitionCb = () => {
      activeIndex = wrapIndex(activeIndex + 1);
      syncWindow();
      onSlideActive();
    };
  }

  function goPrev() {
    if (feed.length < 2) return;
    markSwiped();
    stopSpeechNow();
    setTrackTransform(0, true);
    transitionCb = () => {
      activeIndex = wrapIndex(activeIndex - 1);
      syncWindow();
      onSlideActive();
    };
  }

  function snapCurrent() {
    setTrackTransform(CURRENT_SLOT, true);
    transitionCb = () => onSlideActive();
  }

  function slideHeight() {
    const vv = window.visualViewport;
    const h = Math.round(vv?.height || root?.clientHeight || window.innerHeight);
    return h > 0 ? h : window.innerHeight;
  }

  function updateViewportMetrics() {
    const h = slideHeight();
    document.documentElement.style.setProperty("--reels-h", `${h}px`);
    if (root) root.style.height = `${h}px`;
    slots.forEach((slide) => {
      slide.style.height = `${h}px`;
      slide.style.minHeight = `${h}px`;
    });
    if (track && feed.length) {
      track.style.transform = translateY(CURRENT_SLOT);
    }
  }

  function translateY(slotIndex, offsetPx = 0) {
    return `translate3d(0, ${-(slotIndex * slideHeight()) + offsetPx}px, 0)`;
  }

  function handleTapZone(clientY) {
    if (!IS_COARSE) return false;
    const h = slideHeight();
    if (clientY < h * 0.2) {
      goPrev();
      return true;
    }
    if (clientY > h * 0.8) {
      goNext();
      return true;
    }
    return false;
  }

  function finishGesture(clientY, clientX) {
    const dy = clientY - pointerStartY;
    const dx = clientX - pointerStartX;
    const dt = Date.now() - pointerStartTime;
    const dist = Math.hypot(dx, dy);
    const velocity = dy / Math.max(dt, 1);
    const fast = dt < SWIPE_MAX_MS;

    unlockSpeech();

    if (dist < TAP_MAX_MOVE && dt < TAP_MAX_MS && handleTapZone(clientY)) {
      return;
    }

    if (dy < -SWIPE_THRESHOLD || velocity < -FLICK_VELOCITY || (fast && dy < -20)) {
      goNext();
      return;
    }
    if (dy > SWIPE_THRESHOLD || velocity > FLICK_VELOCITY || (fast && dy > 20)) {
      goPrev();
      return;
    }
    snapCurrent();
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activePointers.add(e.pointerId);

    if (activePointers.size >= 2) {
      dragging = false;
      track.classList.remove("is-dragging");
      transitionCb = null;
      setTrackTransform(CURRENT_SLOT, false);
      deps.onTwoFingerHoldStart?.();
      return;
    }

    stopSpeechNow();
    unlockSpeech();
    dragging = true;
    pointerStartY = e.clientY;
    pointerStartX = e.clientX;
    pointerStartTime = Date.now();
    track.classList.add("is-dragging");
    track.classList.remove("is-animating");
    transitionCb = null;
    root.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dy = e.clientY - pointerStartY;
    const dx = e.clientX - pointerStartX;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
      dragging = false;
      track.classList.remove("is-dragging");
      return;
    }
    track.style.transform = translateY(CURRENT_SLOT, dy);
  }

  function onPointerUp(e) {
    const countBefore = activePointers.size;
    activePointers.delete(e.pointerId);

    if (countBefore >= 2) {
      deps.onTwoFingerHoldEnd?.(activePointers.size);
    }

    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    finishGesture(e.clientY, e.clientX);
  }

  function onTouchMove(e) {
    if (!dragging) return;
    e.preventDefault();
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      unlockSpeech();
      goNext();
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      unlockSpeech();
      goPrev();
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState !== "visible") {
      stopSpeechNow();
      return;
    }
    onSlideActive();
  }

  function render() {
    feed = deps.buildFeed ? deps.buildFeed() : [];

    if (feed.length === 0) {
      track.innerHTML = "<p class=\"reels__empty\">Nada para mostrar. Segure dois dedos por 2s para abrir configurações.</p>";
      slots = [];
      return;
    }

    track.innerHTML = "";
    slots = [];
    for (let i = 0; i < 3; i++) {
      const slot = document.createElement("section");
      slot.className = "reels__slide";
      track.appendChild(slot);
      slots.push(slot);
    }

    activeIndex = 0;
    speechUnlocked = false;
    updateViewportMetrics();
    syncWindow();
    onSlideActive();
  }

  function onResize() {
    updateViewportMetrics();
  }

  function mount() {
    swipeHint = root.querySelector(".reels__swipe-hint");
    root.classList.remove("is-hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("mode-reels");
    syncSwipeHintState();
    updateViewportMetrics();
    render();

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    track.addEventListener("transitionend", onTransitionEnd);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);
  }

  function unmount() {
    stopSpeechNow();
    root.classList.add("is-hidden");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mode-reels");
    track.style.transform = "";
    track.innerHTML = "";
    slots = [];
    speechUnlocked = false;

    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerup", onPointerUp);
    root.removeEventListener("pointercancel", onPointerUp);
    root.removeEventListener("touchmove", onTouchMove);
    track.removeEventListener("transitionend", onTransitionEnd);
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.visualViewport?.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onResize);
  }

  window.TecladinhoReels = {
    init(options) {
      deps = options;
      root = options.root;
      track = root.querySelector(".reels__track");
    },

    activate() {
      if (!root || !track) return;
      mount();
    },

    deactivate() {
      if (!root) return;
      unmount();
    },

    refresh() {
      stopSpeechNow();
      speechUnlocked = false;
      render();
    },
  };
})();
