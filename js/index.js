let isMobile = false; //initiate as false
// device detection
if (
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
    navigator.userAgent
  ) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
    navigator.userAgent.substr(0, 4)
  )
) {
  isMobile = true;
}

// CURSOR
if (!isMobile) {
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
}
// MOBILE MENU

const menu = document.querySelector(".menuLine");
const menuViewBox = document.querySelector(".menuViewBox");
const navMobile = document.querySelector(".nav-mobile");
function menuAtivo() {
  menu.classList.toggle("ativo");
  navMobile.classList.toggle("nav-mobile-visible");
  document.body.classList.toggle("ovf-y-hidden");
}
menuViewBox.addEventListener("click", menuAtivo);

// PORTFOLIO-GRUB-SCALE

gsap.registerPlugin(ScrollTrigger);

gsap.to(".portScroll01", {
  scale: 0.93,
  y: 50,
  scrollTrigger: {
    trigger: ".portScroll01",
    start: "top bottom",
    end: "top 12%",
    scrub: true,
    // markers: true,
  },
});
gsap.to(".portScroll02", {
  scale: 0.94,
  y: 60,
  scrollTrigger: {
    trigger: ".portScroll02",
    start: "top bottom",
    end: "top 12%",
    scrub: true,
    // markers: true,
  },
});
gsap.to(".portScroll03", {
  scale: 0.95,
  y: 70,
  scrollTrigger: {
    trigger: ".portScroll03",
    start: "top bottom",
    end: "top 12%",
    scrub: true,
    // markers: true,
  },
});
// gsap.to(".portScroll04", {
//   scale: 0.96,
//   y: 80,
//   scrollTrigger: {
//     trigger: ".portScroll04",
//     start: "top bottom",
//     end: "top 12%",
//     scrub: true,
//     // markers: true,
//   },
// });
gsap.to(".portScroll05", {
  scale: 0.96,
  y: 80,
  scrollTrigger: {
    trigger: ".portScroll05",
    start: "top bottom",
    end: "top 12%",
    scrub: true,
    // markers: true,
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

  const info = document.getElementById(projectObject[id]);
  info.style.display = "block";

  modal.classList.add("mostrar");
  modal.addEventListener("click", (e) => {
    if (e.target.className == "closex") {
      modal.classList.remove("mostrar");
      document.body.style.overflow = "auto";
      // document.body.style.paddingRight = "0";
      info.style.display = "none";
    }
  });
}

// TYPEWRITER (só funciona com texto sem links)
// function typeWriter(elemento) {
//   const textoArray = elemento.textContent.split("");
//   elemento.textContent = "";
//   textoArray.forEach((letra, i) => {
//     setTimeout(function () {
//       elemento.textContent += letra;
//     }, 50 * i);
//   });
// }

// const titulo = document.querySelector(".typewriter");
// typeWriter(titulo);
