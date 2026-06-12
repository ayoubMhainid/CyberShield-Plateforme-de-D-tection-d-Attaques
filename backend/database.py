from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["cybershield"]

analyses_collection = db["analyses"]
attacks_collection = db["attacks"]
logs_collection = db["logs"]
users_collection = db["users"]

