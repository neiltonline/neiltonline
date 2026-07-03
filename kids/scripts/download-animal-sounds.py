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

# slug -> ("wiki", filename) | ("url", direct_mp3_or_audio_url)
SOURCES = {
    "gato": ("wiki", "Meow.ogg"),
    "cachorro": ("wiki", "Barking of a dog.ogg"),
    "vaca": ("wiki", "Single Cow Moo.ogg"),
    "porco": ("wiki", "Pig grunt - Erdie.ogg"),
    "pinto": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2015/11/Baby-chicks-chirping-sound.mp3"),
    "leao": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2018/02/Lion-roaring-sound.mp3"),
    "elefante": ("wiki", "Elephant voice - trumpeting.ogg"),
    "pato": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2015/04/Duck-quack-sound.mp3"),
    "sapo": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2022/03/Frog-sound-effect.mp3"),
    "abelha": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2015/05/Bee-sounds.mp3"),
    "urso": ("wiki", "Bear growl.ogg"),
    "tigre": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2016/01/Tiger-roaring.mp3"),
    "coala": ("wiki", "Perception-of-Male-Caller-Identity-in-Koalas-(Phascolarctos-cinereus)-Acoustic-Analysis-and-pone.0020329.s001.ogv"),
    "panda": ("wiki", "Giant panda twittering.ogg"),
    "papagaio": ("wiki", "Parrots perroquets.ogg"),
    "jacare": ("wiki", "Alligatorbellow1.ogg"),
    "peixe": ("url", "https://www.orangefreesounds.com/wp-content/uploads/2022/02/Small-water-splash-sound-effect.mp3"),
    "coelho": ("wiki", "Rabbit oinks and squeaks.wav"),
    "raposa": ("wiki", "Red Fox (Vulpes vulpes) (W1CDR0001529 BD12).ogg"),
    "tartaruga": ("wiki", "Turtle-ar.wav"),
    "polvo": ("wiki", "Octopus in Vezo.ogg"),
    "girafa": ("wiki", "Q862089-ar.ogg"),
    "pinguim": ("wiki", "20091121 Little Penguin calls at St Kilda Breakwater.ogg"),
    "esquilo": ("wiki", "Three Squirrels chirping.ogg"),
    "borboleta": ("wiki", "Neozephyrus quercus chrysalis sound after Noise filter.ogg"),
}

WIKI_SEARCH = {
    "coala": "koala vocalization",
    "panda": "giant panda bleat",
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


def wiki_search_file(term):
    params = urllib.parse.urlencode({
        "action": "query",
        "list": "search",
        "srsearch": f"filetype:audio {term}",
        "srnamespace": "6",
        "srlimit": "5",
        "format": "json",
    })
    data = wiki_request(f"{API}?{params}")
    for item in data.get("query", {}).get("search", []):
        title = item["title"].replace("File:", "")
        if title.lower().endswith((".ogg", ".mp3", ".wav", ".oga")):
            url = wiki_file_url(title)
            if url:
                return url, title
    return None, None


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
    if slug not in SOURCES:
        return None
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
        if not url and slug in WIKI_SEARCH:
            url, found = wiki_search_file(WIKI_SEARCH[slug])
            if url:
                print(f"SEARCH {slug} <- {found}", flush=True)

        if not url:
            print(f"SKIP {slug}", flush=True)
            skip += 1
            continue

        try:
            ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or ".bin"
            download(url, tmp + ext)
            to_mp3(tmp + ext, dest)
            os.remove(tmp + ext)
            print(f"OK {slug}", flush=True)
            ok += 1
        except Exception as e:
            print(f"FAIL {slug}: {e}", flush=True)
            skip += 1

    print(f"Done: {ok} ok, {skip} skipped", flush=True)


if __name__ == "__main__":
    main()
