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

EMOJI_WORDS = [
    "gato", "cachorro", "sapo", "galinha", "peixe", "pato",
    "abelha", "borboleta", "urso", "coelho", "vaca", "porco",
    "leão", "tigre", "coala", "panda", "raposa", "tartaruga",
    "polvo", "elefante", "girafa", "pinguim", "papagaio", "esquilo",
    "jacaré",
    "lua", "estrela", "sol", "arco-íris", "balão", "festa", "coração",
    "maçã", "banana", "morango", "urso de pelúcia", "música",
    "flor", "pirulito", "bolha", "carrossel", "melancia", "figurinha",
]


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

    for word in EMOJI_WORDS:
        safe = word.replace(" ", "-")
        path = os.path.join(AUDIO_DIR, "words", f"{safe}.mp3")
        tasks.append(generate(word, path, force=True))

    for i in range(0, len(tasks), 5):
        await asyncio.gather(*tasks[i : i + 5])
        print(f"Generated {min(i + 5, len(tasks))}/{len(tasks)}", flush=True)

    print("Done!", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
