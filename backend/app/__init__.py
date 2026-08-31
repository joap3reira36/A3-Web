import os

from dotenv import load_dotenv

load_dotenv()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.auth import auth_bp
from app.users import users_bp


def create_app(test_config=None):
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    if test_config:
        app.config.update(test_config)

    if not app.config["JWT_SECRET_KEY"]:
        raise RuntimeError("JWT_SECRET_KEY não configurada")

    JWTManager(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return {
            "status": "ok"
        }, 200

    return app