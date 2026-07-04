#!/usr/bin/env python3
"""Download CC-licensed illustrations for body-part vocabulary."""
import json
import os
import urllib.parse
import urllib.request

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images", "body")
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TecladinhoKids/1.0 (educational kids app; contact: neiltonline@gmail.com)"
THUMB_WIDTH = 640

WIKI_IMAGES = {
    "cabeca": "Happy child.jpg",
    "pe": "Sole of foot of a two week old Asian infant on a white bed sheet, focus stacking.jpg",
    "olhos": "Close-up photograph of the eye of a baby with reflection of the scene in the pupil.jpg",
    "orelha": "Human ear.jpg",
    "nariz": "Human Nose.JPG",
    "boca": "Child with thumbs in her mouth (Unsplash).jpg",
    "mao": "Open hand.jpg",
    "perna": "Study of the Right Leg of a Male Child MET 269316.jpg",
    "barriga": "Belly button.jpg",
    "cabelo": "A lady braiding a child (hair style weaving) 02.jpg",
    "dente": "My first tooth - Flickr - frank.shepherd.jpg",
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

    print(f"Done: {ok} ok, {skip} skipped (braco.png generated separately)", flush=True)


if __name__ == "__main__":
    main()
