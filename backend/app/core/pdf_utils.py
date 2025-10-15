from __future__ import annotations
from pathlib import Path
from typing import Tuple


def extract_text_from_file(path: Path) -> Tuple[str, str]:
    suffix = path.suffix.lower()
    if suffix in {".txt", ".md"}:
        return path.read_text(encoding="utf-8", errors="ignore"), path.name

    if suffix == ".pdf":
        try:
            import pdfplumber  # type: ignore
        except Exception as e:
            raise RuntimeError("pdfplumber not installed; cannot parse PDF") from e
        text_parts: list[str] = []
        with pdfplumber.open(str(path)) as pdf:
            for page in pdf.pages:
                txt = page.extract_text() or ""
                if txt:
                    text_parts.append(txt)
        return "\n".join(text_parts), path.name

    raise RuntimeError(f"Unsupported file type: {suffix}")
