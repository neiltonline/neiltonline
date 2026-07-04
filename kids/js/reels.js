(function () {
  const SWIPE_THRESHOLD = 56;
  const SWIPE_MAX_MS = 700;

  let root = null;
  let track = null;
  let slides = [];
  let activeIndex = 0;
  let feed = [];
  let audioUnlocked = false;

  let deps = {};
  let pointerStartY = 0;
  let pointerStartX = 0;
  let pointerStartTime = 0;
  let dragging = false;
  let activePointers = new Set();

  function pauseAllVideos() {
    slides.forEach((slide) => {
      const video = slide.querySelector("video");
      if (video) video.pause();
    });
  }

  function speakItem(item) {
    if (!item || !deps.speakItem) return;
    deps.speakItem(item);
  }

  function playSlide(index) {
    if (index < 0 || index >= slides.length) return;
    activeIndex = index;
    const item = feed[index];

    slides.forEach((slide, i) => {
      const video = slide.querySelector("video");
      if (video) {
        if (i === index) {
          video.currentTime = 0;
          video.muted = !audioUnlocked;
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
      slide.classList.toggle("is-active", i === index);
    });

    speakItem(item);
  }

  function slideHeight() {
    return root?.clientHeight || window.innerHeight;
  }

  function translateY(index, offsetPx = 0) {
    return `translateY(${-index * slideHeight() + offsetPx}px)`;
  }

  function syncSlideHeights() {
    const h = slideHeight();
    slides.forEach((slide) => {
      slide.style.height = `${h}px`;
    });
  }

  function goTo(index) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    playSlide(next);
    track.style.transform = translateY(next);
  }

  function goNext() {
    if (activeIndex < slides.length - 1) goTo(activeIndex + 1);
    else goTo(0);
  }

  function goPrev() {
    if (activeIndex > 0) goTo(activeIndex - 1);
    else goTo(slides.length - 1);
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    const video = slides[activeIndex]?.querySelector("video");
    if (video) {
      video.muted = false;
      video.play().catch(() => {});
    }
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activePointers.add(e.pointerId);
    if (activePointers.size > 1) {
      dragging = false;
      track.classList.remove("is-dragging");
      goTo(activeIndex);
      return;
    }
    dragging = true;
    pointerStartY = e.clientY;
    pointerStartX = e.clientX;
    pointerStartTime = Date.now();
    track.classList.add("is-dragging");
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
    track.style.transform = translateY(activeIndex, dy);
  }

  function onPointerUp(e) {
    activePointers.delete(e.pointerId);
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");

    const dy = e.clientY - pointerStartY;
    const dt = Date.now() - pointerStartTime;
    const fast = dt < SWIPE_MAX_MS;

    unlockAudio();

    if (dy < -SWIPE_THRESHOLD || (fast && dy < -24)) {
      goNext();
      return;
    }
    if (dy > SWIPE_THRESHOLD || (fast && dy > 24)) {
      goPrev();
      return;
    }
    goTo(activeIndex);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      unlockAudio();
      goNext();
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      unlockAudio();
      goPrev();
    }
  }

  function createAnimalSlide(item) {
    const slide = document.createElement("section");
    slide.className = "reels__slide reels__slide--animal";

    const video = document.createElement("video");
    video.src = deps.assetUrl(item.src);
    video.playsInline = true;
    video.loop = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.muted = true;

    const label = document.createElement("div");
    label.className = "reels__label";
    label.textContent = item.label;

    slide.appendChild(video);
    slide.appendChild(label);
    return slide;
  }

  function createColorSlide(item) {
    const slide = document.createElement("section");
    slide.className = "reels__slide reels__slide--color";
    slide.style.background = item.hex;

    const swatch = document.createElement("div");
    swatch.className = "reels__color-fill";
    swatch.style.background = item.hex;

    const label = document.createElement("div");
    label.className = "reels__label";
    label.textContent = item.label;
    if (item.text) label.style.color = item.text;

    slide.appendChild(swatch);
    slide.appendChild(label);
    return slide;
  }

  function createLetterSlide(item) {
    const slide = document.createElement("section");
    slide.className = "reels__slide reels__slide--letter";
    slide.style.background = item.bg;

    const glyph = document.createElement("div");
    glyph.className = "reels__letter";
    glyph.textContent = item.char;
    glyph.style.color = item.fg;

    slide.appendChild(glyph);
    return slide;
  }

  function render() {
    track.innerHTML = "";
    slides = [];
    feed = deps.buildFeed ? deps.buildFeed() : [];

    if (feed.length === 0) {
      track.innerHTML = "<p class=\"reels__empty\">Nada para mostrar. Ative categorias nas configurações.</p>";
      return;
    }

    feed.forEach((item, index) => {
      let slide;
      if (item.type === "animal") {
        slide = createAnimalSlide(item);
        if (index < 2) slide.querySelector("video").preload = "auto";
      } else if (item.type === "color") {
        slide = createColorSlide(item);
      } else if (item.type === "letter") {
        slide = createLetterSlide(item);
      } else {
        return;
      }
      slide.dataset.index = String(index);
      track.appendChild(slide);
      slides.push(slide);
    });

    track.style.transform = translateY(0);
    activeIndex = 0;
    syncSlideHeights();
    playSlide(0);
  }

  function onResize() {
    if (!document.body.classList.contains("mode-reels")) return;
    syncSlideHeights();
    track.style.transform = translateY(activeIndex);
  }

  function mount() {
    root.classList.remove("is-hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("mode-reels");
    audioUnlocked = false;
    render();

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
  }

  function unmount() {
    pauseAllVideos();
    root.classList.add("is-hidden");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mode-reels");
    track.style.transform = "";
    track.innerHTML = "";
    audioUnlocked = false;

    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerup", onPointerUp);
    root.removeEventListener("pointercancel", onPointerUp);
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onResize);
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
      if (!document.body.classList.contains("mode-reels")) return;
      pauseAllVideos();
      audioUnlocked = false;
      render();
    },
  };
})();
