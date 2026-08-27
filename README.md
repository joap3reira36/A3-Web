# Backend API | Python + Flask + SQL Server

API REST desenvolvida em **Python** utilizando **Flask**, com integração ao **Microsoft SQL Server**.

O projeto foi desenvolvido com foco em conceitos utilizados em aplicações backend reais, incluindo autenticação segura, integração com banco de dados, organização modular, variáveis de ambiente, Docker e testes automatizados.

---

## 🚀 Tecnologias

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC292B?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### Principais tecnologias

- Python
- Flask
- Microsoft SQL Server
- pyodbc
- ODBC Driver 18 for SQL Server
- bcrypt
- pytest
- Docker
- Docker Compose
- Gunicorn
- python-dotenv
- Flask-CORS

---

## 📌 Funcionalidades

Atualmente a API possui:

- Health check da aplicação
- Cadastro de usuários
- Login de usuários
- Hash seguro de senhas utilizando `bcrypt`
- Validação de usuários duplicados
- Listagem de usuários cadastrados
- Retorno da data de criação dos usuários
- Queries parametrizadas com `pyodbc`
- Configuração através de variáveis de ambiente
- Organização da aplicação utilizando módulos e Blueprints
- Tratamento de erros e códigos HTTP
- SQL Server executado através de Docker Compose
- Persistência do banco utilizando Docker Volume
- Testes automatizados utilizando `pytest`
- Dockerfile preparado para execução da aplicação com Gunicorn

---

## 🔌 Endpoints

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica se a API está funcionando |
| `GET` | `/users` | Lista os usuários cadastrados |
| `POST` | `/register` | Cadastra um novo usuário |
| `POST` | `/login` | Realiza a autenticação de um usuário |

---

## 📥 Cadastro de usuário

### `POST /register`

Exemplo de requisição:

```json
{
  "login": "joao",
  "senha": "Teste123!"
}
```

Resposta em caso de sucesso:

```json
{
  "status": "sucesso",
  "mensagem": "Usuário criado com sucesso"
}
```

Status:

```text
201 Created
```

Caso o login já exista:

```json
{
  "status": "erro",
  "mensagem": "Login já existente"
}
```

Status:

```text
409 Conflict
```

Caso os dados obrigatórios não sejam enviados:

```text
400 Bad Request
```

---

## 🔐 Login

### `POST /login`

Exemplo:

```json
{
  "login": "joao",
  "senha": "Teste123!"
}
```

Em caso de sucesso:

```json
{
  "status": "sucesso",
  "mensagem": "Bem-vindo, joao!"
}
```

Status:

```text
200 OK
```

Caso o usuário não exista ou a senha esteja incorreta:

```json
{
  "status": "erro",
  "mensagem": "Usuário ou senha inválidos"
}
```

Status:

```text
401 Unauthorized
```

---

## 🔒 Armazenamento seguro de senhas

As senhas não são armazenadas em texto puro.

Durante o cadastro, a senha é transformada em um hash utilizando `bcrypt`:

```text
Senha
  ↓
bcrypt
  ↓
$2b$12$...
  ↓
SQL Server
```

Durante o login, a senha informada é comparada com o hash armazenado através do `bcrypt`.

Dessa forma, a senha original do usuário não precisa ser armazenada no banco.

---

## 👥 Listagem de usuários

### `GET /users`

A rota retorna os usuários cadastrados sem expor suas senhas ou hashes.

Exemplo:

```json
{
  "status": "sucesso",
  "usuarios": [
    {
      "id": 1,
      "login": "joao",
      "created_at": "2026-08-26T23:27:01.269539"
    }
  ]
}
```

A API retorna apenas informações públicas do usuário.

O campo `PasswordUser` não é enviado pela rota.

---

## 🔎 Health Check

### `GET /health`

Permite verificar se a aplicação está em execução.

Resposta:

```json
{
  "status": "ok"
}
```

Status:

```text
200 OK
```

---

## 🗄️ Banco de dados

O projeto utiliza **Microsoft SQL Server**.

Estrutura principal da tabela de usuários:

```sql
CREATE TABLE Users (
    IdUser INT IDENTITY(1,1) PRIMARY KEY,
    LoginUser VARCHAR(100) NOT NULL UNIQUE,
    PasswordUser VARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
```

### Campos

| Campo | Descrição |
| --- | --- |
| `IdUser` | Identificador único |
| `LoginUser` | Login do usuário |
| `PasswordUser` | Hash bcrypt da senha |
| `CreatedAt` | Data e hora de criação |

---

## 🛡️ Queries parametrizadas

As consultas SQL utilizam parâmetros através do `pyodbc`.

Exemplo:

```python
cursor.execute(
    "SELECT COUNT(*) FROM Users WHERE LoginUser = ?",
    (login,)
)
```

Essa abordagem evita concatenar diretamente valores recebidos pelo usuário nas consultas SQL.

---

## ⚙️ Variáveis de ambiente

As configurações do banco não ficam diretamente no código.

Crie um arquivo `.env` dentro da pasta `backend`:

