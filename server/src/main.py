import copy
import os
import uuid
from datetime import timedelta

from flask import Flask, jsonify, request
from flask_login import (
    LoginManager, UserMixin, login_user,
    login_required, logout_user, current_user
)
from bson.objectid import ObjectId
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import data as course_data

app = Flask(__name__, static_folder=None)

app.secret_key = os.environ["SECRET_KEY"]
secure_cookies = os.environ.get("COOKIE_SECURE", "1") == "1"
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=secure_cookies,
    REMEMBER_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_SAMESITE="Lax",
    REMEMBER_COOKIE_SECURE=secure_cookies,
    REMEMBER_COOKIE_DURATION=timedelta(days=30),
)

# MongoDB connection
client = MongoClient(os.environ.get("MONGO_URI", "mongodb://localhost:27017/"))
db = client[os.environ.get("MONGO_DB", "my_database")]
users = db["users"]
users.create_index("email", unique=True, sparse=True)

# Configure Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

MIN_PASSWORD_LENGTH = 8

UPLOAD_DIR = os.environ.get(
    "UPLOAD_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads"),
)
AVATAR_URL_PREFIX = "/avatars/"
MAX_AVATAR_BYTES = 5 * 1024 * 1024
IMAGE_TYPES = {"Default", "Dogs", "Cats", "Birds", "Bnnuy", "CatnBunny"}

def image_extension(data):
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


'''
    Data format:

    {_id, name, email, password, avatar, darkmode, imageType, bio, links, courses = {
        "<course id>": {quiz_score, completed_lessons = {"<lesson id>": points}}
    }}

    Courses come from data.py; a user's entry in `courses` means they are enrolled.
'''


def default_progress():
    progress = {}
    for course in course_data.courses:
        if course.get("enrolled"):
            progress[str(course["id"])] = {
                "quiz_score": course["quiz"].get("completed_points"),
                "completed_lessons": {
                    str(l["id"]): l["completed_points"] for l in course["lessons"] if l.get("completed")
                },
            }
    return progress


def find_course(course_id):
    return next((c for c in course_data.courses if c["id"] == course_id), None)


def course_for_user(course, progress):
    course = copy.deepcopy(course)
    entry = progress.get(str(course["id"]))
    completed = (entry or {}).get("completed_lessons", {})
    course["enrolled"] = entry is not None
    for lesson in course["lessons"]:
        points = completed.get(str(lesson["id"]))
        lesson["completed"] = points is not None
        lesson["completed_points"] = points or 0
    course["quiz"]["completed_points"] = (entry or {}).get("quiz_score")
    return course


def user_progress(user_data):
    progress = user_data.get("courses")
    if progress is None:
        progress = default_progress()
        users.update_one({"_id": user_data["_id"]}, {"$set": {"courses": progress}})
    return progress


def course_response(course_id):
    user_data = users.find_one({"_id": ObjectId(current_user.id)})
    return jsonify({"course": course_for_user(find_course(course_id), user_progress(user_data))})


def requested_course():
    data = request.get_json(silent=True) or {}
    course = find_course(data.get("course"))
    return data, course


class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data["_id"])
        self.data = user_data

    def to_json(self):
        return {
            "id": self.id,
            "name": self.data.get("name", ""),
            "email": self.data.get("email", ""),
            "avatar": self.data.get("avatar", ""),
            "darkmode": self.data.get("darkmode", False),
            "imageType": self.data.get("imageType", "Default"),
            "bio": self.data.get("bio"),
            "links": self.data.get("links", []),
        }


@login_manager.user_loader
def load_user(user_id):
    try:
        user_data = users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None
    return User(user_data) if user_data else None


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Not logged in"}), 401


def normalize_email(email):
    return (email or "").strip().lower()


def password_matches(user_data, password):
    return bool(password) and check_password_hash(user_data["password"], password)


@app.route("/api/signup", methods=['POST'])
def signup():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = normalize_email(data.get("email"))
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400

    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"Password must be at least {MIN_PASSWORD_LENGTH} characters"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "An account with that email already exists"}), 409

    user_data = {
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "avatar": "",
        "darkmode": False,
        "imageType": "Default",
        "courses": default_progress(),
    }
    user_data["_id"] = users.insert_one(user_data).inserted_id

    user = User(user_data)
    login_user(user, remember=True)

    return jsonify({"user": user.to_json()}), 201


@app.route("/api/login", methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}

    email = normalize_email(data.get("email"))
    password = data.get("password") or ""

    user_data = users.find_one({"email": email})

    if not user_data or not password_matches(user_data, password):
        return jsonify({"error": "Invalid email or password"}), 401

    user = User(user_data)
    login_user(user, remember=True)

    return jsonify({"user": user.to_json()}), 200


