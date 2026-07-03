#!/usr/bin/env python3
import asyncio
import os
import subprocess
import sys

VOICE = "pt-BR-FranciscaNeural"
EDGE_TTS = os.path.expanduser("~/.local/bin/edge-tts")
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "audio")

NUMBERS = {
    "0": "zero", "1": "um", "2": "dois", "3": "três", "4": "quatro",
    "5": "cinco", "6": "seis", "7": "sete", "8": "oito", "9": "nove",
}

EMOJI_WORDS = [
    "gatinho", "cachorrinho", "sapinho", "pintinho", "peixinho", "patinho",
    "abelhinha", "borboleta", "ursinho", "coelhinho", "vaquinha", "porquinho",
    "leãozinho", "tigrinho", "coala", "pandinha", "raposinha", "tartaruguinha",
    "polvo", "elefantinho", "girafa", "penguim", "papagaio", "esquilo",
    "lua", "estrela", "sol", "arco-íris", "balão", "festa", "coração",
    "maçã", "banana", "morango", "ursinho de pelúcia", "música", "estrelinha",
    "flor", "pirulito", "bolha", "carrossel", "melancia", "figurinha",
]


async def generate(text, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path):
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
        tasks.append(generate(letter, path))

    for word in NUMBERS.values():
        path = os.path.join(AUDIO_DIR, "numbers", f"{word}.mp3")
        tasks.append(generate(word, path))

    for word in EMOJI_WORDS:
        safe = word.replace(" ", "-")
        path = os.path.join(AUDIO_DIR, "words", f"{safe}.mp3")
        tasks.append(generate(word, path))

    for i in range(0, len(tasks), 5):
        await asyncio.gather(*tasks[i : i + 5])
        print(f"Generated {min(i + 5, len(tasks))}/{len(tasks)}", flush=True)

    print("Done!", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
