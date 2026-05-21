from database.mongoDB import analysis_collection
from datetime import datetime

def save_analysis(logs, threats, risk_score):

    data = {
        "logs": logs,
        "threats": threats,
        "risk_score": risk_score,
        "created_at": datetime.utcnow()
    }

    analysis_collection.insert_one(data)