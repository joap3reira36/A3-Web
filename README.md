# Backend API — Python + Flask + SQL Server

API REST desenvolvida em **Python** com **Flask** e integrada ao **Microsoft SQL Server**. Este repositório serve como projeto de estudo e portfólio para práticas de desenvolvimento backend, configuração por variáveis de ambiente, conteinerização e integração com banco de dados.

---

## 🚀 Tecnologias

![Python](https://img.shields.io/badge/Python-3.9-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC292B?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Principais dependências:

- Python 3.9
- Flask
- pyodbc
- ODBC Driver 18 for SQL Server
- python-dotenv
- Flask-CORS
- Gunicorn

---

## ✨ Visão geral

A API expõe endpoints para cadastro e autenticação de usuários, listagem e verificação de saúde da aplicação. A comunicação com o banco é feita com queries parametrizadas via pyodbc. O ambiente de banco pode ser executado localmente usando Docker Compose (SQL Server 2022).

---

## 🔌 Endpoints

| Método | Endpoint    | Descrição                            |
| ------ | ----------- | ------------------------------------ |
| `GET`  | `/health`   | Verifica se a API está funcionando   |
| `GET`  | `/db-test`  | Testa a conexão com o SQL Server     |
| `GET`  | `/users`    | Retorna os usuários cadastrados      |
| `POST` | `/register` | Cadastra um novo usuário             |
| `POST` | `/login`    | Realiza a autenticação de um usuário |

---

## 📥 Cadastro de usuário — POST /register

Exemplo de requisição:

```json
{
  "login": "joao",
  "senha": "minha_senha"
}
```

Respostas possíveis:

Sucesso (201):

```json
{
  "status": "sucesso",
  "mensagem": "Login joao criado"
}
```

Login já existente (409):

```json
{
  "status": "erro",
  "mensagem": "Login ja existente"
}
```

Requisição inválida (400)

---

## 🔐 Login — POST /login

Exemplo de requisição:

```json
{
  "login": "joao",
  "senha": "minha_senha"
}
```

Sucesso:

```json
{
  "status": "sucesso",
  "mensagem": "Bem-vindo, joao! Login aprovado."
}
```

Credenciais inválidas:

```json
{
  "status": "erro",
  "mensagem": "Usuário ou senha inválidos."
}
```

---

## 🔎 Health check

A rota `GET /health` retorna status da aplicação e é indicada para verificações de uptime e readiness.

---

## ⚙️ Variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` com as configurações do banco:

```env
DB_SERVER=localhost
DB_NAME=seu_banco
DB_USER=sa
DB_PASS=sua_senha
```

Nunca comite ou publique o arquivo `.env` com credenciais reais.

---

## 🐳 SQL Server com Docker Compose

Dentro da pasta `backend`, inicie o ambiente:

```bash
docker compose up -d
```

O SQL Server ficará disponível na porta `1433`. Os dados são persistidos via Docker Volume.

Verificar containers:

```bash
docker ps
```

Parar o ambiente:

```bash
docker compose down
```

---

## 🐍 Executando a API localmente

Clone o repositório e entre na pasta do backend:

```bash
git clone https://github.com/joap3reira36/Backend-API.git
cd Backend-API/backend
```

Crie e ative um ambiente virtual:

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate
```

Instale dependências:

```bash
pip install -r requirements.txt
```

Configure o `.env` e execute:

```bash
python app1.py
```

A aplicação estará em `http://localhost:5000`.

---

## 🐳 Executando com Docker

Build da imagem:

```bash
docker build -t backend-api .
```

Executar o container:

```bash
docker run -p 5000:5000 --env-file .env backend-api
```

---

## 📁 Estrutura do projeto

```text
Backend-API/
│
├── backend/
│   ├── app1.py
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── .gitignore
│
└── README.md
```

---

## 🔒 Segurança

Esta versão é para estudo. Melhorias planejadas (prioridade alta):

- Hash de senhas com `bcrypt` (remover armazenamento em texto plano)
- Validações de entrada mais rigorosas
- Tratamento e reaproveitamento de conexões com o banco
- Separação da aplicação em módulos e rotas
- Autenticação baseada em tokens (JWT)

---

## 🗺️ Roadmap

- [x] API Flask
- [x] Integração com SQL Server
- [x] Variáveis de ambiente
- [x] Cadastro e login de usuários
- [x] Listagem de usuários
- [x] Health check
- [x] Dockerfile
- [x] SQL Server com Docker Compose
- [x] Persistência com Docker Volume
- [ ] Hash de senhas com bcrypt
- [ ] Refatoração da estrutura do projeto
- [ ] Testes automatizados
- [ ] JWT
- [ ] Documentação Swagger / OpenAPI
- [ ] CI/CD com GitHub Actions

---

## 🎯 Objetivo

Evoluir a aplicação progressivamente aplicando conceitos usados em projetos reais: APIs, integração com bancos, Docker, segurança e organização de código.

---

## 👨‍💻 Autor

**João Vitor Pereira** — Backend & Database Developer

GitHub: [@joap3reira36](https://github.com/joap3reira36)
