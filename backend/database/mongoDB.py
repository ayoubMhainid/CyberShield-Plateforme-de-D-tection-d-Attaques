from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017"

client = MongoClient(MONGO_URL)

db = client["cybershield"]

analyses_collection = db["analyses"]
analysis_collection = db["analyses"]

url_collection = db["url_analyses"]
ip_collection = db["ip_analyses"]
hash_collection = db["hash_lookups"]

attacks_collection = db["attacks"]
logs_collection = db["logs"]
users_collection = db["users"]