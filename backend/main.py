from fastapi import FastAPI
from routes.log_routes import router

app = FastAPI()

app.include_router(router)

@app.get("/")
def home():
    return {"message": "CyberShield API running"}