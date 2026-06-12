from bson import ObjectId
from fastapi import APIRouter, HTTPException, UploadFile, File
from services.advanced_analyzer import ThreatAnalyzer
from services.save_analysis import save_analysis
from database.mongoDB import analysis_collection

router = APIRouter()


def normalize_logs(logs: str) -> str:
    normalized = "\n".join(
        [line.strip() for line in logs.replace("\r\n", "\n").split("\n") if line.strip()]
    )
    return normalized


@router.post("/upload")
async def upload_logs(file: UploadFile = File(...)):
    content = await file.read()
    raw_logs = content.decode("utf-8")
    print("Backend raw upload content:", repr(raw_logs))

    normalized_logs = normalize_logs(raw_logs)
    print("Backend normalized logs:", repr(normalized_logs))

    # Advanced threat analysis
    result = ThreatAnalyzer.analyze_logs(normalized_logs)

    # Save to MongoDB
    save_analysis(
        normalized_logs,
        result["threats"],
        result["risk_score"]
    )

    return result


@router.get("/history")
def get_history():
    history = []

    analyses = analysis_collection.find().sort("created_at", -1)

    for item in analyses:
        item["_id"] = str(item["_id"])
        history.append(item)

    return history


@router.delete("/history/{analysis_id}")
def delete_history(analysis_id: str):
    result = analysis_collection.delete_one({"_id": ObjectId(analysis_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {"deleted_id": analysis_id}