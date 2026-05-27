#!/usr/bin/env python3
"""Add WebP <source> lines to existing <picture> blocks."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SOURCE_RE = re.compile(
    r'(<picture>\s*)'
    r'(<source\b(?![^>]*type=["\']image/webp)[^>]*\bsrcset=["\'])([^"\']+)(["\'][^>]*>)',
    re.IGNORECASE,
)


def webp_url(src: str) -> str | None:
    if re.search(r"\.(jpe?g|png)$", src, re.I):
        return re.sub(r"\.(jpe?g|png)$", ".webp", src, flags=re.I)
    return None


def add_webp(match: re.Match[str]) -> str:
    open_tag, src_open, src, src_close = match.group(1), match.group(2), match.group(3), match.group(4)
    w = webp_url(src)
    if not w:
        return match.group(0)
    media = ' media="(max-width: 900px)"' if "max-width: 900px" in src_close or "max-width: 900px" in match.group(0) else ""
    if "media=" in src_open:
        media_attr = re.search(r'\bmedia=(["\'])(.*?)\1', src_open + src_close, re.I)
        media = f' media="{media_attr.group(2)}"' if media_attr else ""
    webp_line = f'<source type="image/webp"{media} srcset="{w}">\n              '
    return f"{open_tag}{webp_line}{src_open}{src}{src_close}"


def patch_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    new_text, n = SOURCE_RE.subn(add_webp, text)
    if n:
        path.write_text(new_text, encoding="utf-8")
    return n


def main() -> None:
    for f in [ROOT / "index.html"]:
        c = patch_file(f)
        print(f"{f.name}: {c} sources enhanced")


if __name__ == "__main__":
    main()