@app.route("/api/logout", methods=['POST'])
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})


@app.route("/api/load-data", methods=['GET'])
@login_required
def load_data():
    progress = user_progress(current_user.data)
    return jsonify({
        "user": current_user.to_json(),
        "courses": [course_for_user(c, progress) for c in course_data.courses],
        "announcements": course_data.announcements,
    })


@app.route("/api/lesson", methods=['POST'])
@login_required
def lesson():
    data, course = requested_course()
    if not course:
        return jsonify({"error": "Unknown course"}), 404
    lesson = next((l for l in course["lessons"] if l["id"] == data.get("lesson")), None)
    if not lesson:
        return jsonify({"error": "Unknown lesson"}), 404
    if str(course["id"]) not in user_progress(current_user.data):
        return jsonify({"error": "Not enrolled in this course"}), 403

    users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {f"courses.{course['id']}.completed_lessons.{lesson['id']}": lesson["points"]}}
    )
    return course_response(course["id"])


@app.route("/api/quiz", methods=['POST'])
@login_required
def quiz():
    data, course = requested_course()
    if not course:
        return jsonify({"error": "Unknown course"}), 404
    if str(course["id"]) not in user_progress(current_user.data):
        return jsonify({"error": "Not enrolled in this course"}), 403

    max_points = sum(q["points"] for q in course["quiz"]["questions"])
    try:
        points = max(0, min(int(data.get("points", 0)), max_points))
    except (TypeError, ValueError):
        return jsonify({"error": "Points must be a number"}), 400

    users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {f"courses.{course['id']}.quiz_score": points}}
    )
    return course_response(course["id"])


@app.route("/api/settings", methods=['POST'])
@login_required
def settings():
    data = request.get_json(silent=True) or {}
    updates = {}

    if "darkmode" in data:
        updates["darkmode"] = bool(data["darkmode"])

    if "imageType" in data:
        if data["imageType"] not in IMAGE_TYPES:
            return jsonify({"error": "Unknown image type"}), 400
        updates["imageType"] = data["imageType"]

    needs_password = bool(data.get("purge"))
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name is required"}), 400
        if name != current_user.data.get("name"):
            updates["name"] = name
            needs_password = True
    if "email" in data:
        email = normalize_email(data.get("email"))
        if not email:
            return jsonify({"error": "Email is required"}), 400
        if email != current_user.data.get("email"):
            if users.find_one({"email": email}):
                return jsonify({"error": "An account with that email already exists"}), 409
            updates["email"] = email
            needs_password = True

    if needs_password and not password_matches(current_user.data, data.get("password")):
        return jsonify({"error": "Incorrect password"}), 403

    if data.get("purge"):
        updates["courses"] = {}

    if updates:
        users.update_one({"_id": ObjectId(current_user.id)}, {"$set": updates})

    user_data = users.find_one({"_id": ObjectId(current_user.id)})
    return jsonify({
        "user": User(user_data).to_json(),
        "courses": [course_for_user(c, user_progress(user_data)) for c in course_data.courses],
    })


@app.route("/api/enroll", methods=['POST'])
@login_required
def enroll():
    _, course = requested_course()
    if not course:
        return jsonify({"error": "Unknown course"}), 404

    users.update_one(
        {"_id": ObjectId(current_user.id), f"courses.{course['id']}": {"$exists": False}},
        {"$set": {f"courses.{course['id']}": {"quiz_score": None, "completed_lessons": {}}}}
    )
    return course_response(course["id"])


@app.route("/api/unenroll", methods=['POST'])
@login_required
def unenroll():
    _, course = requested_course()
    if not course:
        return jsonify({"error": "Unknown course"}), 404

    users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$unset": {f"courses.{course['id']}": ""}}
    )
    return course_response(course["id"])


@app.route("/api/upload-avatar", methods=["POST"])
@login_required
def save_avatar():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    data = file.read(MAX_AVATAR_BYTES + 1)
    if len(data) > MAX_AVATAR_BYTES:
        return jsonify({"error": "Image must be under 5 MB"}), 413

    ext = image_extension(data)
    if not ext:
        return jsonify({"error": "Image must be PNG, JPEG, GIF or WebP"}), 400

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{current_user.id}-{uuid.uuid4().hex}.{ext}"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(data)

    old_avatar = current_user.data.get("avatar", "")
    if old_avatar.startswith(AVATAR_URL_PREFIX):
        old_path = os.path.join(UPLOAD_DIR, os.path.basename(old_avatar))
        if os.path.isfile(old_path):
            os.remove(old_path)

    image_url = AVATAR_URL_PREFIX + filename
    users.update_one({"_id": ObjectId(current_user.id)}, {"$set": {"avatar": image_url}})

    return jsonify({"url": image_url}), 201
