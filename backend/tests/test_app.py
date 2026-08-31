import bcrypt
import pytest

from datetime import datetime
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from app import create_app
from flask_jwt_extended import create_access_token


@pytest.fixture
def client():
    app = create_app({
        "TESTING": True,
        "JWT_SECRET_KEY": "chave-secreta-apenas-para-testes"
    })

    return app.test_client()


def criar_banco_fake():
    conn = MagicMock()
    cursor = MagicMock()

    conn.cursor.return_value = cursor

    return conn, cursor


# -----------------------
# HEALTH
# -----------------------

def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


# -----------------------
# REGISTER
# -----------------------

def test_register_sem_dados(client):
    response = client.post(
        "/register",
        json={}
    )

    assert response.status_code == 400


def test_register_usuario(client):
    conn, cursor = criar_banco_fake()

    # 0 significa que o usuário ainda não existe
    cursor.fetchone.return_value = (0,)

    with patch(
        "app.auth.get_db_connection",
        return_value=conn
    ):
        response = client.post(
            "/register",
            json={
                "login": "teste",
                "senha": "123456"
            }
        )

    dados = response.get_json()

    assert response.status_code == 201
    assert dados["status"] == "sucesso"

    conn.commit.assert_called_once()


def test_register_usuario_duplicado(client):
    conn, cursor = criar_banco_fake()

    # 1 significa que o usuário já existe
    cursor.fetchone.return_value = (1,)

    with patch(
        "app.auth.get_db_connection",
        return_value=conn
    ):
        response = client.post(
            "/register",
            json={
                "login": "teste",
                "senha": "123456"
            }
        )

    dados = response.get_json()

    assert response.status_code == 409
    assert dados["status"] == "erro"

    conn.commit.assert_not_called()


# -----------------------
# LOGIN
# -----------------------

def test_login_sem_dados(client):
    response = client.post(
        "/login",
        json={}
    )

    assert response.status_code == 400


def test_login_correto(client):
    conn, cursor = criar_banco_fake()

    senha_hash = bcrypt.hashpw(
        b"123456",
        bcrypt.gensalt()
    ).decode("utf-8")

    usuario_fake = SimpleNamespace(
        IdUser=1,
        LoginUser="teste",
        PasswordUser=senha_hash
    )

    cursor.fetchone.return_value = usuario_fake

    with patch(
        "app.auth.get_db_connection",
        return_value=conn
    ):
        response = client.post(
            "/login",
            json={
                "login": "teste",
                "senha": "123456"
            }
        )

    dados = response.get_json()

    assert response.status_code == 200
    assert dados["status"] == "sucesso"
    assert "access_token" in dados


def test_login_senha_errada(client):
    conn, cursor = criar_banco_fake()

    senha_hash = bcrypt.hashpw(
        b"123456",
        bcrypt.gensalt()
    ).decode("utf-8")

    usuario_fake = SimpleNamespace(
        IdUser=1,
        LoginUser="teste",
        PasswordUser=senha_hash
    )

    cursor.fetchone.return_value = usuario_fake

    with patch(
        "app.auth.get_db_connection",
        return_value=conn
    ):
        response = client.post(
            "/login",
            json={
                "login": "teste",
                "senha": "senha_errada"
            }
        )

    dados = response.get_json()

    assert response.status_code == 401
    assert dados["status"] == "erro"


# -----------------------
# USERS
# -----------------------

def test_users_sem_token(client):
    response = client.get("/users")

    assert response.status_code == 401


def test_listar_usuarios(client):
    conn, cursor = criar_banco_fake()

    cursor.fetchall.return_value = [
        SimpleNamespace(
            IdUser=1,
            LoginUser="joao",
            CreatedAt=datetime(2026, 8, 26, 20, 30)
        ),
        SimpleNamespace(
            IdUser=2,
            LoginUser="maria",
            CreatedAt=datetime(2026, 8, 26, 21, 0)
        )
    ]

    with client.application.app_context():
        token = create_access_token(
            identity="1",
            additional_claims={
                "login": "joao"
            }
        )

    with patch(
        "app.users.get_db_connection",
        return_value=conn
    ):
        response = client.get(
            "/users",
            headers={
                "Authorization": f"Bearer {token}"
            }
        )

    dados = response.get_json()

    assert response.status_code == 200
    assert dados["status"] == "sucesso"
    assert len(dados["usuarios"]) == 2
    assert dados["usuarios"][0]["login"] == "joao"
    assert dados["usuarios"][1]["login"] == "maria"