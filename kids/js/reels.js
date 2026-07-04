(function () {
  const SWIPE_THRESHOLD = 56;
  const SWIPE_MAX_MS = 700;

  let root = null;
  let track = null;
  let slides = [];
  let activeIndex = 0;
  let feed = [];
  let observer = null;
  let audioUnlocked = false;
  let currentNameAudio = null;

  let deps = {};
  let pointerStartY = 0;
  let pointerStartX = 0;
  let pointerStartTime = 0;
  let dragging = false;
  let dragOffset = 0;
  let activePointers = new Set();

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildFeed() {
    const items = [];
    for (const animal of deps.getEnabledAnimals()) {
      const videos = deps.variants[animal.id]?.videos || [];
      for (const src of videos) {
        items.push({
          animalId: animal.id,
          label: animal.label,
          name: animal.name,
          src,
        });
      }
    }
    return shuffle(items);
  }

  function pauseAll() {
    slides.forEach((slide) => {
      const video = slide.querySelector("video");
      if (video) {
        video.pause();
      }
    });
    if (currentNameAudio) {
      currentNameAudio.pause();
      currentNameAudio = null;
    }
  }

  function speakName(item) {
    if (!deps.speakAnimalName) return;
    deps.speakAnimalName(item.animalId);
  }

  function playSlide(index) {
    if (index < 0 || index >= slides.length) return;
    activeIndex = index;

    slides.forEach((slide, i) => {
      const video = slide.querySelector("video");
      if (!video) return;
      if (i === index) {
        video.currentTime = 0;
        video.muted = !audioUnlocked;
        const playPromise = video.play();
        if (playPromise) playPromise.catch(() => {});
        speakName(feed[i]);
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });
  }

  function goTo(index) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    playSlide(next);
    track.style.transform = `translateY(${-next * 100}vh)`;
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
    const slide = slides[activeIndex];
    const video = slide?.querySelector("video");
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
    dragOffset = 0;
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
    dragOffset = dy;
    track.style.transform = `translateY(calc(${-activeIndex * 100}vh + ${dy}px))`;
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

  function render() {
    track.innerHTML = "";
    slides = [];
    feed = buildFeed();

    if (feed.length === 0) {
      track.innerHTML = '<p class="reels__empty">Nenhum vídeo disponível. Ative animais nas configurações.</p>';
      return;
    }

    feed.forEach((item, index) => {
      const slide = document.createElement("section");
      slide.className = "reels__slide";
      slide.dataset.index = String(index);

      const video = document.createElement("video");
      video.src = deps.assetUrl(item.src);
      video.playsInline = true;
      video.loop = true;
      video.preload = index < 2 ? "auto" : "metadata";
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.muted = true;

      const label = document.createElement("div");
      label.className = "reels__label";
      label.textContent = item.label;

      slide.appendChild(video);
      slide.appendChild(label);
      track.appendChild(slide);
      slides.push(slide);
    });

    track.style.transform = `translateY(0)`;
    activeIndex = 0;
    playSlide(0);
  }

  function mount() {
    root.classList.remove("is-hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("mode-reels");
    render();

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("keydown", onKeyDown);
  }

  function unmount() {
    pauseAll();
    root.classList.add("is-hidden");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mode-reels");
    track.style.transform = "";
    track.innerHTML = "";

    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerup", onPointerUp);
    root.removeEventListener("pointercancel", onPointerUp);
    document.removeEventListener("keydown", onKeyDown);
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
      pauseAll();
      render();
    },
  };
})();
