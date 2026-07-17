#!/usr/bin/env python3
"""Generate a simple arm illustration for the braço body-part slide."""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "images", "body", "braco.png")


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    w, h = 700, 900
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # upper arm
    draw.rounded_rectangle([180, 120, 520, 360], radius=90, fill="#FFCCBC", outline="#E64A19", width=10)
    # forearm
    draw.rounded_rectangle([220, 340, 480, 760], radius=80, fill="#FFAB91", outline="#E64A19", width=10)
    # hand
    draw.ellipse([200, 720, 500, 860], fill="#FFCCBC", outline="#E64A19", width=10)

    img.save(OUT, "PNG")
    print(f"Wrote {OUT}", flush=True)


if __name__ == "__main__":
    main()
