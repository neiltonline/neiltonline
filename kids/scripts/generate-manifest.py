#!/usr/bin/env python3
"""Build manifest.json listing image and sound variants per animal."""
import glob
import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
IMAGES_DIR = os.path.join(ROOT, "images", "animals")
SOUNDS_DIR = os.path.join(ROOT, "audio", "sounds")
VIDEOS_DIR = os.path.join(ROOT, "videos", "animals")
MANIFEST_PATH = os.path.join(ROOT, "data", "manifest.json")

VARIANT_RE = re.compile(r"^([a-z]+)-(\d+)\.(jpg|mp3|mp4)$")


def collect_variants(directory, ext):
    by_slug = {}
    for path in glob.glob(os.path.join(directory, f"*.{ext}")):
        name = os.path.basename(path)
        match = VARIANT_RE.match(name)
        if not match:
            continue
        slug, num, _ = match.groups()
        by_slug.setdefault(slug, []).append((int(num), name))

    result = {}
    for slug, items in sorted(by_slug.items()):
        items.sort()
        if ext == "jpg":
            rel = "images/animals"
        elif ext == "mp3":
            rel = "audio/sounds"
        else:
            rel = "videos/animals"
        result[slug] = [f"{rel}/{name}" for _, name in items]
    return result


def main():
    images = collect_variants(IMAGES_DIR, "jpg")
    sounds = collect_variants(SOUNDS_DIR, "mp3")
    videos = collect_variants(VIDEOS_DIR, "mp4")

    slugs = sorted(set(images) | set(sounds) | set(videos))
    manifest = {}
    for slug in slugs:
        manifest[slug] = {
            "images": images.get(slug, []),
            "sounds": sounds.get(slug, []),
            "videos": videos.get(slug, []),
        }

    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    total_img = sum(len(v["images"]) for v in manifest.values())
    total_snd = sum(len(v["sounds"]) for v in manifest.values())
    total_vid = sum(len(v["videos"]) for v in manifest.values())
    print(f"Wrote {MANIFEST_PATH}: {len(manifest)} animals, {total_img} images, {total_snd} sounds, {total_vid} videos", flush=True)


if __name__ == "__main__":
    main()
