from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.log_routes import router as log_router
from routes.auth_routes import router as auth_router
from routes.analysis_routes import router as analysis_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(log_router)
app.include_router(auth_router)
app.include_router(analysis_router)

@app.get("/")
def home():
    return {"message": "CyberShield API running"}
