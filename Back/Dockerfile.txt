# 1. Pega um Linux (Debian) com Python 3.9 já instalado
FROM python:3.9-slim

# 2. Instala as ferramentas de sistema necessárias
RUN apt-get update && apt-get install -y curl apt-transport-https gnupg2 unixodbc-dev

# 3. Baixa e instala o Driver ODBC 17 oficial da Microsoft para o Linux
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list
RUN apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql17

# 4. Cria uma pasta chamada /app dentro do servidor e entra nela
WORKDIR /app

# 5. Copia seus arquivos para dentro do servidor e instala o Flask e o pyodbc
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# 6. Libera a porta 5000 e roda o seu arquivo Python
EXPOSE 5000
CMD ["python", "app.py"]