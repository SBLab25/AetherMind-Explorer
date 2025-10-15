
---

# 🧠 AetherMind Explorer

**AetherMind Explorer** is an AI-powered, RAG-based knowledge exploration platform combining a modern React frontend with an intelligent backend built on FastAPI and multi-LLM integration (Groq, OpenRouter, etc.).
It allows users to upload documents, query their contents, and receive synthesized, context-aware answers using state-of-the-art large language models.

---

## 🚀 Project Overview

AetherMind Explorer enables **retrieval-augmented generation (RAG)**:
users can upload multiple PDFs or text files, which are embedded, indexed, and searched in response to user queries. The retrieved text chunks are then passed to an LLM for concise answer synthesis.

**Key capabilities:**

* 📄 PDF / text document ingestion & vectorization
* 🔍 Semantic search and retrieval with FAISS
* 🤖 Multi-model LLM router (Groq / OpenRouter / others)
* 💬 Frontend chat-style interface built in React (Lovable)
* ⚙️ FastAPI backend with modular architecture
* ☁️ Deployable to Vercel / Render / Railway

---
Demo Video Link

https://drive.google.com/file/d/10YQMbMxy8ODKiaA1VYaBKEXhmcdQtIFN/view?usp=sharing

---
## 🏗️ Architecture

```
[Frontend: React + Vite + Tailwind + shadcn-ui]
       │
       ▼
[Backend: FastAPI + Python]
   ├── /upload  → ingest PDFs, extract text, chunk, embed
   ├── /query   → retrieve top-k chunks, synthesize via LLM
   └── /llm-router → dynamic model selection & fallback
       ├── Groq  → llama-3.3-70b / mixtral-8x7b
       └── OpenRouter → DeepSeek / Qwen / Gemma models
```

**Data pipeline**

1. Upload document → embeddings generated with `sentence-transformers`.
2. Chunks stored in **FAISS** vector store.
3. Query → embedding → similarity search → context prompt → LLM synthesis.
4. Answer returned to the frontend for display.

---

## 🧩 Tech Stack

| Layer      | Technology                                                               |
| ---------- | ------------------------------------------------------------------------ |
| Frontend   | React, TypeScript, Vite, Tailwind, shadcn-ui                             |
| Backend    | Python, FastAPI                                                          |
| Vector DB  | FAISS                                                                    |
| Embeddings | Sentence Transformers                                                    |
| LLMs       | Groq (LLaMA 3.3 70B / Mixtral 8×7B), OpenRouter (DeepSeek Qwen 8B, etc.) |
| Deployment | Vercel / Render / Railway                                                |
| Other      | dotenv, pdfplumber, LangChain                                            |

---

## ⚙️ Setup & Development

### Prerequisites

* Node 18+ and npm / bun
* Python 3.10+
* API keys for Groq / OpenRouter

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🔑 Environment Variables

Create a `.env` in `backend/`:

```
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
EMBEDDING_MODEL=all-MiniLM-L6-v2
FAISS_DIR=./data/faiss_index
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🧠 API Endpoints

### `POST /upload`

Uploads a document and indexes it.

```json
{ "message": "Document indexed successfully", "chunks": 120 }
```

### `POST /query`

Queries the knowledge base.

```json
{
  "query": "Summarize the uploaded research paper.",
  "model": "groq-mixtral"
}
```

Response:

```json
{
  "answer": "The paper explores...",
  "model_used": "groq-mixtral"
}
```

---

## 🛠️ Deployment

### Option 1 — Render / Railway

1. Push this repo to GitHub.
2. Create a new web service.
3. Build command:

   * Backend → `pip install -r requirements.txt`
   * Frontend → `npm install && npm run build`
4. Start command:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
5. Set environment variables in dashboard.

### Option 2 — Docker

```bash
docker build -t aethermind-explorer .
docker run -p 8000:8000 --env-file .env aethermind-explorer
```

### Option 3 — Vercel (frontend only)

Deploy frontend to Vercel, connect backend API endpoint (Render / Railway) via environment variable.

---

## 📦 Project Structure

```
AetherMind-Explorer/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── upload.py
│   │   │   └── query.py
│   │   └── core/
│   │       ├── pdf_utils.py
│   │       ├── embeddings_and_vectorstore.py
│   │       └── llm_router.py
│   ├── requirements.txt
│   └── .env.example
├── src/ (React frontend)
│   ├── components/
│   ├── pages/
│   └── App.tsx
├── public/
└── package.json
```

---

## 📅 Current Progress

✅ Frontend UI scaffolded with Lovable
✅ Backend base with FastAPI + routes
✅ FAISS / embeddings integration (prototype)
🚧 LLM router integration (needs model update to Groq `llama-3.3-70b` or OpenRouter DeepSeek)
🚧 Connection between frontend ↔ backend
🚧 Deployment pipeline setup
🚧 Error handling, logging, and citations

---

## 🧭 Next Steps

1. Finalize Groq & OpenRouter model keys and routing logic.
2. Test upload and query endpoints end-to-end.
3. Connect frontend to backend APIs.
4. Add streaming responses for better UX.
5. Implement persistent FAISS index.
6. Deploy full stack to Render / Vercel.

---

## 🧑‍💻 Contributors

* **Sovan Bhakta** — Project lead & developer
