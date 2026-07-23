from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.api.endpoints import router as api_router
from app.core.config import settings

app = FastAPI(
    title="NephroCare AI Service",
    description="Microservice d'IA locale de génération de synthèses et rapports de néphrologie",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(api_router, prefix="/api/ai")

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "model": settings.LLM_MODEL,
        "ollama_url": settings.OLLAMA_BASE_URL
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)