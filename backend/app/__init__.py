from flask import Flask
from flask_cors import CORS

from app.auth import auth_bp
from app.users import users_bp


def create_app():
    app = Flask(__name__)

    CORS(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return {
            "status": "ok"
        }, 200

    return app