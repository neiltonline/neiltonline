#!/usr/bin/env python3
import asyncio
import os
import subprocess

VOICE = "pt-BR-FranciscaNeural"
EDGE_TTS = os.path.expanduser("~/.local/bin/edge-tts")
SOUNDS_DIR = os.path.join(os.path.dirname(__file__), "..", "audio", "sounds")

ANIMAL_SOUNDS = {
    "gato": "Miau! Miau!",
    "cachorro": "Au au! Au au!",
    "sapo": "Coax! Coax!",
    "pinto": "Piu piu! Piu!",
    "peixe": "Blub blub!",
    "pato": "Quá quá! Quá!",
    "abelha": "Zum zum zum!",
    "borboleta": "Fufufu!",
    "urso": "Grrr!",
    "coelho": "Tic tic tic!",
    "vaca": "Muuu!",
    "porco": "Oinc! Oinc!",
    "leao": "Rrrrr!",
    "tigre": "Grrr! Grrr!",
    "coala": "Aaaa!",
    "panda": "Ham ham!",
    "raposa": "Ring ding!",
    "tartaruga": "Hmmm!",
    "polvo": "Blub blub blub!",
    "elefante": "Pruuu!",
    "girafa": "Hmmm!",
    "pinguim": "A a a!",
    "papagaio": "Loro! Loro!",
    "esquilo": "Tic tic!",
    "jacare": "Tchac!",
}


async def generate(text, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    proc = await asyncio.create_subprocess_exec(
        EDGE_TTS, "--voice", VOICE, "--text", text, "--write-media", path,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    await proc.wait()


async def main():
    tasks = []
    for slug, text in ANIMAL_SOUNDS.items():
        path = os.path.join(SOUNDS_DIR, f"{slug}.mp3")
        tasks.append(generate(text, path))

    for i in range(0, len(tasks), 5):
        await asyncio.gather(*tasks[i : i + 5])
        print(f"Generated {min(i + 5, len(tasks))}/{len(tasks)}", flush=True)

    print("Done!", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
