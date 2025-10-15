from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.upload import router as upload_router
from .routes.query import router as query_router

app = FastAPI(title="Cogito-Flux FastAPI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(upload_router)
app.include_router(query_router)
