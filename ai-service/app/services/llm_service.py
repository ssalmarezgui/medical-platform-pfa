from langchain_community.llms import Ollama
from app.core.config import settings
from app.core.prompts import SYSTEM_SUMMARY_PROMPT, SYSTEM_REPORT_PROMPT

class LLMService:
    def __init__(self):
        # Connexion locale à l'instance Ollama
        # La température est réglée très basse (0.1) pour forcer le modèle à être
        # extrêmement factuel et éviter toute "créativité" ou hallucination médicale.

        self.llm = Ollama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.LLM_MODEL,
            temperature=0.1
        )

    def generate_summary(self, patient_data: str) -> str:
        # Fusionner le System Prompt avec les données du patient
        prompt = f"{SYSTEM_SUMMARY_PROMPT}\n\nDonnées du patient :\n{patient_data}\n\nVotre synthèse médicale :"
        # Appel du modèle local Ollama
        return self.llm.invoke(prompt)

    def generate_report(self, patient_data: str) -> str:
        # Fusionner le System Prompt avec les données du patient
        prompt = f"{SYSTEM_REPORT_PROMPT}\n\nDonnées du patient :\n{patient_data}\n\nVotre rapport officiel :"
        # Appel du modèle local Ollama
        return self.llm.invoke(prompt)

# Instance unique du service d'IA pour toute l'application
llm_service = LLMService()
    