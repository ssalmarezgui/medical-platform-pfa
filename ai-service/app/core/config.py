import os
from dotenv import load_dotenv


# charger les variables du fichier .env
load_dotenv()


class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "mistral")


settings = Settings()