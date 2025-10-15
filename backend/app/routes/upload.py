from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, HTTPException
from starlette import status
from typing import Dict
from uuid import uuid4
from pathlib import Path

from ..utils import chunk_text
from ..core.embeddings import EmbeddingModel
from ..core.vectorstore import get_store
from ..core.pdf_utils import extract_text_from_file

router = APIRouter()


@router.post("/upload")
async def upload(file: UploadFile = File(...)) -> Dict[str, int | str]:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing filename")
    suffix = Path(file.filename).suffix.lower()
    if suffix not in {".pdf", ".txt", ".md"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF/TXT/MD supported")

    content = await file.read()
    tmp_path = Path("backend/data/uploads")
    tmp_path.mkdir(parents=True, exist_ok=True)
    saved = tmp_path / f"{uuid4().hex}{suffix}"
    saved.write_bytes(content)

    try:
        text, source_name = extract_text_from_file(saved)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to parse file: {e}")

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No extractable text found")

    embedder = EmbeddingModel.instance()
    vectors = embedder.embed_texts(chunks)
    metadatas = [{"source": source_name, "chunk_id": i, "text": c} for i, c in enumerate(chunks)]

    store = get_store()
    store.add_embeddings(vectors, metadatas)

    return {"message": "Document indexed successfully", "chunks": len(chunks)}
