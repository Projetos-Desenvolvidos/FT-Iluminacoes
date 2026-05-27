#!/usr/bin/env python3
"""Remove nested duplicate <picture> wrappers from HTML."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# <picture><source...><picture><source...> -> single picture
NESTED = re.compile(
    r"<picture>\s*<source type=\"image/webp\" srcset=\"([^\"]+)\">\s*"
    r"<picture>\s*<source type=\"image/webp\" srcset=\"\1\">\s*",
    re.IGNORECASE,
)

CLOSE_DOUBLE = re.compile(r"</picture>\s*</picture>", re.IGNORECASE)


def fix(text: str) -> str:
    prev = None
    while prev != text:
        prev = text
        text = NESTED.sub(r'<picture><source type="image/webp" srcset="\1">', text)
        text = CLOSE_DOUBLE.sub("</picture>", text)
    return text


def main() -> None:
    for path in ROOT.rglob("*.html"):
        raw = path.read_text(encoding="utf-8")
        fixed = fix(raw)
        if fixed != raw:
            path.write_text(fixed, encoding="utf-8")
            print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
