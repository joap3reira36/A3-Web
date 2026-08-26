from flask import Blueprint, jsonify
from app.database import get_db_connection

users_bp = Blueprint ("user",__name__)

@users_bp.route("/users", methods=["GET"])
def list_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT IdUser, LoginUser, CreatedAt
            FROM Users
            ORDER BY IdUser
            """
        )

        rows = cursor.fetchall()

        usuarios = [
            {
                "id": row.IdUser,
                "login": row.LoginUser
            }
            for row in rows
        ]

        cursor.close()
        conn.close()

        return jsonify({
            "status": "sucesso",
            "usuarios": usuarios
        }), 200

    except Exception as erro:
        return jsonify({
            "status": "erro",
            "mensagem": str(erro)
        }), 500