from __future__ import annotations
from typing import List, Dict, Any
import numpy as np


class InMemoryVectorStore:
    def __init__(self) -> None:
        self.vectors: List[List[float]] = []
        self.metadatas: List[Dict[str, Any]] = []

    def add_embeddings(self, vectors: List[List[float]], metadatas: List[Dict[str, Any]]) -> None:
        self.vectors.extend(vectors)
        self.metadatas.extend(metadatas)

    def similarity_search_by_vector(self, query_vec: List[float], k: int = 5) -> List[Dict[str, Any]]:
        if not self.vectors:
            return []
        mat = np.array(self.vectors, dtype=np.float32)
        q = np.array(query_vec, dtype=np.float32)
        # Cosine similarity
        mat_norm = mat / (np.linalg.norm(mat, axis=1, keepdims=True) + 1e-8)
        q_norm = q / (np.linalg.norm(q) + 1e-8)
        sims = mat_norm @ q_norm
        top_idx = np.argsort(-sims)[:k]
        results: List[Dict[str, Any]] = []
        for idx in top_idx:
            meta = dict(self.metadatas[idx])
            meta["similarity"] = float(sims[idx])
            results.append(meta)
        return results


_store: InMemoryVectorStore | None = None


def get_store() -> InMemoryVectorStore:
    global _store
    if _store is None:
        _store = InMemoryVectorStore()
    return _store
