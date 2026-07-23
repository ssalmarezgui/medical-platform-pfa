from pydantic import BaseModel, Field


# La structure que Spring Boot va envoyer a FastAPI
class PatientDataInput(BaseModel):
    patient_data: str = Field(..., description="Le texte brut contenant tout le dossier médical du patient")


# La structure que FastAPI va renvoyer a Spring Boot
class AIResponse(BaseModel):
    result: str = Field(..., description="Le texte Markdown généré par l'IA local")
