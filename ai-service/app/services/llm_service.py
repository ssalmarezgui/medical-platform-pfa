import os
import requests
from dotenv import load_dotenv
from app.core.prompts import SYSTEM_SUMMARY_PROMPT, SYSTEM_REPORT_PROMPT

# Charger les variables d'environnement
load_dotenv()

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

    def _query_gemini_api(self, system_prompt: str, patient_data: str) -> str:
        if not self.api_key:
            return "Erreur : Clé d'API Google Gemini manquante dans votre fichier .env."

        # Fusionner les consignes de sécurité avec les données cliniques du patient
        full_prompt = f"{system_prompt}\n\nDonnées cliniques réelles du patient :\n{patient_data}"

        # Payload officiel requis par l'API Google Gemini
        payload = {
            "contents": [{
                "parts": [{
                    "text": full_prompt
                }]
            }]
        }

        # En-têtes requis contenant votre clé de type AQ.
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": self.api_key
        }

        try:
            # Appel sécurisé avec les en-têtes (headers)
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result_json = response.json()
                # Extraire le texte généré par l'IA
                candidates = result_json.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "Erreur de format de réponse de l'IA.")
                return str(result_json)
            else:
                return f"Erreur de l'API Google Gemini (Code {response.status_code}) : {response.text}"
                
        except Exception as e:
            return f"Impossible de contacter le serveur d'IA de Google : {str(e)}"

    def generate_summary(self, patient_data: str) -> str:
        return self._query_gemini_api(SYSTEM_SUMMARY_PROMPT, patient_data)

    def generate_report(self, patient_data: str) -> str:
        return self._query_gemini_api(SYSTEM_REPORT_PROMPT, patient_data)

# Instance du service d'IA
llm_service = LLMService()