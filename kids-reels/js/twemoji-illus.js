(function () {
  const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";

  const ANIMAL_TWEMOJI = {
    gato: "1f408",
    cachorro: "1f415",
    vaca: "1f404",
    porco: "1f437",
    galinha: "1f414",
    pinto: "1f425",
    pato: "1f986",
    galo: "1f413",
    sapo: "1f438",
    leao: "1f981",
    tigre: "1f42f",
    elefante: "1f418",
    urso: "1f43b",
    raposa: "1f98a",
    abelha: "1f41d",
    papagaio: "1f99c",
    jacare: "1f40a",
    cavalo: "1f434",
    ovelha: "1f411",
    coruja: "1f989",
    lobo: "1f43a",
    macaco: "1f412",
  };

  const WORD_TWEMOJI = {
    papai: "1f468",
    mamae: "1f469",
    titio: "1f9d1-200d-1f9b0",
    titia: "1f469-200d-1f9b0",
    vovo: "1f475",
    avo: "1f474",
    bola: "26bd",
    brincar: "1f9f8",
    lua: "1f319",
    sol: "2600-fe0f",
    morango: "1f353",
    banana: "1f34c",
    maca: "1f34e",
    agua: "1f4a7",
    leite: "1f95b",
    estrela: "2b50",
    flor: "1f338",
    bebe: "1f476",
    pao: "1f35e",
    abraco: "1f917",
    beijo: "1f48b",
    dormir: "1f634",
  };

  const BODY_TWEMOJI = {
    cabeca: "1f9d1",
    pe: "1f9b6",
    olhos: "1f440",
    orelha: "1f442",
    nariz: "1f443",
    boca: "1f444",
    mao: "1f91a",
    braco: "1f4aa",
    perna: "1f9b5",
    barriga: "1fac1",
    cabelo: "1f487",
    dente: "1f9b7",
  };

  const COLOR_TWEMOJI = {
    vermelho: "1f353",
    azul: "1f535",
    amarelo: "1f34c",
    verde: "1f34f",
    laranja: "1f34a",
    roxo: "1f347",
    rosa: "1f338",
    branco: "2601-fe0f",
    preto: "1f408",
    marrom: "1f43b",
    cinza: "1f418",
  };

  function twemojiUrl(code) {
    if (!code) return null;
    return `${TWEMOJI_BASE}/${code}.png`;
  }

  window.TecladinhoTwemoji = {
    animal: (id) => twemojiUrl(ANIMAL_TWEMOJI[id]),
    word: (id) => twemojiUrl(WORD_TWEMOJI[id]),
    body: (id) => twemojiUrl(BODY_TWEMOJI[id]),
    color: (id) => twemojiUrl(COLOR_TWEMOJI[id]),
    url: twemojiUrl,
  };
})();
