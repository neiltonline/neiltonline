(function () {
  const FLUENT = "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets";
  const TW512 = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/512x512";

  function f3(folder, file) {
    return `${FLUENT}/${encodeURIComponent(folder)}/3D/${file}_3d.png`;
  }

  function t512(code) {
    return `${TW512}/${code}.png`;
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
    papai: t512("1f468"),
    mamae: t512("1f469"),
    titio: t512("1f9d1-200d-1f9b0"),
    titia: t512("1f469-200d-1f9b0"),
    vovo: t512("1f475"),
    avo: t512("1f474"),
    bola: f3("Soccer ball", "soccer_ball"),
    brincar: f3("Teddy bear", "teddy_bear"),
    lua: f3("Crescent moon", "crescent_moon"),
    sol: f3("Sun", "sun"),
    morango: f3("Strawberry", "strawberry"),
    banana: f3("Banana", "banana"),
    maca: f3("Red apple", "red_apple"),
    agua: f3("Droplet", "droplet"),
    leite: f3("Glass of milk", "glass_of_milk"),
    estrela: f3("Star", "star"),
    flor: f3("Cherry blossom", "cherry_blossom"),
    bebe: t512("1f476"),
    pao: f3("Bread", "bread"),
    abraco: f3("Hugging face", "hugging_face"),
    beijo: f3("Kiss mark", "kiss_mark"),
    dormir: f3("Sleeping face", "sleeping_face"),
  };

  const BODY = {
    cabeca: f3("Bust in silhouette", "bust_in_silhouette"),
    pe: t512("1f9b6"),
    olhos: f3("Eyes", "eyes"),
    orelha: t512("1f442"),
    nariz: t512("1f443"),
    boca: f3("Mouth", "mouth"),
    mao: t512("1f91a"),
    braco: t512("1f4aa"),
    perna: t512("1f9b5"),
    barriga: f3("Anatomical heart", "anatomical_heart"),
    cabelo: t512("1f487"),
    dente: f3("Tooth", "tooth"),
  };

  const COLORS = {
    vermelho: f3("Strawberry", "strawberry"),
    azul: f3("Blue circle", "blue_circle"),
    amarelo: f3("Banana", "banana"),
    verde: f3("Green apple", "green_apple"),
    laranja: f3("Tangerine", "tangerine"),
    roxo: f3("Grapes", "grapes"),
    rosa: f3("Cherry blossom", "cherry_blossom"),
    branco: f3("Cloud", "cloud"),
    preto: f3("Black cat", "black_cat"),
    marrom: f3("Bear", "bear"),
    cinza: f3("Elephant", "elephant"),
  };

  window.TecladinhoIllus = {
    animal: (id) => ANIMALS[id] || null,
    word: (id) => WORDS[id] || null,
    body: (id) => BODY[id] || null,
    color: (id) => COLORS[id] || null,
  };
})();
