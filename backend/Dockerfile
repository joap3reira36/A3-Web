# 1. Trava o Linux na versão Debian 11 (Bullseye) que é 100% compatível com a Microsoft
FROM python:3.9-slim-bullseye

# 2. Instala as ferramentas base
RUN apt-get update && apt-get install -y curl apt-transport-https gnupg2 unixodbc-dev

# 3. Baixa a chave da Microsoft usando o método moderno (gpg) em vez do obsoleto apt-key
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/microsoft-prod.gpg

# 4. Adiciona o repositório oficial da Microsoft
RUN curl -fsSL https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list

# 5. Instala o Driver ODBC 18
RUN apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18

# 6. Configura a pasta da aplicação
WORKDIR /app

# 7. Instala as bibliotecas do Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 8. Copia seus arquivos
COPY . .

# 9. Libera a porta e roda o app com Gunicorn
EXPOSE 5000
CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:5000"]
