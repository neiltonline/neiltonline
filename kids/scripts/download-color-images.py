#!/usr/bin/env python3
"""Download CC-licensed object photos illustrating each color."""
import json
import os
import urllib.parse
import urllib.request

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images", "colors")
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TecladinhoKids/1.0 (educational kids app; contact: neiltonline@gmail.com)"
THUMB_WIDTH = 640

# slug -> Wikimedia filename (object that illustrates the color)
WIKI_IMAGES = {
    "vermelho": "Strawberries.jpg",       # morango
    "amarelo": "Banana-Single.jpg",       # banana
    "verde": "Granny Smith Apples.jpg",   # maçã verde
    "laranja": "Oranges - whole-halved-segment.jpg",
    "roxo": "Wine grapes03.jpg",          # uva roxa
    "rosa": "Pink rose–IMG 6796 02.jpg",  # flor rosa
    "branco": "Large cloud over Mexican landscape.jpg",
    "preto": "Black cat.jpg",
    "marrom": "Brown bear (Ursus arctos).jpg",
    "cinza": "African Bush Elephant.jpg",
}


def wiki_request(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=120) as resp:
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
    if "missing" in page:
        return None
    info = page["imageinfo"][0]
    return info.get("thumburl") or info.get("url")


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=180) as resp, open(dest, "wb") as out:
        while True:
            chunk = resp.read(1024 * 256)
            if not chunk:
                break
            out.write(chunk)


def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    ok, skip = 0, 0

    for slug, filename in WIKI_IMAGES.items():
        dest = os.path.join(IMAGES_DIR, f"{slug}.jpg")
        if os.path.exists(dest) and os.path.getsize(dest) > 5000:
            print(f"EXISTS {slug}", flush=True)
            ok += 1
            continue

        url = wiki_thumb_url(filename)
        if not url:
            print(f"SKIP {slug} ({filename})", flush=True)
            skip += 1
            continue

        try:
            download(url, dest)
            print(f"OK {slug}", flush=True)
            ok += 1
        except Exception as e:
            print(f"FAIL {slug}: {e}", flush=True)
            skip += 1

    print(f"Done: {ok} ok, {skip} skipped (azul.png is generated separately)", flush=True)


if __name__ == "__main__":
    main()
