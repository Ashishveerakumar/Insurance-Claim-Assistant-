from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import users, car_insurance_applications, db
from pymongo import errors
from bson.objectid import ObjectId
import re
import gridfs
import uuid
import requests

fs = gridfs.GridFS(db)

api_bp = Blueprint('api_bp', __name__)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def validate_registration(data):
    required = ["name", "email", "password"]
    for k in required:
        if k not in data or not str(data[k]).strip():
            return f"Missing field: {k}"
    if not EMAIL_RE.match(data["email"]):
        return "Invalid email format"
    if len(data["password"]) < 6:
        return "Password must be at least 6 characters"
    return None

def public_user(u):
    return {
        "id": str(u["_id"]),
        "name": u["name"],
        "email": u["email"],
        "role": u.get("role", "user"),
        "createdAt": u.get("createdAt")
    }

@api_bp.post("/auth/register")
def register():
    data = request.get_json(force=True, silent=True) or {}
    error = validate_registration(data)
    if error:
        return jsonify({"ok": False, "error": error}), 400

    name = data["name"].strip()
    email = data["email"].lower().strip()
    password_hash = generate_password_hash(data["password"])

    doc = {
        "name": name,
        "email": email,
        "passwordHash": password_hash,
        "role": "user"
    }

    try:
        users.insert_one(doc)
    except errors.DuplicateKeyError:
        return jsonify({"ok": False, "error": "Email already registered"}), 409

    access = create_access_token(identity=email)
    refresh = create_refresh_token(identity=email)
    return jsonify({
        "ok": True,
        "message": "Registration successful",
        "user": {"name": name, "email": email, "role": "user"},
        "tokens": {"access": access, "refresh": refresh}
    }), 201

@api_bp.post("/auth/login")
def login():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""

    u = users.find_one({"email": email})
    if not u or not check_password_hash(u["passwordHash"], password):
        return jsonify({"ok": False, "error": "Invalid email or password"}), 401

    access = create_access_token(identity=email)
    refresh = create_refresh_token(identity=email)
    return jsonify({
        "ok": True,
        "user": public_user(u),
        "tokens": {"access": access, "refresh": refresh}
    })

@api_bp.post("/auth/refresh")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access = create_access_token(identity=identity)
    return jsonify({"ok": True, "access": access})

@api_bp.get("/auth/me")
@jwt_required()
def me():
    identity = get_jwt_identity()
    u = users.find_one({"email": identity})
    if not u:
        return jsonify({"ok": False, "error": "User not found"}), 404
    return jsonify({"ok": True, "user": public_user(u)})

@api_bp.route("/car-insurance", methods=['POST', 'OPTIONS'])
def car_insurance_route():
    if request.method == 'OPTIONS':
        return "", 200
    return submit_car_insurance_post()

@jwt_required()
def submit_car_insurance_post():
    data = request.form.to_dict()
    identity_proof = request.files.get('identityProof')
    photograph = request.files.get('photograph')
    vehicle_rc_copy = request.files.get('vehicleRcCopy')

    required_fields = [
        'fullName', 'dateOfBirth', 'gender', 'contactNumber', 'emailAddress',
        'address', 'vehicleNumber', 'vehicleColour', 'fuelType'
    ]

    if not all(k in data for k in required_fields):
        return jsonify({"ok": False, "error": "Missing required text fields"}), 422
    
    if not identity_proof or not photograph or not vehicle_rc_copy:
        return jsonify({"ok": False, "error": "Missing required file uploads"}), 422

    identity_proof_id = fs.put(identity_proof, filename=identity_proof.filename, content_type=identity_proof.content_type)
    photograph_id = fs.put(photograph, filename=photograph.filename, content_type=photograph.content_type)
    vehicle_rc_copy_id = fs.put(vehicle_rc_copy, filename=vehicle_rc_copy.filename, content_type=vehicle_rc_copy.content_type)

    data['identityProof'] = str(identity_proof_id)
    data['photograph'] = str(photograph_id)
    data['vehicleRcCopy'] = str(vehicle_rc_copy_id)

    identity = get_jwt_identity()
    user = users.find_one({"email": identity})
    if not user:
        return jsonify({"ok": False, "error": "User not found"}), 404

    insurance_id = f"INS-{str(uuid.uuid4().hex)[:12].upper()}"

    application = {
        "userId": str(user['_id']),
        "userEmail": user['email'],
        "insuranceId": insurance_id,
        **data
    }

    result = car_insurance_applications.insert_one(application)

    return jsonify({
        "ok": True,
        "message": "Car insurance application submitted successfully",
        "application_id": str(result.inserted_id),
        "insuranceId": insurance_id
    }), 201

@api_bp.get("/my-plans")
@jwt_required()
def get_my_plans():
    try:
        identity = get_jwt_identity()
        current_app.logger.info(f"Attempting to get plans for user: {identity}")
        user = users.find_one({"email": identity})
        if not user:
            current_app.logger.warning(f"User not found for identity: {identity}")
            return jsonify({"ok": False, "error": "User not found"}), 404

        current_app.logger.info(f"User found: {user['email']}")
        applications = list(car_insurance_applications.find({"userId": str(user['_id'])}))
        current_app.logger.info(f"Found {len(applications)} applications for user {user['email']}")

        for app in applications:
            app['_id'] = str(app['_id'])

        return jsonify({"ok": True, "plans": applications}), 200
    except Exception as e:
        current_app.logger.error(f"An error occurred in get_my_plans: {e}", exc_info=True)
        return jsonify({'message': 'An error occurred', 'error': str(e)}), 500

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

@api_bp.route('/webhook-proxy', methods=['POST'])
def webhook_proxy():
    data = request.json
    logging.info(f"Received data for webhook: {data}")
    webhook_url = 'http://localhost:5678/webhook/65582ce6-27e2-403c-85c3-0e256f2972d1'

    try:
        response = requests.post(webhook_url, json=data, headers={'Content-Type': 'application/json'})
        response.raise_for_status()  # Raise an exception for bad status codes
        logging.info(f"Webhook response: {response.status_code} {response.text}")
        return jsonify(response.json()), response.status_code
    except requests.exceptions.RequestException as e:
        logging.error(f"Error forwarding to webhook: {e}")
        return jsonify({'error': str(e)}), 500

@api_bp.delete("/my-plans/<plan_id>")

@jwt_required()
def cancel_plan(plan_id):
    identity = get_jwt_identity()
    user = users.find_one({"email": identity})
    if not user:
        return jsonify({"ok": False, "error": "User not found"}), 404

    result = car_insurance_applications.delete_one({"_id": ObjectId(plan_id), "userId": str(user['_id'])})

    if result.deleted_count == 0:
        return jsonify({"ok": False, "error": "Plan not found or you do not have permission to cancel it"}), 404

    return jsonify({"ok": True, "message": "Plan cancelled successfully"}), 200