#!/usr/bin/env python3
"""Download CC-licensed videos for toddler vocabulary words from Wikimedia Commons."""
import json
import os
import subprocess
import time
import urllib.parse
import urllib.request

VIDEOS_DIR = os.path.join(os.path.dirname(__file__), "..", "videos", "words")
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TecladinhoKids/1.0 (educational kids app; contact: neiltonline@gmail.com)"
MAX_SECONDS = 10
REELS_VF = (
    "crop="
    "'if(gt(iw/ih\\,9/16)\\,ih*9/16\\,iw)':"
    "'if(gt(iw/ih\\,9/16)\\,ih\\,iw*16/9)':"
    "'if(gt(iw/ih\\,9/16)\\,(iw-ih*9/16)/2\\,0)':"
    "'if(gt(iw/ih\\,9/16)\\,0\\,(ih-iw*16/9)/2)',"
    "scale=720:-2"
)

# slug -> list of Wikimedia filenames (CC / public domain)
WIKI_VIDEOS = {
    "papai": [
        "20200530 141604 Girl and dad digging a hole with a crowbar Ptz.webm",
    ],
    "mamae": [
        "Groene Kruis film 1.webm",
    ],
    "titio": [
        "20200530 141604 Girl and dad digging a hole with a crowbar Ptz.webm",
    ],
    "titia": [
        "Changing a Baby s Diaper Pampers.webm",
    ],
    "vovo": [
        "Kenyan grandmother in rural kitchen.webm",
    ],
    "avo": [
        "Grandfather Ivan.webm",
    ],
    "bola": [
        "Bouncing Ball.webm",
        "Bouncy ball 240fps.webm",
    ],
    "brincar": [
        "KidsPlayingSeeSaw.webm",
        "Children Playing in Cameroon.webm",
    ],
    "lua": [
        "Video-MoonPassingEarth-20150716.webm",
        "Clouds over full moon at night (Free HD stock video).webm",
    ],
    "sol": [
        "Timelapse of sunset in Norway - Earth spinning or Sun moving-.webm",
    ],
    "morango": [
        "Strawberry growth (Video).webm",
    ],
    "banana": [
        "Indonesian short-nosed fruit bat (Cynopterus titthaecheilus) eats a banana.webm",
    ],
    "maca": [
        "Pestvogels met een appel-4961899.webm",
    ],
    "agua": [
        "Pouring coastal water on Wikidata - Can we add more-.webm",
    ],
    "leite": [
        "En.Wikipedia-VideoWiki-Breastfeeding.webm",
    ],
    "estrela": [
        "Timelapse of the sky at night and in the day.webm",
    ],
    "flor": [
        "Bee on Apple.webm",
    ],
    "bebe": [
        "4 Month Milestone- Copies some movements and facial expressions, like smiling or frowning.webm",
    ],
    "pao": [
        "Bread baking in Balochistan.webm",
    ],
    "abraco": [
        "Two cats holding each other and hugging.webm",
    ],
    "beijo": [
        "Boy Meets Girl-6835477.webm",
    ],
    "dormir": [
        "Baby Globe sleeping.webm",
        "Moro reflex while sleeping.ogv",
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
            "-vf", REELS_VF,
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

            time.sleep(1.2)
            url = wiki_file_url(filename)
            if not url:
                print(f"SKIP {slug}-{variant} ({filename})", flush=True)
                skip += 1
                continue

            tmp = os.path.join(VIDEOS_DIR, f"_{slug}_{variant}_tmp")
            ext = ".bin"
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
