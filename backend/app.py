import os
import re
import uuid
import logging
from datetime import timedelta
from flask import Flask, request, jsonify, Response
from flask_cors import CORS, cross_origin
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from pymongo import MongoClient, errors
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import gridfs

# ---------- Config ----------
load_dotenv()
MONGO_URI = "mongodb://127.0.0.1:27017/insurance_db"
MONGO_DB = os.getenv("MONGO_DB", "insurance_db")
JWT_SECRET = "your-super-secret-key-that-is-at-least-32-characters-long"
ACCESS_EXPIRES = int(os.getenv("JWT_ACCESS_EXPIRES", "3600"))
REFRESH_EXPIRES = int(os.getenv("JWT_REFRESH_EXPIRES", "2592000"))

# ---------- App ----------
app = Flask(__name__)

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO)
handler = logging.StreamHandler()
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config["JWT_SECRET_KEY"] = JWT_SECRET
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=ACCESS_EXPIRES)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(seconds=REFRESH_EXPIRES)
jwt = JWTManager(app)

# ---------- DB ----------
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
users = db["users"]
fs = gridfs.GridFS(db)  # GridFS instance for file storage

# Ensure unique index on email
try:
    users.create_index("email", unique=True)
except errors.PyMongoError as e:
    print("Index creation warning:", e)



# ---------- Routes ----------
from routes import api_bp

app.register_blueprint(api_bp, url_prefix='/api')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
