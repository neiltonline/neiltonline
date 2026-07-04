#!/usr/bin/env python3
"""Download CC-licensed animal photos from Wikimedia Commons."""
import json
import os
import urllib.parse
import urllib.request

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images", "animals")
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TecladinhoKids/1.0 (educational kids app; contact: neiltonline@gmail.com)"
THUMB_WIDTH = 480

# slug -> Wikimedia Commons filename
WIKI_IMAGES = {
    "gato": "Felis catus-cat on snow.jpg",
    "cachorro": "YellowLabradorLooking_new.jpg",
    "vaca": "Cow female black white.jpg",
    "porco": "Cochon domestique (Sus scrofa domesticus) (2).jpg",
    "galinha": "Hen chicken.jpg",
    "pinto": "New Born Baby Chicks.jpg",
    "pato": "Mallard duck.jpg",
    "galo": "Rooster crowing.jpg",
    "sapo": "Bufo bufo (Marek Szczepanek).jpg",
    "leao": "Lion waiting in Namibia.jpg",
    "tigre": "Tiger in Ranthambhore.jpg",
    "elefante": "African elephant (Loxodonta africana).jpg",
    "urso": "Brown bear (Ursus arctos).jpg",
    "raposa": "Alaska Red Fox (Vulpes vulpes).jpg",
    "abelha": "Apis mellifera Western honey bee.jpg",
    "papagaio": "Blue-and-yellow Macaw.jpg",
    "jacare": "American Alligator.jpg",
    "cavalo": "Nokota Horses cropped.jpg",
    "ovelha": "Flock of sheep.jpg",
    "coruja": "Great Horned Owl (Bubo virginianus) (48920155928).jpg",
    "lobo": "Canis lupus standing in snow.jpg",
    "macaco": "Macaca fascicularis.jpg",
}


def wiki_request(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req) as resp:
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
    with urllib.request.urlopen(req) as resp, open(dest, "wb") as out:
        out.write(resp.read())


def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    ok, skip = 0, 0

    for slug, filename in WIKI_IMAGES.items():
        dest = os.path.join(IMAGES_DIR, f"{slug}.jpg")
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

    print(f"Done: {ok} ok, {skip} skipped", flush=True)


if __name__ == "__main__":
    main()
