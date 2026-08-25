import bcrypt
from flask import Blueprint, jsonify, request
from app.database import get_db_connection

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    dados = request.get_json()

    if not dados:
        return jsonify({
            "status": "erro",
            "mensagem": "Dados não enviados"
        }), 400

    login = dados.get("login")
    senha = dados.get("senha")

    if not login or not senha:
        return jsonify({
            "status": "erro",
            "mensagem": "Login e senha são obrigatórios"
        }), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT COUNT(*) FROM Users WHERE LoginUser = ?",
            (login,)
        )

        existe = cursor.fetchone()[0]

        if existe > 0:
            cursor.close()
            conn.close()

            return jsonify({
                "status": "erro",
                "mensagem": "Login já existente"
            }), 409

        senha_hash = bcrypt.hashpw(
            senha.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute(
            """
            INSERT INTO Users (LoginUser, PasswordUser)
            VALUES (?, ?)
            """,
            (login, senha_hash)
        )

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "status": "sucesso",
            "mensagem": "Usuário criado com sucesso"
        }), 201

    except Exception as erro:
        return jsonify({
            "status": "erro",
            "mensagem": str(erro)
        }), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()

    if not dados:
        return jsonify({
            "status": "erro",
            "mensagem": "Dados não enviados"
        }), 400

    login = dados.get("login")
    senha = dados.get("senha")

    if not login or not senha:
        return jsonify({
            "status": "erro",
            "mensagem": "Login e senha são obrigatórios"
        }), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT IdUser, LoginUser, PasswordUser
            FROM Users
            WHERE LoginUser = ?
            """,
            (login,)
        )

        usuario = cursor.fetchone()

        cursor.close()
        conn.close()

        if usuario is None:
            return jsonify({
                "status": "erro",
                "mensagem": "Usuário ou senha inválidos"
            }), 401

        senha_hash = usuario.PasswordUser

        senha_valida = bcrypt.checkpw(
            senha.encode("utf-8"),
            senha_hash.encode("utf-8")
        )

        if not senha_valida:
            return jsonify({
                "status": "erro",
                "mensagem": "Usuário ou senha inválidos"
            }), 401

        return jsonify({
            "status": "sucesso",
            "mensagem": f"Bem-vindo, {usuario.LoginUser}!"
        }), 200

    except Exception as erro:
        return jsonify({
            "status": "erro",
            "mensagem": str(erro)
        }), 500