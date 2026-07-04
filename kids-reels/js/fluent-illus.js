(function () {
  const FLUENT = "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets";
  const NOTO512 = "https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@main/png/512";

  function f3(folder, file) {
    return `${FLUENT}/${encodeURIComponent(folder)}/3D/${file}_3d.png`;
  }

  function noto(code) {
    return `${NOTO512}/emoji_u${code.replace(/-/g, "_")}.png`;
  }

  const ANIMALS = {
    gato: f3("Cat", "cat"),
    cachorro: f3("Dog", "dog"),
    vaca: f3("Cow", "cow"),
    porco: f3("Pig", "pig"),
    galinha: f3("Chicken", "chicken"),
    pinto: f3("Hatching chick", "hatching_chick"),
    pato: f3("Duck", "duck"),
    galo: f3("Rooster", "rooster"),
    sapo: f3("Frog", "frog"),
    leao: f3("Lion", "lion"),
    tigre: f3("Tiger", "tiger"),
    elefante: f3("Elephant", "elephant"),
    urso: f3("Bear", "bear"),
    raposa: f3("Fox", "fox"),
    abelha: f3("Honeybee", "honeybee"),
    papagaio: f3("Parrot", "parrot"),
    jacare: f3("Crocodile", "crocodile"),
    cavalo: f3("Horse", "horse"),
    ovelha: f3("Ewe", "ewe"),
    coruja: f3("Owl", "owl"),
    lobo: f3("Wolf", "wolf"),
    macaco: f3("Monkey", "monkey"),
  };

  const WORDS = {
    papai: noto("1f468"),
    mamae: noto("1f469"),
    titio: noto("1f9d1-200d-1f9b0"),
    titia: noto("1f469-200d-1f9b0"),
    vovo: noto("1f475"),
    avo: noto("1f474"),
    bola: f3("Soccer ball", "soccer_ball"),
    brincar: f3("Playground slide", "playground_slide"),
    lua: f3("Crescent moon", "crescent_moon"),
    sol: f3("Sun", "sun"),
    morango: f3("Strawberry", "strawberry"),
    banana: f3("Banana", "banana"),
    maca: f3("Red apple", "red_apple"),
    melancia: f3("Watermelon", "watermelon"),
    laranja: f3("Tangerine", "tangerine"),
    agua: f3("Droplet", "droplet"),
    leite: f3("Glass of milk", "glass_of_milk"),
    estrela: f3("Star", "star"),
    flor: f3("Cherry blossom", "cherry_blossom"),
    bebe: noto("1f476"),
    pao: f3("Bread", "bread"),
    abraco: f3("Hugging face", "hugging_face"),
    beijo: f3("Kiss mark", "kiss_mark"),
    dormir: f3("Sleeping face", "sleeping_face"),
    balao: f3("Balloon", "balloon"),
    bolha: f3("Bubbles", "bubbles"),
    borboleta: f3("Butterfly", "butterfly"),
    carrossel: f3("Carousel horse", "carousel_horse"),
    coelho: f3("Rabbit", "rabbit"),
    coracao: f3("Red heart", "red_heart"),
    festa: f3("Party popper", "party_popper"),
    musica: f3("Musical notes", "musical_notes"),
    peixe: f3("Fish", "fish"),
    pinguim: f3("Penguin", "penguin"),
    pirulito: f3("Lollipop", "lollipop"),
    tartaruga: f3("Turtle", "turtle"),
    arcoiris: f3("Rainbow", "rainbow"),
  };

  const BODY = {
    cabeca: f3("Smiling face with smiling eyes", "smiling_face_with_smiling_eyes"),
    pe: noto("1f9b6"),
    olhos: f3("Eyes", "eyes"),
    orelha: noto("1f442"),
    nariz: noto("1f443"),
    boca: f3("Mouth", "mouth"),
    mao: noto("1f91a"),
    braco: noto("1f4aa"),
    perna: noto("1f9b5"),
    cabelo: noto("1f487"),
    dente: f3("Tooth", "tooth"),
  };

  const FALLBACK_NOTO = {
    animal: {
      gato: "1f408", cachorro: "1f415", vaca: "1f404", porco: "1f437",
      galinha: "1f414", pinto: "1f425", pato: "1f986", galo: "1f413",
      sapo: "1f438", leao: "1f981", tigre: "1f42f", elefante: "1f418",
      urso: "1f43b", raposa: "1f98a", abelha: "1f41d", papagaio: "1f99c",
      jacare: "1f40a", cavalo: "1f434", ovelha: "1f411", coruja: "1f989",
      lobo: "1f43a", macaco: "1f412",
    },
  };

  window.TecladinhoIllus = {
    animal: (id) => ANIMALS[id] || null,
    word: (id) => WORDS[id] || null,
    body: (id) => BODY[id] || null,
    fallback(type, id) {
      const code = FALLBACK_NOTO[type]?.[id];
      return code ? noto(code) : null;
    },
  };
})();
