from fastapi import APIRouter, HTTPException
from app.models.schemas import PatientDataInput, AIResponse
from app.services.llm_service import llm_service

router = APIRouter()

@router.post("/summarize", response_model=AIResponse)
async def summarize_patient(payload: PatientDataInput):
    try:
        result_text = llm_service.generate_summary(payload.patient_data)
        return AIResponse(result=result_text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération du résumé clinique : {str(e)}"
        )
    


@router.post("/report", response_model=AIResponse)
async def generate_report(payload: PatientDataInput):
    try:
        result_text = llm_service.generate_report(payload.patient_data)
        return AIResponse(result=result_text)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erreur lors de la génération du rapport de synthèse : {str(e)}"
        )
