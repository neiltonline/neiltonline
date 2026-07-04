#!/usr/bin/env python3
"""Download CC-licensed animal videos from Wikimedia Commons and convert to short MP4."""
import json
import os
import subprocess
import urllib.parse
import urllib.request

VIDEOS_DIR = os.path.join(os.path.dirname(__file__), "..", "videos", "animals")
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TecladinhoKids/1.0 (educational kids app; contact: neiltonline@gmail.com)"
MAX_SECONDS = 12
MAX_WIDTH = 640

# slug -> list of Wikimedia filenames
WIKI_VIDEOS = {
    "gato": [
        "Kitten playing - Tokyo - Jan 7 2020.webm",
        "Calico kitten playing.webm",
        "Cat playing with a round track toy.webm",
    ],
    "cachorro": [
        "Dog walking in the Mission in San Francisco.ogv",
        "Dog park.theora.ogv",
    ],
    "vaca": [
        "Cow grazing in the farm.webm",
    ],
    "porco": [
        "2023-08-18 ZOO LJUBLJANA Sus scrofa domesticus DOMAČI PRAŠIČ.webm",
        "Wuppertal - Zoo - Sus scrofa domesticus 01 (1).ogv",
    ],
    "galinha": [
        "Gallus gallus domesticus - Kanagawa 2025 2 15.webm",
        "2022-06-15 ŠMARJE GALLIFORMES Gallus gallus domesticus DOMAČA KOKOŠ.webm",
    ],
    "pinto": [
        "Baby Chick Hatching.webm",
        "Newly hatched chickens indoors 01.webm",
    ],
    "pato": [
        "Ducks at the Duck Pond - Sonoma - September 2022 - Sarah Stierch.webm",
        "Mallards pond 2009.ogv",
        "Anas platyrhynchos in Szczecin, May 2020.webm",
    ],
    "galo": [
        "Rooster crowing small.ogv",
        "Cockerel crowing.webm",
    ],
    "sapo": [
        "Frog in the swamp.webm",
        "Frog croaking after rain.webm",
    ],
    "leao": [
        "Lion (Panthera leo).webm",
        "Lion (Panthera leo) walking on the road.webm",
    ],
    "tigre": [
        "Siberian tiger (Panthera tigris altaica).webm",
        "Male white tiger in a zoo (Panthera tigris tigris).webm",
    ],
    "elefante": [
        "African Elephant Movie 2019-07-28.webm",
        "Savanna Elephant (Loxodonta africana) bull drinking from a rain puddle.webm",
        "A young African elephant resting.webm",
    ],
    "urso": [
        "Bear in Bulgarian Four paws.webm",
        "2025-09-20-vdk-skt-bears-124611.webm",
    ],
    "raposa": [
        "Red fox (Vulpes vulpes) looking for a mouse.webm",
        "Urban fox at night.webm",
    ],
    "abelha": [
        "Flying bee on flower in slow motion.webm",
        "Bee on Apple.webm",
    ],
    "papagaio": [
        "Pet Parrot (01).ogv",
        "Parrots fight.webm",
    ],
    "jacare": [
        "American alligator (Alligator mississippiensis).ogv",
        "Alligator, visible from boardwalk overlooking Cooter Pond, Inverness, Florida.webm",
    ],
    "cavalo": [
        "A grazing horse at the Écomusée de la Bintinais.webm",
        "A Brown Horse of Salem City.webm",
    ],
    "ovelha": [
        "Sheep.webm",
        "The Sheep of Stonehenge.webm",
    ],
    "coruja": [
        "Great horned owl.webm",
        "Great horned owl (Bubo virginianus) in eastern Washington State.webm",
    ],
    "lobo": [
        "Italian wolves (Canis lupus italicus).webm",
        "Wuppertal - Zoo - Canis lupus arctos 01 (1).ogv",
    ],
    "macaco": [
        "Baby monkey drinking water.webm",
    ],
}


def wiki_request(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)


def wiki_file_url(filename):
    title = f"File:{filename}"
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json",
    })
    data = wiki_request(f"{API}?{params}")
    page = next(iter(data["query"]["pages"].values()))
    if "missing" in page:
        return None
    return page["imageinfo"][0]["url"]


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=180) as resp, open(dest, "wb") as out:
        while True:
            chunk = resp.read(1024 * 256)
            if not chunk:
                break
            out.write(chunk)


def to_mp4(src, dest):
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", src,
            "-t", str(MAX_SECONDS),
            "-vf", f"scale='min({MAX_WIDTH},iw)':-2",
            "-c:v", "libx264", "-preset", "fast", "-crf", "28",
            "-c:a", "aac", "-b:a", "64k", "-ac", "1",
            "-movflags", "+faststart",
            dest,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )


def main():
    os.makedirs(VIDEOS_DIR, exist_ok=True)
    ok, skip = 0, 0

    for slug, filenames in WIKI_VIDEOS.items():
        variant = 0
        for filename in filenames:
            variant += 1
            dest = os.path.join(VIDEOS_DIR, f"{slug}-{variant}.mp4")
            if os.path.exists(dest) and os.path.getsize(dest) > 10000:
                print(f"EXISTS {slug}-{variant}", flush=True)
                ok += 1
                continue

            url = wiki_file_url(filename)
            if not url:
                print(f"SKIP {slug}-{variant} ({filename})", flush=True)
                skip += 1
                continue

            tmp = os.path.join(VIDEOS_DIR, f"_{slug}_{variant}_tmp")
            try:
                ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or ".bin"
                print(f"DL {slug}-{variant}...", flush=True)
                download(url, tmp + ext)
                to_mp4(tmp + ext, dest)
                if os.path.exists(tmp + ext):
                    os.remove(tmp + ext)
                size_kb = os.path.getsize(dest) // 1024
                print(f"OK {slug}-{variant} ({size_kb}KB)", flush=True)
                ok += 1
            except Exception as e:
                print(f"FAIL {slug}-{variant}: {e}", flush=True)
                skip += 1
                for p in [tmp + ext, dest]:
                    if os.path.exists(p):
                        os.remove(p)

    print(f"Done: {ok} ok, {skip} skipped", flush=True)


if __name__ == "__main__":
    main()
