#!/usr/bin/env python3
import asyncio
import os
import subprocess

VOICE = "pt-BR-FranciscaNeural"
EDGE_TTS = os.path.expanduser("~/.local/bin/edge-tts")
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "audio")

LETTER_OVERRIDES = {
    "v": "vé",
}

NUMBERS = {
    "0": "zero", "1": "um", "2": "dois", "3": "três", "4": "quatro",
    "5": "cinco", "6": "seis", "7": "sete", "8": "oito", "9": "nove", "10": "dez",
}

COLOR_WORDS = [
    "vermelho", "azul", "amarelo", "verde", "laranja",
    "roxo", "rosa", "branco", "preto", "marrom", "cinza",
    "anil", "violeta", "turquesa", "lilás", "dourado", "bege", "coral", "vinho",
]

ANIMAL_WORDS = [
    "gato", "cachorro", "vaca", "porco", "galinha", "pinto", "pato", "galo",
    "sapo", "leão", "tigre", "elefante", "urso", "raposa", "abelha", "papagaio",
    "jacaré", "cavalo", "ovelha", "coruja", "lobo", "macaco",
    "coelho", "peixe", "pinguim", "tartaruga", "borboleta",
    "coala", "panda", "girafa", "polvo", "esquilo",
    "zebra", "golfinho", "baleia", "cabra", "lhama", "cervo", "rato",
]

TODDLER_WORDS = [
    "papai", "mamãe", "titio", "titia", "vovó", "vovô",
    "bola", "brincar", "lua", "sol", "morango", "banana", "maçã",
    "água", "leite", "estrela", "flor", "bebê", "pão",
    "abraço", "beijo", "dormir", "balão", "bolha", "carrossel", "coração", "festa",
    "música", "pirulito", "arco-íris", "nuvem", "sorvete",
]

BODY_WORDS = [
    "cabeça", "pé", "olhos", "orelha", "nariz", "boca",
    "mão", "braço", "perna", "cabelo", "dente", "dedo",
]

QUIZ_PROMPTS = {
    "muito-bem": "Muito bem!",
    "tenta-de-novo": "Tenta de novo!",
    "onde-esta-o": "Onde está o",
    "onde-esta-a": "Onde está a",
    "letra": "letra",
}

QUIZ_SHAPES = {
    "circulo": "círculo",
    "quadrado": "quadrado",
    "triangulo": "triângulo",
    "hexagono": "hexágono",
    "losango": "losango",
    "pentagono": "pentágono",
}

FEMININE_IDS = {
    "vaca", "galinha", "raposa", "abelha", "ovelha", "coruja", "borboleta",
    "baleia", "cabra", "girafa", "zebra", "tartaruga", "lhama",
    "mamae", "titia", "vovo", "bola", "lua", "maca", "banana", "melancia",
    "agua", "flor", "estrela", "musica", "festa", "bolha", "nuvem",
    "cabeca", "orelha", "boca", "mao", "perna",
    "rosa", "laranja", "violeta", "turquesa", "lilas", "vinho",
}

ACHE_QUIZ_ITEMS = [
    ("gato", "gato"), ("cachorro", "cachorro"), ("vaca", "vaca"), ("porco", "porco"),
    ("galinha", "galinha"), ("pinto", "pintinho"), ("pato", "pato"), ("galo", "galo"),
    ("sapo", "sapo"), ("leao", "leão"), ("tigre", "tigre"), ("elefante", "elefante"),
    ("urso", "urso"), ("raposa", "raposa"), ("abelha", "abelha"), ("papagaio", "papagaio"),
    ("jacare", "jacaré"), ("cavalo", "cavalo"), ("ovelha", "ovelha"), ("coruja", "coruja"),
    ("lobo", "lobo"), ("macaco", "macaco"), ("coelho", "coelho"), ("peixe", "peixe"),
    ("pinguim", "pinguim"), ("tartaruga", "tartaruga"), ("borboleta", "borboleta"),
    ("coala", "coala"), ("panda", "panda"), ("girafa", "girafa"), ("polvo", "polvo"),
    ("esquilo", "esquilo"), ("zebra", "zebra"), ("golfinho", "golfinho"), ("baleia", "baleia"),
    ("cabra", "cabra"), ("lhama", "lhama"), ("cervo", "cervo"), ("rato", "rato"),
    ("vermelho", "vermelho"), ("azul", "azul"), ("amarelo", "amarelo"), ("verde", "verde"),
    ("laranja", "laranja"), ("roxo", "roxo"), ("rosa", "rosa"), ("branco", "branco"),
    ("preto", "preto"), ("marrom", "marrom"), ("cinza", "cinza"), ("anil", "anil"),
    ("violeta", "violeta"), ("turquesa", "turquesa"), ("lilas", "lilás"), ("dourado", "dourado"),
    ("bege", "bege"), ("coral", "coral"), ("vinho", "vinho"),
    ("papai", "papai"), ("mamae", "mamãe"), ("titio", "titio"), ("titia", "titia"),
    ("vovo", "vovó"), ("avo", "vovô"), ("bola", "bola"), ("brincar", "brincar"),
    ("lua", "lua"), ("sol", "sol"), ("morango", "morango"), ("banana", "banana"),
    ("maca", "maçã"), ("melancia", "melancia"), ("agua", "água"), ("leite", "leite"),
    ("estrela", "estrela"), ("flor", "flor"), ("bebe", "bebê"), ("pao", "pão"),
    ("abraco", "abraço"), ("dormir", "dormir"), ("balao", "balão"), ("bolha", "bolha"),
    ("carrossel", "carrossel"), ("coracao", "coração"), ("festa", "festa"), ("musica", "música"),
    ("pirulito", "pirulito"), ("arcoiris", "arco-íris"), ("nuvem", "nuvem"), ("sorvete", "sorvete"),
    ("cabeca", "cabeça"), ("pe", "pé"), ("olhos", "olhos"), ("orelha", "orelha"),
    ("nariz", "nariz"), ("boca", "boca"), ("mao", "mão"), ("braco", "braço"),
    ("perna", "perna"), ("cabelo", "cabelo"), ("dente", "dente"), ("dedo", "dedo"),
]


