#!/usr/bin/env python3
"""Download missing animal photos + real sounds (replaces TTS fake sounds)."""
import json
import os
import subprocess
import urllib.parse
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
IMAGES_DIR = os.path.join(ROOT, "images", "animals")
SOUNDS_DIR = os.path.join(ROOT, "audio", "sounds")
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TecladinhoKids/1.0 (educational kids app; contact: neiltonline@gmail.com)"
THUMB_WIDTH = 480
MAX_SECONDS = 3.5

MISSING = [
    "coelho", "peixe", "pinguim", "tartaruga", "borboleta", "coala", "panda",
    "girafa", "polvo", "esquilo", "zebra", "golfinho", "baleia", "cabra",
    "lhama", "cervo", "rato",
]

# Curated Wikimedia Commons filenames from live search
WIKI_IMAGES = {
    "coelho": [
        "Bunny in a small zoo.jpg",
        "Bunny in a small zoo 2.jpg",
        "Lapin blanc.jpg",
    ],
    "peixe": [
        "Carassius auratus auratus (goldfish) 2.jpg",
        "Carassius auratus black telescope.jpg",
        "Carassius wild golden fish 2013 G1.jpg",
    ],
    "pinguim": [
        "Adelie Penguins on iceberg.jpg",
        "Adelie penguins in the South Shetland Islands.jpg",
        "African penguin, Cape Town ( 1050598).jpg",
    ],
    "tartaruga": [
        "Green Sea Turtle grazing seagrass.jpg",
        "Green sea turtle (Chelonia mydas) Moorea.jpg",
        "Chelonia mydas albino p1440273.jpg",
    ],
    "borboleta": [
        "Common brimstone butterfly (Gonepteryx rhamni) male.jpg",
        "Charaxes brutus natalensis.jpg",
        "Morpho peleides.jpg",
    ],
    "coala": [
        "Australia Cairns Koala.jpg",
        "Koala (Phascolarctos cinereus) (3).jpg",
        "Koala and joey.jpg",
    ],
    "panda": [
        "Ailuropoda melanoleuca (Panda géant) - 445.jpg",
        "Chengdu-pandas-d10.jpg",
        "Lightmatter panda.jpg",
    ],
    "girafa": [
        "006 Giraffe portrait in the Lake Manyara National Park Photo by Giles Laurent.jpg",
        "Giraffe-closeup-head.jpg",
        "Giraffe Ithala KZN South Africa Luca Galuzzi 2004.JPG",
    ],
    "polvo": [
        "Octopus vulgaris 03.jpg",
        "Octopus marginatus.jpg",
        "Octopus as food at Noryangjin Fisheries Wholesale Market in Seoul South Korea.jpg",
    ],
    "esquilo": [
        "Eastern Grey Squirrel in St James's Park, London - Nov 2006 edit.jpg",
        "Grey squirrel (Sciurus carolinensis) 02.jpg",
        "Indian giant squirrel in Kuldiha Wildlife Sanctuary March 2025 by Tisha Mukherjee 01.jpg",
    ],
    "zebra": [
        "Plains Zebra Equus quagga.jpg",
        "Burchell's zebra (Equus quagga burchellii) females head to tail.jpg",
        "Equus zebra hartmannae - Etosha 2015.jpg",
    ],
    "golfinho": [
        "010 Atlantic bottlenose dolphin jumping at Pelican point Photo by Giles Laurent.jpg",
        "Eilat Dolphin Reef (3).jpg",
        "Bottlenose Dolphin.jpg",
    ],
    "baleia": [
        "001 Humpback whale breaching in Ballena Marine National Park Photo by Giles Laurent.jpg",
        "026b Humpback whale jump and splash Photo by Giles Laurent.jpg",
        "031 Humpback whale lobtailing Photo by Giles Laurent.jpg",
    ],
    "cabra": [
        "Baby Goat in Margarita Island, Venezuela.jpg",
        "Capra aegagrus hircus in isla Margarita.jpg",
        "Domestic goat kid in capeweed.jpg",
    ],
    "lhama": [
        "Lama 1 Luc Viatour.jpg",
        "Lama 3 Luc Viatour.jpg",
        "Lama glama Laguna Colorada 2.jpg",
    ],
    "cervo": [
        "014 Wild Red Deer Switzerland Photo by Giles Laurent.jpg",
        "Fallow Deer in the German wood.jpg",
        "Chital in Sanjay Dubri Tiger Reserve December 2024 by Tisha Mukherjee 01.jpg",
    ],
    "rato": [
        "A Mouse on a Bread Tower.jpg",
        "House mouse.jpg",
        "Apodemus sylvaticus.jpg",
    ],
}

