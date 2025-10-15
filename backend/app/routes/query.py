from __future__ import annotations
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette import status

from ..core.rag_pipeline import rag_query

router = APIRouter()


class QueryBody(BaseModel):
    query: str
    model: str | None = None
    top_k: int | None = None


@router.post("/query")
async def query(body: QueryBody) -> Dict[str, Any]:
    if not body.query or not body.query.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query text is required")

    try:
        result = rag_query(body.query.strip(), body.model, body.top_k or 5)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    return result
