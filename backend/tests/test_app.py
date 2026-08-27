import bcrypt
import pytest

from datetime import datetime
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True

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

    assert response.status_code == 201
    assert response.get_json()["status"] == "sucesso"

    conn.commit.assert_called_once()


def test_register_usuario_duplicado(client):
    conn, cursor = criar_banco_fake()

    # 1 significa que já existe usuário
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

    assert response.status_code == 409
    assert response.get_json()["status"] == "erro"

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

    assert response.status_code == 200
    assert response.get_json()["status"] == "sucesso"


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

    assert response.status_code == 401
    assert response.get_json()["status"] == "erro"


# -----------------------
# USERS
# -----------------------

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
            CreatedAt=datetime(2026, 8, 26, 21, 00)
        )
    ]

    with patch(
        "app.users.get_db_connection",
        return_value=conn
    ):
        response = client.get("/users")

    dados = response.get_json()

    assert response.status_code == 200
    assert dados["status"] == "sucesso"
    assert len(dados["usuarios"]) == 2
    assert dados["usuarios"][0]["login"] == "joao"
    assert dados["usuarios"][1]["login"] == "maria"