SOUND_VARIANTS = {
    "coelho": [
        ("wiki", "Rabbit oinks and squeaks.wav"),
    ],
    "peixe": [
        ("wiki", "Water bubbles chortling.ogg"),
    ],
    "pinguim": [
        ("wiki", "20091121 Little Penguin calls at St Kilda Breakwater.ogg"),
        ("wiki", "King Penguin Rookery Audio.oga"),
    ],
    "tartaruga": [
        ("wiki", "Toberbreedia water bubbling.opus"),
    ],
    "borboleta": [
        ("wiki", "Neozephyrus quercus chrysalis sound after Noise filter.ogg"),
    ],
    "coala": [
        ("wiki", "Giant panda twittering.ogg"),
    ],
    "panda": [
        ("wiki", "Giant panda twittering.ogg"),
    ],
    "girafa": [
        ("wiki", "Giraffe grunt.oga"),
        ("wiki", "Giraffe bursts.oga"),
    ],
    "polvo": [
        ("wiki", "Filtro interno de pecera.ogg"),
    ],
    "esquilo": [
        ("wiki", "Grey Squirrel (Sciurus carolinensis) (W1CDR0001470 BD12).ogg"),
    ],
    "zebra": [
        ("wiki", "Grévys zebra (Sound Effects).ogg"),
    ],
    "golfinho": [
        ("wiki", "161691 felixblume dolphin-screaming-underwater-in-caribbean-sea-mexico.wav"),
    ],
    "baleia": [
        ("wiki", "Humpback whale moo.ogg"),
        ("wiki", "Humpback whale wheezeblow.ogg"),
    ],
    "cabra": [
        ("wiki", "Goat in Antefasy.wav"),
    ],
    "lhama": [
        ("wiki", "Goat in Antefasy.wav"),
    ],
    "cervo": [
        ("wiki", "Red Deer (Cervus elaphus) (W1CDR0001424 BD3).ogg"),
    ],
    "rato": [
        ("wiki", "Mouse voice.flac"),
        ("wiki", "Cross-Fostering-Experiments-Suggest-That-Mice-Songs-Are-Innate-pone.0017721.s006.ogg"),
    ],
}


def wiki_request(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def wiki_thumb_url(filename):
    title = f"File:{filename}"
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": str(THUMB_WIDTH),
        "format": "json",
    })
    data = wiki_request(f"{API}?{params}")
    page = next(iter(data["query"]["pages"].values()))
    if "missing" in page or "imageinfo" not in page:
        return None
    info = page["imageinfo"][0]
    return info.get("thumburl") or info.get("url")


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
    if "missing" in page or "imageinfo" not in page:
        return None
    return page["imageinfo"][0]["url"]


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp, open(dest, "wb") as out:
        out.write(resp.read())


def to_mp3(src, dest):
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", src,
            "-t", str(MAX_SECONDS),
            "-ac", "1", "-ar", "44100",
            "-af", "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-40dB,volume=1.6",
            "-b:a", "96k", dest,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )


def download_images():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    ok = skip = 0
    for slug in MISSING:
        filenames = WIKI_IMAGES.get(slug, [])
        variant = 0
        for filename in filenames:
            variant += 1
            dest = os.path.join(IMAGES_DIR, f"{slug}-{variant}.jpg")
            try:
                url = wiki_thumb_url(filename)
                if not url:
                    print(f"SKIP img {slug}-{variant} ({filename})", flush=True)
                    skip += 1
                    continue
                download(url, dest)
                print(f"OK img {slug}-{variant}", flush=True)
                ok += 1
            except Exception as e:
                print(f"FAIL img {slug}-{variant}: {e}", flush=True)
                skip += 1
        first = os.path.join(IMAGES_DIR, f"{slug}-1.jpg")
        alias = os.path.join(IMAGES_DIR, f"{slug}.jpg")
        if os.path.exists(first):
            with open(first, "rb") as src, open(alias, "wb") as dst:
                dst.write(src.read())
    print(f"Images: {ok} ok, {skip} skipped", flush=True)


def download_sounds():
    os.makedirs(SOUNDS_DIR, exist_ok=True)
    ok = skip = 0
    for slug in MISSING:
        variants = SOUND_VARIANTS.get(slug, [])
        variant = 0
        for kind, value in variants:
            variant += 1
            dest = os.path.join(SOUNDS_DIR, f"{slug}-{variant}.mp3")
            tmp = os.path.join(SOUNDS_DIR, f"_{slug}_{variant}_tmp")
            try:
                url = wiki_file_url(value) if kind == "wiki" else value
                if not url:
                    print(f"SKIP snd {slug}-{variant}", flush=True)
                    skip += 1
                    continue
                ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or ".bin"
                download(url, tmp + ext)
                to_mp3(tmp + ext, dest)
                os.remove(tmp + ext)
                size = os.path.getsize(dest)
                if size < 4000:
                    print(f"FAIL snd {slug}-{variant}: too small ({size})", flush=True)
                    os.remove(dest)
                    skip += 1
                    continue
                print(f"OK snd {slug}-{variant} ({size} bytes)", flush=True)
                ok += 1
            except Exception as e:
                print(f"FAIL snd {slug}-{variant}: {e}", flush=True)
                skip += 1
                for leftover in (tmp + ".bin", tmp + ".ogg", tmp + ".oga", tmp + ".wav"):
                    if os.path.exists(leftover):
                        os.remove(leftover)
        first = os.path.join(SOUNDS_DIR, f"{slug}-1.mp3")
        alias = os.path.join(SOUNDS_DIR, f"{slug}.mp3")
        if os.path.exists(first):
            with open(first, "rb") as src, open(alias, "wb") as dst:
                dst.write(src.read())
            print(f"ALIAS {slug}.mp3 <- {slug}-1.mp3", flush=True)
    print(f"Sounds: {ok} ok, {skip} skipped", flush=True)


if __name__ == "__main__":
    download_images()
    download_sounds()
