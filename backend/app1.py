import os
import pyodbc
from flask import Flask, jsonify
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)

DB_SERVER = os.environ.get('DB_SERVER') 
DB_NAME = os.environ.get('DB_NAME')                   
DB_USER = os.environ.get('DB_USER')                         
DB_PASS = os.environ.get('DB_PASS')

CONNECTION_STRING = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={DB_SERVER};PORT=1433;DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASS}'

def get_db_connection(CONNECTION_STRING):
    conn = pyodbc.connect(CONNECTION_STRING)
    return conn

@app.route('/')
def index():
    try:
        conn = get_db_connection(CONNECTION_STRING)
        cursor = conn.cursor()
        cursor.execute('select * from Logins')
        row = cursor.fetchone()
        conn.close

        if row:
            return jsonify({
                'status': 'sucesso',
                'mensagem_do_banco': row.Conteudo,
                'data_registro': row.Dataregistro.strftime('%Y-%m-%d %H:%M:%S')
            })
        else:
            return jsonify({"status": "sucesso", "mensagem": "Banco conectado, mas tabela vazia."})
    
    except Exception as e:
        return jsonify({"status": "erro_de_conexao", "detalhes": str(e)})

if __name__ == '__main__':
    # Roda o servidor web na porta 5000
    app.run(host='0.0.0.0', port=5000)

    