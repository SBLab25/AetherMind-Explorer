from __future__ import annotations
from typing import List


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 80) -> List[str]:
    normalized = " ".join(text.split())
    chunks: List[str] = []
    start = 0
    while start < len(normalized):
        end = min(len(normalized), start + chunk_size)
        chunks.append(normalized[start:end])
        if end == len(normalized):
            break
        start = max(0, end - overlap)
    return chunks
