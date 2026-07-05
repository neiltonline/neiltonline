(function () {
  const FEMININE = new Set([
    "vaca", "galinha", "raposa", "abelha", "ovelha", "coruja", "borboleta",
    "baleia", "cabra", "girafa", "zebra",
    "mamae", "titia", "vovo", "bola", "lua", "maca", "banana", "melancia",
    "agua", "flor", "estrela", "musica", "festa", "bolha", "nuvem",
    "cabeca", "orelha", "boca", "mao", "perna",
    "rosa", "laranja", "violeta", "turquesa", "vinho",
  ]);

  const ANIMALS = [
    { id: "gato", name: "gato", label: "Gato" },
    { id: "cachorro", name: "cachorro", label: "Cachorro" },
    { id: "vaca", name: "vaca", label: "Vaca" },
    { id: "porco", name: "porco", label: "Porco" },
    { id: "galinha", name: "galinha", label: "Galinha" },
    { id: "pinto", name: "pinto", label: "Pintinho" },
    { id: "pato", name: "pato", label: "Pato" },
    { id: "galo", name: "galo", label: "Galo" },
    { id: "sapo", name: "sapo", label: "Sapo" },
    { id: "leao", name: "leão", label: "Leão" },
    { id: "tigre", name: "tigre", label: "Tigre" },
    { id: "elefante", name: "elefante", label: "Elefante" },
    { id: "urso", name: "urso", label: "Urso" },
    { id: "raposa", name: "raposa", label: "Raposa" },
    { id: "abelha", name: "abelha", label: "Abelha" },
    { id: "papagaio", name: "papagaio", label: "Papagaio" },
    { id: "jacare", name: "jacaré", label: "Jacaré" },
    { id: "cavalo", name: "cavalo", label: "Cavalo" },
    { id: "ovelha", name: "ovelha", label: "Ovelha" },
    { id: "coruja", name: "coruja", label: "Coruja" },
    { id: "lobo", name: "lobo", label: "Lobo" },
    { id: "macaco", name: "macaco", label: "Macaco" },
    { id: "coelho", name: "coelho", label: "Coelho" },
    { id: "peixe", name: "peixe", label: "Peixe" },
    { id: "pinguim", name: "pinguim", label: "Pinguim" },
    { id: "tartaruga", name: "tartaruga", label: "Tartaruga" },
    { id: "borboleta", name: "borboleta", label: "Borboleta" },
    { id: "coala", name: "coala", label: "Coala" },
    { id: "panda", name: "panda", label: "Panda" },
    { id: "girafa", name: "girafa", label: "Girafa" },
    { id: "polvo", name: "polvo", label: "Polvo" },
    { id: "esquilo", name: "esquilo", label: "Esquilo" },
    { id: "zebra", name: "zebra", label: "Zebra" },
    { id: "golfinho", name: "golfinho", label: "Golfinho" },
    { id: "baleia", name: "baleia", label: "Baleia" },
    { id: "cabra", name: "cabra", label: "Cabra" },
    { id: "lhama", name: "lhama", label: "Lhama" },
    { id: "cervo", name: "cervo", label: "Cervo" },
    { id: "rato", name: "rato", label: "Rato" },
  ];

  const WORDS = [
    { id: "papai", name: "papai", label: "Papai" },
    { id: "mamae", name: "mamãe", label: "Mamãe" },
    { id: "titio", name: "titio", label: "Titio" },
    { id: "titia", name: "titia", label: "Titia" },
    { id: "vovo", name: "vovó", label: "Vovó" },
    { id: "avo", name: "vovô", label: "Vovô" },
    { id: "bola", name: "bola", label: "Bola" },
    { id: "brincar", name: "brincar", label: "Brincar" },
    { id: "lua", name: "lua", label: "Lua" },
    { id: "sol", name: "sol", label: "Sol" },
    { id: "morango", name: "morango", label: "Morango" },
    { id: "banana", name: "banana", label: "Banana" },
    { id: "maca", name: "maçã", label: "Maçã" },
    { id: "melancia", name: "melancia", label: "Melancia" },
    { id: "laranja", name: "laranja", label: "Laranja" },
    { id: "agua", name: "água", label: "Água" },
    { id: "leite", name: "leite", label: "Leite" },
    { id: "estrela", name: "estrela", label: "Estrela" },
    { id: "flor", name: "flor", label: "Flor" },
    { id: "bebe", name: "bebê", label: "Bebê" },
    { id: "pao", name: "pão", label: "Pão" },
    { id: "abraco", name: "abraço", label: "Abraço" },
    { id: "dormir", name: "dormir", label: "Dormir" },
    { id: "balao", name: "balão", label: "Balão" },
    { id: "bolha", name: "bolha", label: "Bolha" },
    { id: "carrossel", name: "carrossel", label: "Carrossel" },
    { id: "coracao", name: "coração", label: "Coração" },
    { id: "festa", name: "festa", label: "Festa" },
    { id: "musica", name: "música", label: "Música" },
    { id: "pirulito", name: "pirulito", label: "Pirulito" },
    { id: "arcoiris", name: "arco-íris", label: "Arco-íris" },
    { id: "nuvem", name: "nuvem", label: "Nuvem" },
    { id: "sorvete", name: "sorvete", label: "Sorvete" },
  ];

  const BODY_PARTS = [
    { id: "cabeca", name: "cabeça", label: "Cabeça", bg: "#FFE0B2" },
    { id: "pe", name: "pé", label: "Pé", bg: "#E1BEE7" },
    { id: "olhos", name: "olhos", label: "Olhos", bg: "#BBDEFB" },
    { id: "orelha", name: "orelha", label: "Orelha", bg: "#FFECB3" },
    { id: "nariz", name: "nariz", label: "Nariz", bg: "#FFCDD2" },
    { id: "boca", name: "boca", label: "Boca", bg: "#F8BBD0" },
    { id: "mao", name: "mão", label: "Mão", bg: "#FFCCBC" },
    { id: "braco", name: "braço", label: "Braço", bg: "#FFAB91" },
    { id: "perna", name: "perna", label: "Perna", bg: "#C5CAE9" },
    { id: "cabelo", name: "cabelo", label: "Cabelo", bg: "#D7CCC8" },
    { id: "dente", name: "dente", label: "Dente", bg: "#E0F7FA" },
    { id: "dedo", name: "dedo", label: "Dedo", bg: "#FFF9C4" },
  ];

  const COLORS = [
    { id: "vermelho", name: "vermelho", label: "Vermelho", hex: "#E53935", shape: "circle" },
    { id: "azul", name: "azul", label: "Azul", hex: "#1E88E5", shape: "square" },
    { id: "amarelo", name: "amarelo", label: "Amarelo", hex: "#FDD835", text: "#333", shape: "triangle" },
    { id: "verde", name: "verde", label: "Verde", hex: "#43A047", shape: "hexagon" },
    { id: "laranja", name: "laranja", label: "Laranja", hex: "#FB8C00", shape: "diamond" },
    { id: "roxo", name: "roxo", label: "Roxo", hex: "#8E24AA", shape: "pentagon" },
    { id: "rosa", name: "rosa", label: "Rosa", hex: "#EC407A", shape: "circle" },
    { id: "branco", name: "branco", label: "Branco", hex: "#FFFFFF", text: "#333", shape: "square", outline: true },
    { id: "preto", name: "preto", label: "Preto", hex: "#212121", shape: "triangle" },
    { id: "marrom", name: "marrom", label: "Marrom", hex: "#6D4C41", shape: "hexagon" },
    { id: "cinza", name: "cinza", label: "Cinza", hex: "#757575", shape: "diamond" },
    { id: "anil", name: "anil", label: "Anil", hex: "#3949AB", shape: "pentagon" },
    { id: "violeta", name: "violeta", label: "Violeta", hex: "#7E57C2", shape: "circle" },
    { id: "turquesa", name: "turquesa", label: "Turquesa", hex: "#00ACC1", shape: "square" },
    { id: "lilas", name: "lilás", label: "Lilás", hex: "#BA68C8", shape: "triangle" },
    { id: "dourado", name: "dourado", label: "Dourado", hex: "#FFB300", text: "#333", shape: "hexagon" },
    { id: "bege", name: "bege", label: "Bege", hex: "#D7CCC8", text: "#333", shape: "diamond", outline: true },
    { id: "coral", name: "coral", label: "Coral", hex: "#FF7043", shape: "pentagon" },
    { id: "vinho", name: "vinho", label: "Vinho", hex: "#AD1457", shape: "circle" },
  ];

  const LETTER_BACKGROUNDS = [
    { bg: "#5C6BC0", fg: "#FFFFFF" },
    { bg: "#26A69A", fg: "#FFFFFF" },
    { bg: "#EF5350", fg: "#FFFFFF" },
    { bg: "#FFA726", fg: "#333333" },
    { bg: "#AB47BC", fg: "#FFFFFF" },
    { bg: "#42A5F5", fg: "#FFFFFF" },
  ];

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((char, i) => ({
    id: `letter-${char.toLowerCase()}`,
    char,
    name: char,
    label: char,
    article: "a",
    ...LETTER_BACKGROUNDS[i % LETTER_BACKGROUNDS.length],
  }));

  const NUMBER_NAMES = {
    0: "zero", 1: "um", 2: "dois", 3: "três", 4: "quatro",
    5: "cinco", 6: "seis", 7: "sete", 8: "oito", 9: "nove", 10: "dez",
  };

  const NUMBERS = Object.entries(NUMBER_NAMES).map(([char, name], i) => ({
    id: char === "10" ? "n10" : `n${char}`,
    char,
    name,
    label: char,
    display: char,
    article: "o",
    ...LETTER_BACKGROUNDS[i % LETTER_BACKGROUNDS.length],
  }));

  const CHOICE_BACKGROUNDS = [
    "#FFD54F", "#81D4FA", "#A5D6A7", "#F48FB1", "#CE93D8", "#FFCC80",
  ];

  const CHOICE_COUNTS = [2, 3, 4, 6, 9, 12];

  function articleFor(id) {
    return FEMININE.has(id) ? "a" : "o";
  }

  function wordToFile(word) {
    return word.replace(/\s+/g, "-");
  }

  function questionPromptText(item) {
    if (item.kind === "letter") return `Onde está a letra ${item.char}?`;
    if (item.kind === "number") return `Onde está o ${item.name}?`;
    return `Onde está ${item.article} ${item.name}?`;
  }

  function gridFor(count) {
    if (count <= 3) return { cols: 1, rows: count };
    if (count <= 4) return { cols: 2, rows: 2 };
    if (count <= 6) return { cols: 2, rows: 3 };
    if (count <= 9) return { cols: 3, rows: 3 };
    return { cols: 3, rows: 4 };
  }

  function normalizeChoiceCount(n) {
    const val = Number(n);
    return CHOICE_COUNTS.includes(val) ? val : 2;
  }

  window.AcheCatalog = {
    ANIMALS,
    WORDS,
    BODY_PARTS,
    COLORS,
    LETTERS,
    NUMBERS,
    CHOICE_COUNTS,
    CHOICE_BACKGROUNDS,
    articleFor,
    wordToFile,
    questionPromptText,
    gridFor,
    normalizeChoiceCount,
  };
})();
