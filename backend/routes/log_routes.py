from fastapi import APIRouter, UploadFile, File
from services.analyzer import analyze_logs
from services.save_analysis import save_analysis

router = APIRouter()

@router.post("/upload")
async def upload_logs(file: UploadFile = File(...)):

    content = await file.read()
    logs = content.decode("utf-8")

    # Analyse des logs
    result = analyze_logs(logs)

    # Save to MongoDB
    save_analysis(
        logs,
        result["threats"],
        result["risk_score"]
    )

    return result