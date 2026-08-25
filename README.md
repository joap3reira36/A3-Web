# Backend API | Python + Flask + SQL Server

API REST desenvolvida em **Python** com **Flask** e integração com **Microsoft SQL Server**.

O projeto tem como objetivo praticar e demonstrar conceitos de desenvolvimento backend, integração com banco de dados, criação de endpoints REST, configuração por variáveis de ambiente e uso de Docker.

---

## 🚀 Tecnologias

![Python](https://img.shields.io/badge/Python-3.9-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC292B?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### Principais tecnologias

- Python
- Flask
- Microsoft SQL Server
- pyodbc
- ODBC Driver 18 for SQL Server
- Docker
- Docker Compose
- Gunicorn
- python-dotenv
- Flask-CORS

---

## 📌 Funcionalidades

Atualmente a API possui:

- Health check da aplicação
- Teste de conexão com o SQL Server
- Listagem de usuários
- Cadastro de usuários
- Login de usuários
- Validação de usuários duplicados
- Comunicação com SQL Server utilizando queries parametrizadas
- Configuração do banco através de variáveis de ambiente
- Execução da aplicação com Gunicorn
- Ambiente SQL Server utilizando Docker Compose
- Persistência dos dados do SQL Server através de Docker Volume

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

## 📥 Cadastro de usuário

### `POST /register`

Exemplo de requisição:

```json
{
  "login": "joao",
  "senha": "minha_senha"
}
```

Exemplo de resposta:

```json
{
  "status": "sucesso",
  "mensagem": "Login joao criado"
}
```

Caso o login já exista:

```json
{
  "status": "erro",
  "mensagem": "Login ja existente"
}
```

Status HTTP:

```text
201 Created
409 Conflict
400 Bad Request
```

---

## 🔐 Login

### `POST /login`

Exemplo:

```json
{
  "login": "joao",
  "senha": "minha_senha"
}
```

Em caso de sucesso:

```json
{
  "status": "sucesso",
  "mensagem": "Bem-vindo, joao! Login aprovado."
}
```

Caso as credenciais sejam inválidas:

```json
{
  "status": "erro",
  "mensagem": "Usuário ou senha inválidos."
}
```

---

## 🔎 Health check

A rota `GET /health` verifica se a API está funcionando corretamente.

---

## ⚙️ Variáveis de ambiente

As credenciais e configurações do banco de dados não ficam diretamente no código.

Crie um arquivo `.env` dentro da pasta `backend`:

```env
DB_SERVER=localhost
DB_NAME=seu_banco
DB_USER=sa
DB_PASS=sua_senha
```

> Nunca envie o arquivo `.env` com credenciais reais para o GitHub.

---

## 🐳 SQL Server com Docker Compose

O projeto possui um `docker-compose.yml` para criação de uma instância local do **SQL Server 2022**.

Dentro da pasta `backend`, execute:

```bash
docker compose up -d
```

O SQL Server ficará disponível na porta:

```text
1433
```

Os dados do banco são armazenados em um Docker Volume para que não sejam perdidos quando o container for recriado.

Para verificar os containers:

```bash
docker ps
```

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

### Windows

```bash
.venv\Scripts\activate
```

### Linux

```bash
source .venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Configure o arquivo `.env` e execute:

```bash
python app1.py
```

A API será iniciada em:

```text
http://localhost:5000
```

---

## 🐳 Executando a API com Docker

O projeto possui um `Dockerfile` preparado com:

- Python 3.9
- Debian Bullseye
- Microsoft ODBC Driver 18
- Gunicorn
- Dependências Python da aplicação

Para construir a imagem:

```bash
docker build -t backend-api .
```

Para executar:

```bash
docker run -p 5000:5000 --env-file .env backend-api
```

---

## 📁 Estrutura

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

O projeto está em desenvolvimento e a autenticação ainda será aprimorada.

As próximas alterações incluem:

- Hash de senhas utilizando `bcrypt`
- Remoção do armazenamento de senhas em texto puro
- Validações adicionais de entrada
- Melhor tratamento de conexões com banco
- Separação da aplicação em módulos
- Autenticação baseada em tokens

> A versão atual é utilizada como ambiente de estudo e evolução de conceitos de backend e banco de dados.

---

## 🗺️ Roadmap

- [x] API Flask
- [x] Integração com SQL Server
- [x] Variáveis de ambiente
- [x] Cadastro de usuários
- [x] Login
- [x] Listagem de usuários
- [x] Health check
- [x] Dockerfile
- [x] SQL Server com Docker Compose
- [x] Persistência utilizando Docker Volume
- [x] Hash de senhas com bcrypt
- [x] Refatoração da estrutura do projeto
- [x] Separação de rotas
- [ ] Testes automatizados
- [ ] JWT
- [ ] Documentação Swagger / OpenAPI
- [ ] CI/CD com GitHub Actions

---

## 🎯 Objetivo do projeto

Este projeto faz parte do meu portfólio de estudos e desenvolvimento na área de **Backend e Banco de Dados**.

O objetivo é evoluir a aplicação progressivamente, aplicando conceitos utilizados em projetos reais, principalmente:

- desenvolvimento de APIs
- integração entre aplicações e bancos de dados
- SQL Server
- segurança de aplicações
- Docker
- organização e manutenção de código

---

## 👨‍💻 Autor

**João Vitor Pereira**

Backend & Database Developer

GitHub: [@joap3reira36](https://github.com/joap3reira36)
