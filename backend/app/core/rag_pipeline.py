from __future__ import annotations
from typing import List, Dict, Any
import os
import requests

from .embeddings import EmbeddingModel
from .vectorstore import get_store


GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile"
GEMINI_DEFAULT_MODEL = "gemini-2.5-flash"


def build_prompt(context: str, question: str) -> str:
    return (
        "You are a helpful assistant. Answer the user's question using ONLY the context provided.\n"
        "Write a thorough, well-structured response with bullet points and specifics.\n"
        "Cite sources by filename in parentheses when relevant. If the answer is not in the context, say you don't know.\n\n"
        f"Context:\n{context or 'No relevant context found.'}\n\n"
        f"Question: {question}\n"
        "Answer:"
    )


def _extract_http_error(resp: requests.Response) -> str:
    try:
        data = resp.json()
        if isinstance(data, dict):
            if "error" in data:
                err = data["error"]
                if isinstance(err, dict) and "message" in err:
                    return str(err["message"])
            if "message" in data:
                return str(data["message"])
        return resp.text
    except Exception:
        return resp.text


def _call_groq(prompt: str, model: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not set")
    url = "https://api.groq.com/openai/v1/chat/completions"
    resp = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": "You answer strictly using provided context. Be detailed and structured."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 1024,
        },
        timeout=60,
    )
    if not resp.ok:
        raise RuntimeError(_extract_http_error(resp))
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


def _call_gemini(prompt: str, model: str) -> str:
    api_key = os.getenv("GOOGLE_AI_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_AI_API_KEY not set")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    resp = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
        },
        timeout=60,
    )
    if not resp.ok:
        raise RuntimeError(_extract_http_error(resp))
    data = resp.json()
    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


def call_llm(prompt: str, model_name: str | None) -> str:
    name = (model_name or "").lower().strip()
    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GOOGLE_AI_API_KEY")

    # Explicit routing based on selection
    try:
        if name in {"groq", "groq-llama3", "groq-llama3.1", "groq-llama-3.1", "groq-llama3.3", "groq-llama-3.3"} or "llama-3.3" in name or "llama3.3" in name or "llama-3.1" in name or "llama3" in name:
            return _call_groq(prompt, GROQ_DEFAULT_MODEL)
        if name.startswith("gemini"):
            return _call_gemini(prompt, name)
    except Exception as e:
        return f"[LLM error: {e}] " + prompt[:200]

    # Smart default if no explicit selection
    if groq_key:
        try:
            return _call_groq(prompt, GROQ_DEFAULT_MODEL)
        except Exception as e:
            return f"[LLM error: {e}] " + prompt[:200]
    if gemini_key:
        try:
            return _call_gemini(prompt, GEMINI_DEFAULT_MODEL)
        except Exception as e:
            return f"[LLM error: {e}] " + prompt[:200]

    return "[No LLM configured] " + prompt[:400]


def rag_query(query_text: str, model_name: str | None, top_k: int) -> Dict[str, Any]:
    embedder = EmbeddingModel.instance()
    store = get_store()

    qvec = embedder.embed_query(query_text)
    results = store.similarity_search_by_vector(qvec, k=top_k)

    if not results:
        context = ""
        sources: List[str] = []
        chunks_found = 0
    else:
        chunks = [r.get("text", "") for r in results]
        sources = list({r.get("source", "") for r in results if r.get("source")})
        context = "\n---\n".join(chunks)
        chunks_found = len(chunks)

    prompt = build_prompt(context, query_text)
    answer = call_llm(prompt, model_name)

    # Default reported model: Groq unless an explicit Gemini was chosen
    reported_model = model_name or ("groq-llama3.1" if os.getenv("GROQ_API_KEY") else GEMINI_DEFAULT_MODEL)

    return {
        "answer": answer,
        "model_used": reported_model,
        "sources": sources,
        "chunks_found": chunks_found,
    }
