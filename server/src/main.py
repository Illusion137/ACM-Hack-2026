from flask import Flask, jsonify, redirect, url_for, request, flash
from flask_login import (
    LoginManager, UserMixin, login_user,
    login_required, logout_user, current_user
)
from bson.objectid import ObjectId
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

app.key = "1qhnt8foapimokem1uybe"

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["my_database"]
users = db["users"]

# Configure Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

temp_passwords = {'Camden': "password", 'Daniel': "password"}


class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data["_id"])
        self.username = user_data["username"]

@login_manager.user_loader
def load_user(user_id):
    try:
        user_data = users.find_one({
            "_id": ObjectId(user_id)
        })

        if user_data:
            return User(user_data)

    except Exception:
        return None
    return None

def verify_password(user, password):
    return temp_passwords[user] == password 

@login_manager.user_loader
def load_user(user_id):
    return 

@app.route("/api/signup", methods=['POST'])
def signup():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400

    if users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409

    hashed_password = generate_password_hash(password)

    users.insert_one({
        "username": username,
        "password": hashed_password
    })

    return jsonify({"message": "Registration successful"}), 201

    

@app.route("/api/login", methods=['POST'])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    user_data = users.find_one({"username": username})

    if not user_data or not check_password_hash(
        user_data["password"], password
    ):
        return jsonify({"error": "Invalid username or password"}), 401

    user = User(user_data)

    login_user(user)

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username
        }
    }), 200

@app.route("/api/logout", methods=['POST'])
@login_required
def logout():
    logout_user()

    return jsonify({"message": "Logged out successfully"})

@app.route("/api/load-data", methods=['GET'])
@login_required
def load_data():
    pass

@app.route('/')
@login_required
def home():
    return jsonify({
        "authenticated": True,
        "user": {
            "id": current_user.id,
            "username": current_user.username
        }
    })

@app.route("/api/lesson", methods=['POST'])
@login_required
def lesson():
    pass

@app.route("/api/quiz", methods=['POST'])
@login_required
def quiz():
    pass

@app.route("/api/settings", methods=['POST'])
@login_required
def settings():
    pass

@app.route("/api/enroll", methods=['POST'])
@login_required
def enroll():
    pass

@app.route("/api/unenroll", methods=['POST'])
@login_required
def unenroll():
    pass


