#!/usr/bin/env python3
"""Generate a simple blue ball illustration for the azul color slide."""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "images", "colors", "azul.png")


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    size = 900
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([95, 95, 805, 805], fill=(0, 0, 0, 48))
    draw.ellipse([70, 70, 790, 790], fill="#1E88E5")
    draw.ellipse([165, 115, 355, 275], fill="#90CAF9")
    draw.ellipse([515, 515, 695, 695], fill=(255, 255, 255, 48))
    img.save(OUT, "PNG")
    print(f"Wrote {OUT}", flush=True)


if __name__ == "__main__":
    main()