def article_for(item_id):
    if item_id in FEMININE_IDS:
        return "a"
    if item_id.endswith("a"):
        return "a"
    return "o"


async def generate(text, path, force=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path) and not force:
        return
    proc = await asyncio.create_subprocess_exec(
        EDGE_TTS, "--voice", VOICE, "--text", text, "--write-media", path,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    await proc.wait()


async def main():
    tasks = []

    for letter in "abcdefghijklmnopqrstuvwxyz":
        path = os.path.join(AUDIO_DIR, "letters", f"{letter}.mp3")
        text = LETTER_OVERRIDES.get(letter, letter)
        tasks.append(generate(text, path))

    for word in NUMBERS.values():
        path = os.path.join(AUDIO_DIR, "numbers", f"{word}.mp3")
        tasks.append(generate(word, path))

    for word in ANIMAL_WORDS:
        safe = word.replace(" ", "-")
        path = os.path.join(AUDIO_DIR, "words", f"{safe}.mp3")
        tasks.append(generate(word, path, force=True))

    for word in COLOR_WORDS:
        path = os.path.join(AUDIO_DIR, "words", f"{word}.mp3")
        tasks.append(generate(word, path, force=True))

    for word in TODDLER_WORDS:
        safe = word.replace(" ", "-")
        path = os.path.join(AUDIO_DIR, "words", f"{safe}.mp3")
        tasks.append(generate(word, path, force=True))

    for word in BODY_WORDS:
        safe = word.replace(" ", "-")
        path = os.path.join(AUDIO_DIR, "body", f"{safe}.mp3")
        tasks.append(generate(word, path, force=True))

    for slug, text in QUIZ_PROMPTS.items():
        path = os.path.join(AUDIO_DIR, "quiz", f"{slug}.mp3")
        tasks.append(generate(text, path, force=True))

    for slug, text in QUIZ_SHAPES.items():
        path = os.path.join(AUDIO_DIR, "quiz", "shapes", f"{slug}.mp3")
        tasks.append(generate(text, path, force=True))

    for item_id, spoken in ACHE_QUIZ_ITEMS:
        art = article_for(item_id)
        text = f"Onde está {art} {spoken}"
        path = os.path.join(AUDIO_DIR, "quiz", "ache", f"{item_id}.mp3")
        tasks.append(generate(text, path, force=True))

    for letter in "abcdefghijklmnopqrstuvwxyz":
        letter_name = LETTER_OVERRIDES.get(letter, letter)
        text = f"Onde está a letra {letter_name}"
        path = os.path.join(AUDIO_DIR, "quiz", "ache", f"letra-{letter}.mp3")
        tasks.append(generate(text, path, force=True))

    for num, name in NUMBERS.items():
        text = f"Onde está o {name}"
        path = os.path.join(AUDIO_DIR, "quiz", "ache", f"num-{num}.mp3")
        tasks.append(generate(text, path, force=True))

    for i in range(0, len(tasks), 5):
        await asyncio.gather(*tasks[i : i + 5])
        print(f"Generated {min(i + 5, len(tasks))}/{len(tasks)}", flush=True)

    print("Done!", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
