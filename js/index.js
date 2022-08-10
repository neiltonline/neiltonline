// CURSOR

const cursor = new MouseFollower({
  el: null,
  container: document.body,
  className: "cursor",
  innerClassName: "cursor-inner",
  textClassName: "cursor-text",
  mediaClassName: "cursor-media",
  mediaBoxClassName: "cursor-media-box",
  iconSvgClassName: "mf-svgsprite",
  iconSvgNamePrefix: "-",
  iconSvgSrc: "",
  dataAttr: "cursor",
  hiddenState: "-hidden",
  textState: "-text",
  iconState: "-icon",
  activeState: "-active",
  mediaState: "-media",
  stateDetection: {
    "-pointer": "a,button",
    "-hidden": "iframe",
  },
  visible: true,
  visibleOnState: false,
  speed: 0.55,
  ease: "expo.out",
  overwrite: true,
  skewing: 2,
  skewingText: 1,
  skewingIcon: 2,
  skewingMedia: 2,
  skewingDelta: 0.001,
  skewingDeltaMax: 0.15,
  stickDelta: 0.15,
  showTimeout: 20,
  hideOnLeave: true,
  hideTimeout: 300,
  hideMediaTimeout: 300,
  stateDetection: {
    "-pointer": "a, button",
    "-exclusion": ".exclusion, .nav-mobile, button",
    "-logo": ".logo",
  },
});

// MODAL

function iniciaModal(modalClass, id) {
  const modal = document.querySelector(modalClass);
  const projectObject = {
    "link-p01": "content-p01",
    "link-p02": "content-p02",
    "link-p03": "content-p03",
    "link-p04": "content-p04",
    "link-p05": "content-p05",
  };
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = "15px";

  const info = document.getElementById(projectObject[id]);
  info.style.display = "block";

  modal.classList.add("mostrar");
  modal.addEventListener("click", (e) => {
    if (e.target.className == "closex") {
      modal.classList.remove("mostrar");
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
      info.style.display = "none";
    }
  });
}

// PORTFOLIO-GRUB-SCALE

gsap.registerPlugin(ScrollTrigger);
gsap.to(".portScroll01", {
  scale: 0.93,
  y: 50,
  // duration: 3,
  scrollTrigger: {
    trigger: ".portScroll01",
    start: "top bottom",
    end: "bottom 80%",
    // markers: true,
    scrub: 0.5,
  },
});
gsap.to(".portScroll02", {
  scale: 0.94,
  y: 60,
  // duration: 3,
  scrollTrigger: {
    trigger: ".portScroll02",
    start: "top bottom",
    end: "bottom 80%",
    // markers: true,
    scrub: 0.5,
  },
});
gsap.to(".portScroll03", {
  scale: 0.95,
  y: 70,
  // duration: 3,
  scrollTrigger: {
    trigger: ".portScroll03",
    start: "top bottom",
    end: "bottom 80%",
    // markers: true,
    scrub: 0.5,
  },
});
gsap.to(".portScroll04", {
  scale: 0.96,
  y: 80,
  // duration: 3,
  scrollTrigger: {
    trigger: ".portScroll04",
    start: "top bottom",
    end: "bottom 80%",
    // markers: true,
    scrub: 0.5,
  },
});
gsap.to(".portScroll05", {
  scale: 0.97,
  y: 90,
  // duration: 3,
  scrollTrigger: {
    trigger: ".portScroll05",
    start: "top bottom",
    end: "bottom 80%",
    // markers: true,
    scrub: 0.5,
  },
});
