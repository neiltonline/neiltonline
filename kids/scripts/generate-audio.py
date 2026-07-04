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
    "5": "cinco", "6": "seis", "7": "sete", "8": "oito", "9": "nove",
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
    "abraço", "beijo", "dormir",
]

BODY_WORDS = [
    "cabeça", "pé", "olhos", "orelha", "nariz", "boca",
    "mão", "braço", "perna", "barriga", "cabelo", "dente",
]

QUIZ_PROMPTS = {
    "muito-bem": "Muito bem!",
    "tenta-de-novo": "Tenta de novo!",
    "onde-esta-o": "Onde está o",
    "onde-esta-a": "Onde está a",
    "qual-e-o": "Qual é o",
    "qual-e-a": "Qual é a",
}

QUIZ_SHAPES = {
    "circulo": "círculo",
    "quadrado": "quadrado",
    "triangulo": "triângulo",
    "hexagono": "hexágono",
    "losango": "losango",
    "pentagono": "pentágono",
}


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

    for i in range(0, len(tasks), 5):
        await asyncio.gather(*tasks[i : i + 5])
        print(f"Generated {min(i + 5, len(tasks))}/{len(tasks)}", flush=True)

    print("Done!", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
