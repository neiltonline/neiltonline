#!/usr/bin/env python3
"""Download multiple CC-licensed animal photos per species from Wikimedia Commons."""
import json
import os
import urllib.parse
import urllib.request

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "images", "animals")
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TecladinhoKids/1.0 (educational kids app; contact: neiltonline@gmail.com)"
THUMB_WIDTH = 480

# slug -> list of Wikimedia Commons filenames (variants)
WIKI_IMAGES = {
    "gato": [
        "Felis catus-cat on snow.jpg",
        "Cat November 2010-1a.jpg",
        "Domestic shorthair cat portrait in grass.jpg",
    ],
    "cachorro": [
        "YellowLabradorLooking_new.jpg",
        "Golden Retriever puppy.jpg",
        "Beagle puppy Cadet.jpg",
    ],
    "vaca": [
        "Cow female black white.jpg",
        "Holstein cow.jpg",
        "Cows on pasture - geograph.org.uk - 128471.jpg",
    ],
    "porco": [
        "Cochon domestique (Sus scrofa domesticus) (2).jpg",
        "Pot-bellied pigs in Lisbon Zoo 2008.jpg",
        "Domesticated farm pig lying in the mud head covered in dry earth under the sun in Don Det Laos.jpg",
    ],
    "galinha": [
        "Hen chicken.jpg",
        "Gallus gallus domesticus - Vogelpark Steinen 01.jpg",
        "Rhode Island Red hen.jpg",
    ],
    "pinto": [
        "New Born Baby Chicks.jpg",
        "Hatched baby chick Live Animal Care Center Museum Science Boston.jpg",
        "Baby chicken (মুরগির বাচ্চা).jpg",
    ],
    "pato": [
        "Mallard duck.jpg",
        "Anas platyrhynchos male female.jpg",
        "Duckling.jpg",
    ],
    "galo": [
        "Rooster crowing.jpg",
        "Gallus gallus domesticus - St. Albans, Hertfordshire, England - rooster.jpg",
        "Rooster portrait.jpg",
    ],
    "sapo": [
        "Bufo bufo (Marek Szczepanek).jpg",
        "Common frog (Rana temporaria).jpg",
        "Green frog (Rana clamitans).jpg",
    ],
    "leao": [
        "Lion waiting in Namibia.jpg",
        "011 The lion king Tryggve in the Serengeti National Park Photo by Giles Laurent.jpg",
        "Lion cub Tanzania.jpg",
    ],
    "tigre": [
        "Tiger in Ranthambhore.jpg",
        "Panthera tigris tigris.jpg",
        "Bengal tiger (Panthera tigris tigris) female.jpg",
    ],
    "elefante": [
        "African elephant (Loxodonta africana).jpg",
        "Elephant in Kenya.jpg",
        "Asian elephant (Elephas maximus).jpg",
    ],
    "urso": [
        "Brown bear (Ursus arctos).jpg",
        "Grizzly bear in Yellowstone NP.jpg",
        "American black bear (Ursus americanus).jpg",
    ],
    "raposa": [
        "Alaska Red Fox (Vulpes vulpes).jpg",
        "Red Fox (Vulpes vulpes) (4).jpg",
        "Red fox 2025 05 30.jpg",
    ],
    "abelha": [
        "Apis mellifera Western honey bee.jpg",
        "Honey bee (Apis mellifera).jpg",
        "Bee on flower.jpg",
    ],
    "papagaio": [
        "Blue-and-yellow Macaw.jpg",
        "Ara macao -Captive-8a.jpg",
        "Amazon parrot.jpg",
    ],
    "jacare": [
        "American Alligator.jpg",
        "Alligator mississippiensis.jpg",
        "American alligator in water.jpg",
    ],
    "cavalo": [
        "Nokota Horses cropped.jpg",
        "Mustang horses.jpg",
        "Icelandic horse.jpg",
    ],
    "ovelha": [
        "Flock of sheep.jpg",
        "Sheep in meadow.jpg",
        "Domestic sheep (Ovis aries).jpg",
    ],
    "coruja": [
        "Great Horned Owl (Bubo virginianus) (48920155928).jpg",
        "Great horned owl (6293628118).jpg",
        "004 Great horned owl under a Pink Ipê tree in Encontro das Águas State Park Photo by Giles Laurent.jpg",
    ],
    "lobo": [
        "Canis lupus standing in snow.jpg",
        "Gray wolf (Canis lupus).jpg",
        "Wolf in Yellowstone National Park.jpg",
    ],
    "macaco": [
        "Macaca fascicularis.jpg",
        "Barbary macaque (Macaca sylvanus).jpg",
        "Chimpanzee (Pan troglodytes).jpg",
    ],
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

    for slug, filenames in WIKI_IMAGES.items():
        variant = 0
        for filename in filenames:
            variant += 1
            dest = os.path.join(IMAGES_DIR, f"{slug}-{variant}.jpg")
            url = wiki_thumb_url(filename)
            if not url:
                print(f"SKIP {slug}-{variant} ({filename})", flush=True)
                skip += 1
                continue
            try:
                download(url, dest)
                print(f"OK {slug}-{variant}", flush=True)
                ok += 1
            except Exception as e:
                print(f"FAIL {slug}-{variant}: {e}", flush=True)
                skip += 1

        # Legacy alias for config thumbnail
        first = os.path.join(IMAGES_DIR, f"{slug}-1.jpg")
        alias = os.path.join(IMAGES_DIR, f"{slug}.jpg")
        if os.path.exists(first):
            with open(first, "rb") as src, open(alias, "wb") as dst:
                dst.write(src.read())

    print(f"Done: {ok} ok, {skip} skipped", flush=True)


if __name__ == "__main__":
    main()
