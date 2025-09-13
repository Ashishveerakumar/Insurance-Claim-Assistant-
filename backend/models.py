from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/insurance_db")
MONGO_DB = os.getenv("MONGO_DB", "insurance_db")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

users = db["users"]
life_insurance_applications = db["life_insurance_applications"]
car_insurance_applications = db["car_insurance_applications"]