from fastapi import APIRouter, UploadFile
from services.analyzer import analyze_logs

router = APIRouter()

@router.post("/upload")
async def upload_logs(file: UploadFile):
    content = await file.read()
    result = analyze_logs(content.decode())
    return result