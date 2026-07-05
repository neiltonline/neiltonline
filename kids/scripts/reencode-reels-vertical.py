#!/usr/bin/env python3
"""Re-encode animal and word videos to vertical 9:16 reels format."""
import glob
import os
import subprocess

ROOT = os.path.join(os.path.dirname(__file__), "..")
DIRS = [
    os.path.join(ROOT, "videos", "animals"),
    os.path.join(ROOT, "videos", "words"),
]
MAX_SECONDS = 12
# Center-crop to 9:16, then scale to 720px wide
VF = (
    "crop="
    "'if(gt(iw/ih\\,9/16)\\,ih*9/16\\,iw)':"
    "'if(gt(iw/ih\\,9/16)\\,ih\\,iw*16/9)':"
    "'if(gt(iw/ih\\,9/16)\\,(iw-ih*9/16)/2\\,0)':"
    "'if(gt(iw/ih\\,9/16)\\,0\\,(ih-iw*16/9)/2)',"
    "scale=720:-2"
)


def reencode(path):
    tmp = path + ".tmp.mp4"
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", path,
            "-t", str(MAX_SECONDS),
            "-vf", VF,
            "-c:v", "libx264", "-preset", "fast", "-crf", "28",
            "-c:a", "aac", "-b:a", "64k", "-ac", "1",
            "-movflags", "+faststart",
            tmp,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )
    os.replace(tmp, path)


def main():
    ok, fail = 0, 0
    for directory in DIRS:
        for path in sorted(glob.glob(os.path.join(directory, "*.mp4"))):
            name = os.path.basename(path)
            try:
                reencode(path)
                size_kb = os.path.getsize(path) // 1024
                print(f"OK {name} ({size_kb}KB)", flush=True)
                ok += 1
            except Exception as e:
                print(f"FAIL {name}: {e}", flush=True)
                fail += 1
                if os.path.exists(path + ".tmp.mp4"):
                    os.remove(path + ".tmp.mp4")
    print(f"Done: {ok} ok, {fail} failed", flush=True)


if __name__ == "__main__":
    main()
