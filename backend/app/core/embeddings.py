from __future__ import annotations
from typing import List
from sentence_transformers import SentenceTransformer


class EmbeddingModel:
    _instance: "EmbeddingModel | None" = None

    def __init__(self) -> None:
        self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    @classmethod
    def instance(cls) -> "EmbeddingModel":
        if cls._instance is None:
            cls._instance = EmbeddingModel()
        return cls._instance

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        return self.model.encode(texts, normalize_embeddings=True).tolist()

    def embed_query(self, text: str) -> List[float]:
        return self.model.encode([text], normalize_embeddings=True)[0].tolist()
