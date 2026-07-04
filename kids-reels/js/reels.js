(function () {
  const SWIPE_THRESHOLD = 56;
  const SWIPE_MAX_MS = 700;

  let root = null;
  let track = null;
  let slides = [];
  let activeIndex = 0;
  let feed = [];
  let audioUnlocked = false;
  let speechUnlocked = false;

  let deps = {};
  let pointerStartY = 0;
  let pointerStartX = 0;
  let pointerStartTime = 0;
  let dragging = false;
  let activePointers = new Set();

  function slideVideos(slide) {
    return slide ? [...slide.querySelectorAll("video")] : [];
  }

  function pauseAllVideos() {
    slides.forEach((slide) => {
      slideVideos(slide).forEach((video) => video.pause());
    });
  }

  function speakItem(item) {
    if (!item || !deps.speakItem) return;
    deps.speakItem(item);
  }

  function playVideosForSlide(slide, muted) {
    slideVideos(slide).forEach((video) => {
      video.muted = muted;
      video.loop = true;
      video.play().catch(() => {});
    });
  }

  function resetVideosForSlide(slide) {
    slideVideos(slide).forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  }

  function bindVideoLoop(video) {
    video.loop = true;
    video.addEventListener("ended", () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  }

  function unlockSpeech() {
    if (speechUnlocked) return;
    speechUnlocked = true;
    if (deps.unlockSpeech) deps.unlockSpeech();
    speakItem(feed[activeIndex]);
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    const slide = slides[activeIndex];
    if (slide) playVideosForSlide(slide, false);
  }

  function playSlide(index) {
    if (index < 0 || index >= slides.length) return;
    activeIndex = index;
    const item = feed[index];

    slides.forEach((slide, i) => {
      if (i === index) {
        slideVideos(slide).forEach((video) => {
          video.currentTime = 0;
        });
        playVideosForSlide(slide, !audioUnlocked);
      } else {
        resetVideosForSlide(slide);
      }
      slide.classList.toggle("is-active", i === index);
    });

    if (speechUnlocked) speakItem(item);
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

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activePointers.add(e.pointerId);
    if (activePointers.size > 1) {
      dragging = false;
      track.classList.remove("is-dragging");
      goTo(activeIndex);
      return;
    }
    unlockSpeech();
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

    unlockSpeech();
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
      unlockSpeech();
      unlockAudio();
      goNext();
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      unlockSpeech();
      unlockAudio();
      goPrev();
    }
  }

  function makeVideoElement(src, className) {
    const video = document.createElement("video");
    video.src = src;
    video.className = className;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.muted = true;
    bindVideoLoop(video);
    return video;
  }

  function createVideoSlide(item, slideClass) {
    const slide = document.createElement("section");
    slide.className = `reels__slide ${slideClass}`;

    const stage = document.createElement("div");
    stage.className = "reels__video-stage";

    const src = deps.assetUrl(item.src);
    stage.appendChild(makeVideoElement(src, "reels__video-bg"));
    stage.appendChild(makeVideoElement(src, "reels__video-fg"));

    const label = document.createElement("div");
    label.className = "reels__label";
    label.textContent = item.label;

    slide.appendChild(stage);
    slide.appendChild(label);
    return slide;
  }

  function createAnimalSlide(item) {
    return createVideoSlide(item, "reels__slide--animal");
  }

  function createWordSlide(item) {
    return createVideoSlide(item, "reels__slide--word");
  }

  function createColorSlide(item) {
    const slide = document.createElement("section");
    slide.className = "reels__slide reels__slide--color";
    slide.style.background = item.hex;

    const stage = document.createElement("div");
    stage.className = "reels__color-stage";

    const img = document.createElement("img");
    img.className = "reels__color-object";
    img.src = deps.assetUrl(item.image);
    img.alt = item.object || item.label;
    img.draggable = false;

    const objectTag = document.createElement("div");
    objectTag.className = "reels__color-object-name";
    objectTag.textContent = item.object || "";
    if (item.text) objectTag.style.color = item.text;

    const label = document.createElement("div");
    label.className = "reels__label";
    label.textContent = item.label;
    if (item.text) label.style.color = item.text;

    stage.appendChild(img);
    stage.appendChild(objectTag);
    slide.appendChild(stage);
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
        if (index < 2) slideVideos(slide).forEach((v) => { v.preload = "auto"; });
      } else if (item.type === "word") {
        slide = createWordSlide(item);
        if (index < 2) slideVideos(slide).forEach((v) => { v.preload = "auto"; });
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
    syncSlideHeights();
    track.style.transform = translateY(activeIndex);
  }

  function mount() {
    root.classList.remove("is-hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("mode-reels");
    audioUnlocked = false;
    speechUnlocked = false;
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
    speechUnlocked = false;

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
      pauseAllVideos();
      audioUnlocked = false;
      speechUnlocked = false;
      render();
    },
  };
})();
