import os
import requests
from dotenv import load_dotenv
from app.core.prompts import SYSTEM_SUMMARY_PROMPT, SYSTEM_REPORT_PROMPT

load_dotenv()

class LLMService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
        self.model = os.getenv("LLM_MODEL", "mistral")
        self.api_url = f"{self.base_url.rstrip('/')}/api/generate"

    def _query_ollama_local(self, system_prompt: str, patient_data: str, max_tokens: int) -> str:
        full_prompt = f"{system_prompt}\n\nDonnées cliniques réelles du patient :\n{patient_data}"

        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,  # Taille dynamique selon le besoin
                "temperature": 0.2
            }
        }

        headers = {
            "Content-Type": "application/json"
        }

        try:
            # Timeout généreux de 5 minutes pour laisser le temps au CPU d'écrire un long rapport
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=300) # 60*5
            
            if response.status_code == 200:
                result_json = response.json()
                return result_json.get("response", "Erreur : Réponse vide.")
            else:
                return f"Erreur Ollama (Code {response.status_code}) : {response.text}"
                
        except requests.exceptions.ConnectionError:
            return f"Impossible de contacter le serveur local Ollama sur {self.base_url}."
        except Exception as e:
            return f"Erreur lors de l'inférence : {str(e)}"

    # 1. Synthèse rapide : courte et concise (300 tokens ~ 180 mots)
    def generate_summary(self, patient_data: str) -> str:
        return self._query_ollama_local(SYSTEM_SUMMARY_PROMPT, patient_data, max_tokens=300)

    # 2. Rapport Officiel : long, riche et détaillé (750 tokens ~ 500 mots complets)
    def generate_report(self, patient_data: str) -> str:
        return self._query_ollama_local(SYSTEM_REPORT_PROMPT, patient_data, max_tokens=750)

llm_service = LLMService()