#!/usr/bin/env python3
"""Crop the Android status bar (top) and gesture nav bar (bottom) from a screenshot.

Usage:
    python scripts/crop-android.py screen.png
    python scripts/crop-android.py screen.png --top 96 --bottom 66
    python scripts/crop-android.py shot.png --out cropped.png

Defaults assume a 1080-wide screenshot from a modern Pixel-class device.
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.stderr.write("Pillow is required: pip install pillow\n")
    sys.exit(1)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("path", type=Path, help="Path to the PNG screenshot")
    p.add_argument("--top", type=int, default=96, help="Pixels to crop from the top (status bar). Default 96.")
    p.add_argument("--bottom", type=int, default=66, help="Pixels to crop from the bottom (nav bar). Default 66.")
    p.add_argument("--out", type=Path, default=None, help="Output path. Default: overwrite input.")
    args = p.parse_args()

    if not args.path.exists():
        sys.stderr.write(f"Not found: {args.path}\n")
        return 1

    img = Image.open(args.path)
    w, h = img.size
    top = max(0, args.top)
    bottom = max(0, args.bottom)
    if top + bottom >= h:
        sys.stderr.write(f"Crop too large for image height {h}\n")
        return 2

    cropped = img.crop((0, top, w, h - bottom))
    out = args.out or args.path
    cropped.save(out, optimize=True)
    print(f"Cropped {args.path}: {w}x{h} -> {cropped.size[0]}x{cropped.size[1]} (-{top}px top, -{bottom}px bottom) -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
