#!/usr/bin/env python3
"""Compress JPG/PNG in assets/ and generate WebP siblings."""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

# Max edge length by rough usage (home hero/portfolio vs cards vs logos)
MAX_EDGE = {
    "logo": 480,
    "png_ui": 1200,
    "jpg": 1600,
}

JPEG_QUALITY = 82
WEBP_QUALITY = 80
PNG_COMPRESS = 9


def max_edge_for(path: Path) -> int:
    name = path.name.lower()
    if name.startswith("f&t") or "logo" in name:
        return MAX_EDGE["logo"]
    if "-m." in name or name.endswith("-m.png"):
        return 900
    if path.suffix.lower() == ".png":
        return MAX_EDGE["png_ui"]
    return MAX_EDGE["jpg"]


def resize_if_needed(img: Image.Image, max_edge: int) -> Image.Image:
    w, h = img.size
    edge = max(w, h)
    if edge <= max_edge:
        return img
    scale = max_edge / edge
    new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
    return img.resize(new_size, Image.Resampling.LANCZOS)


def process_file(path: Path) -> tuple[int, int]:
  before = path.stat().st_size
  ext = path.suffix.lower()

  with Image.open(path) as im:
    im = im.convert("RGB") if ext in (".jpg", ".jpeg") and im.mode in ("RGBA", "P") else im
    if ext == ".png" and im.mode not in ("RGB", "RGBA"):
      im = im.convert("RGBA" if "A" in im.getbands() else "RGB")

    max_edge = max_edge_for(path)
    im = resize_if_needed(im, max_edge)

    if ext in (".jpg", ".jpeg"):
      im.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
      webp_path = path.with_suffix(".webp")
      rgb = im.convert("RGB")
      rgb.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)
    elif ext == ".png":
      if im.mode == "RGBA":
        im.save(path, "PNG", optimize=True, compress_level=PNG_COMPRESS)
      else:
        im.save(path, "PNG", optimize=True, compress_level=PNG_COMPRESS)
      webp_path = path.with_suffix(".webp")
      im.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6, lossless=False)

  after = path.stat().st_size
  webp_size = path.with_suffix(".webp").stat().st_size if path.with_suffix(".webp").exists() else 0
  return before, after + webp_size


def main() -> None:
  if not ASSETS.is_dir():
    raise SystemExit(f"Missing assets dir: {ASSETS}")

  total_before = 0
  total_after = 0
  count = 0

  for path in sorted(ASSETS.iterdir()):
    if path.suffix.lower() not in (".jpg", ".jpeg", ".png"):
      continue
    if path.suffix.lower() == ".webp":
      continue
    b, a = process_file(path)
    total_before += b
    total_after += a
    count += 1
    print(f"  {path.name}: {b // 1024}KB -> jpg/png {path.stat().st_size // 1024}KB + webp", flush=True)

  print(f"\nProcessed {count} files")
  print(f"Before: {total_before / 1024 / 1024:.1f} MB")
  print(f"After (jpg/png + webp): {total_after / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
  main()
