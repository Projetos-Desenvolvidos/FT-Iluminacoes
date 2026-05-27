#!/usr/bin/env python3
"""Wrap <img src="...assets/foo.jpg"> with <picture> + WebP source."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_GLOB = ("index.html", "paginas/*.html")

IMG_RE = re.compile(
    r'(<img\b(?![^>]*\bsrcset=)(?=[^>]*\bsrc=["\'])(?=[^>]*assets/)[^>]*\bsrc=["\'])([^"\']+)(["\'][^>]*>)',
    re.IGNORECASE,
)

PICTURE_RE = re.compile(r"<picture\b", re.IGNORECASE)


def webp_src(src: str) -> str | None:
  if not re.search(r"\.(jpe?g|png)$", src, re.I):
    return None
  return re.sub(r"\.(jpe?g|png)$", ".webp", src, flags=re.I)


def wrap_img(match: re.Match[str]) -> str:
  prefix, src, suffix = match.group(1), match.group(2), match.group(3)
  if "type=\"image/webp\"" in prefix or "type='image/webp'" in prefix:
    return match.group(0)
  w = webp_src(src)
  if not w:
    return match.group(0)
  return f'<picture><source type="image/webp" srcset="{w}">{prefix}{src}{suffix}</picture>'


def patch_file(path: Path) -> int:
  text = path.read_text(encoding="utf-8")
  if "assets/" not in text:
    return 0

  # Skip imgs already inside picture (rough: only wrap bare img tags)
  parts = []
  n = 0
  last = 0
  for m in IMG_RE.finditer(text):
    start = m.start()
    chunk_before = text[last:start]
    # If nearest unclosed picture before this img, skip
    open_pictures = len(PICTURE_RE.findall(chunk_before)) - chunk_before.lower().count("</picture>")
    if open_pictures > 0 or "type=\"image/webp\"" in m.group(0):
      parts.append(text[last:m.end()])
      last = m.end()
      continue
    parts.append(text[last:start])
    parts.append(wrap_img(m))
    n += 1
    last = m.end()
  parts.append(text[last:])
  new_text = "".join(parts)

  if n:
    path.write_text(new_text, encoding="utf-8")
  return n


def main() -> None:
  files = [ROOT / "index.html", *sorted((ROOT / "paginas").glob("*.html"))]
  total = 0
  for f in files:
    if f.is_file():
      c = patch_file(f)
      if c:
        print(f"{f.relative_to(ROOT)}: {c} images")
        total += c
  print(f"Total wrapped: {total}")


if __name__ == "__main__":
  main()
