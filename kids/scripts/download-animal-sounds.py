#!/usr/bin/env python3
"""Download real animal sounds (CC0 / Wikimedia Commons) and convert to short MP3 clips."""
import json
import os
import subprocess
import urllib.parse
import urllib.request

SOUNDS_DIR = os.path.join(os.path.dirname(__file__), "..", "audio", "sounds")
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TecladinhoKids/1.0 (educational kids app; contact: neiltonline@gmail.com)"
MAX_SECONDS = 3.5

# Only animals with iconic, recognizable vocalizations
SOURCES = {
    "gato": ("wiki", "Meow.ogg"),
    "cachorro": ("wiki", "Barking of a dog.ogg"),
    "vaca": ("wiki", "Single Cow Moo.ogg"),
    "porco": ("wiki", "Pig grunt - Erdie.ogg"),
    "galinha": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2015/04/Chicken-clucking.mp3"),
    "pinto": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2015/11/Baby-chicks-chirping-sound.mp3"),
    "pato": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2015/04/Duck-quack-sound.mp3"),
    "galo": ("wiki", "Rooster crowing.ogg"),
    "sapo": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2022/03/Frog-sound-effect.mp3"),
    "leao": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2018/02/Lion-roaring-sound.mp3"),
    "tigre": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2016/01/Tiger-roaring.mp3"),
    "elefante": ("wiki", "Elephant voice - trumpeting.ogg"),
    "urso": ("wiki", "Bear growl.ogg"),
    "raposa": ("wiki", "Red Fox (Vulpes vulpes) (W1CDR0001529 BD12).ogg"),
    "abelha": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2015/05/Bee-sounds.mp3"),
    "papagaio": ("wiki", "Parrots perroquets.ogg"),
    "jacare": ("wiki", "Alligatorbellow1.ogg"),
    "cavalo": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2020/04/Horse-neigh-sound-effect.mp3"),
    "ovelha": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2019/05/Sheep-bleating-noise.mp3"),
    "coruja": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2016/10/Great-horned-owl-call.mp3"),
    "lobo": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2020/04/Wolf-howling-sound.mp3"),
    "macaco": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2015/05/Mp3-monkey.mp3"),
}


def wiki_request(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req) as resp:
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
    with urllib.request.urlopen(req) as resp, open(dest, "wb") as out:
        out.write(resp.read())


def to_mp3(src, dest):
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", src,
            "-t", str(MAX_SECONDS),
            "-ac", "1", "-ar", "44100",
            "-af", "volume=1.5",
            "-b:a", "96k", dest,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )


def resolve_source(slug):
    kind, value = SOURCES[slug]
    if kind == "url":
        return value
    return wiki_file_url(value)


def main():
    os.makedirs(SOUNDS_DIR, exist_ok=True)
    ok, skip = 0, 0

    for slug in SOURCES:
        dest = os.path.join(SOUNDS_DIR, f"{slug}.mp3")
        tmp = os.path.join(SOUNDS_DIR, f"_{slug}_tmp")

        url = resolve_source(slug)
        if not url:
            print(f"SKIP {slug}", flush=True)
            skip += 1
            continue

        try:
            ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or ".bin"
            download(url, tmp + ext)
            to_mp3(tmp + ext, dest)
            if os.path.exists(tmp + ext):
                os.remove(tmp + ext)
            print(f"OK {slug}", flush=True)
            ok += 1
        except Exception as e:
            print(f"FAIL {slug}: {e}", flush=True)
            skip += 1

    print(f"Done: {ok} ok, {skip} skipped", flush=True)


if __name__ == "__main__":
    main()