```env
DB_SERVER=localhost
DB_NAME=A3
DB_USER=sa
DB_PASS=sua_senha
```

O arquivo `.env` deve permanecer no `.gitignore`.

> Nunca envie credenciais reais para o GitHub.

---

## 🐳 SQL Server com Docker

O ambiente de desenvolvimento utiliza um container com **SQL Server 2022**.

Dentro da pasta `backend`:

```bash
docker compose up -d
```

Verifique se o container está em execução:

```bash
docker ps
```

O SQL Server fica disponível através da porta:

```text
1433
```

Os dados são armazenados em um Docker Volume, permitindo manter os dados mesmo após o container ser recriado.

Para parar o ambiente:

```bash
docker compose down
```

---

## 🐍 Executando a API localmente

Clone o repositório:

```bash
git clone https://github.com/joap3reira36/Backend-API.git
```

Entre na pasta:

```bash
cd Backend-API/backend
```

Crie um ambiente virtual:

```bash
python -m venv .venv
```

### Linux

```bash
source .venv/bin/activate
```

### Windows

```bash
.venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Configure o `.env`.

Suba o SQL Server:

```bash
docker compose up -d
```

Execute a API:

```bash
python run.py
```

A aplicação ficará disponível em:

```text
http://localhost:5000
```

---

## 🧪 Testes automatizados

O projeto utiliza **pytest** para executar testes automatizados da API.

Atualmente existem testes para comportamentos básicos como:

- Health check
- Rejeição de cadastro sem dados
- Rejeição de login sem dados

Os testes utilizam o cliente de testes nativo do Flask.

Exemplo:

```python
def test_health():
    app = create_app()
    client = app.test_client()

    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"
```

Execute os testes com:

```bash
python -m pytest -v
```

Exemplo de resultado:

```text
test_health PASSED
test_register_sem_dados PASSED
test_login_sem_dados PASSED

3 passed
```

A cobertura de testes será expandida para incluir autenticação, usuários duplicados, senhas inválidas e listagem de usuários utilizando mocks.

---

## 🧩 Organização do projeto

A aplicação foi dividida em módulos para facilitar manutenção e evolução.

```text
Backend-API/
│
├── backend/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   └── users.py
│   │
│   ├── tests/
│   │   └── test_app.py
│   │
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── run.py
│
├── .gitignore
└── README.md
```

### Responsabilidades

```text
auth.py
├── /register
└── /login

users.py
└── /users

database.py
└── conexão SQL Server

__init__.py
├── criação da aplicação Flask
├── registro dos Blueprints
└── /health

run.py
└── inicialização da aplicação

tests/
└── testes automatizados
```

---

## 🐳 Dockerfile

O projeto também possui um `Dockerfile` preparado para execução da API utilizando:

- Python
- Debian
- Microsoft ODBC Driver 18
- Gunicorn
- Dependências Python

O ambiente atual de desenvolvimento executa o **SQL Server através do Docker Compose** e a API localmente.

A integração completa da API e do banco no mesmo ambiente Docker poderá ser adicionada futuramente.

---

## 🔒 Segurança

Medidas já implementadas:

- [x] Senhas protegidas com bcrypt
- [x] Senhas não armazenadas em texto puro
- [x] Queries parametrizadas
- [x] Credenciais através de variáveis de ambiente
- [x] `.env` ignorado pelo Git
- [x] Mensagem genérica para credenciais inválidas
- [x] Hash da senha não retornado pela API

Melhorias planejadas:

- JWT
- Proteção de endpoints
- Validações adicionais
- Melhor gerenciamento das conexões com o banco

---

## 🗺️ Roadmap

- [x] API Flask
- [x] Integração com SQL Server
- [x] Variáveis de ambiente
- [x] Cadastro de usuários
- [x] Login
- [x] Listagem de usuários
- [x] Data de criação dos usuários
- [x] Health check
- [x] Queries parametrizadas
- [x] Dockerfile
- [x] SQL Server com Docker Compose
- [x] Persistência utilizando Docker Volume
- [x] Hash de senhas com bcrypt
- [x] Estrutura modular
- [x] Separação de rotas com Blueprints
- [x] Testes automatizados iniciais com pytest
- [ ] Ampliar cobertura de testes com mocks
- [ ] JWT
- [ ] Proteger endpoints autenticados
- [ ] Documentação Swagger / OpenAPI
- [ ] CI/CD com GitHub Actions

---

## 🎯 Objetivo do projeto

Este projeto faz parte do meu portfólio de desenvolvimento com foco em **Backend e Banco de Dados**.

O objetivo é desenvolver uma API progressivamente, aplicando conceitos encontrados em aplicações reais, como:

- desenvolvimento de APIs REST
- autenticação
- segurança de senhas
- integração entre aplicação e banco de dados
- SQL Server
- Docker
- testes automatizados
- organização modular
- tratamento de erros
- boas práticas de desenvolvimento Python

---

## 👨‍💻 Autor

**João Vitor Pereira**

Backend & Database Developer

GitHub: [@joap3reira36](https://github.com/joap3reira36)