import os
import pyodbc
from flask import Flask, jsonify, request
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)

DB_SERVER = os.environ.get('DB_SERVER') 
DB_NAME = "A3"                   
DB_USER = os.environ.get('DB_USER')                         
DB_PASS = os.environ.get('DB_PASS')

CONNECTION_STRING = f'DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={DB_SERVER};PORT=1433;DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASS};TrustServerCertificate=yes'

def get_db_connection(CONNECTION_STRING):
    conn = pyodbc.connect(CONNECTION_STRING)
    return conn

@app.route('/login', methods=['POST'])
def login():
    dados = request.get_json()

    if not dados or 'login' not in dados or 'senha' not in dados:
        return jsonify({"status": "erro", "mendagem": "Login e senha não estao no Bando de dados"})
    
    login_usuario = dados['login']
    senha_usaario = dados['senha']

    try:
        conn = get_db_connection(CONNECTION_STRING)
        cursor = conn.cursor()

        cursor.execute('''
            select IdUser, LoginUser
            from Users
            where LoginUser = ? and PasswordUser = ?               
        ''',(login_usuario, senha_usaario))
        row = cursor.fetchone()
        conn.close()

        if row:
            return jsonify({
                "status": "sucesso", 
                "mensagem": f"Bem-vindo, {row.LoginUser}! Login aprovado."    
            }), 200
        else:
            return jsonify({
                "status": "erro", 
                "mensagem": "Usuário ou senha inválidos."
            }), 401

    except Exception as e:
        return jsonify({"status": "erro_de_conexao", "detalhes": str(e)}), 500


@app.route('/register', methods=['POST'])
def register():
    dados = request.get_json()
    login_usuario = dados['login']
    senha_usuario = dados['senha']


    
    if not login_usuario or not senha_usuario:
        return jsonify({"status": "erro", "mensagem": "Login e senha são necessários"}), 400
    
    try:
        conn = get_db_connection(CONNECTION_STRING)
        cursor = conn.cursor()

        cursor.execute('select count(*) from Users where LoginUser = ?', (login_usuario,))
        existe = cursor.fetchone()[0]

        if existe > 0:
            return jsonify({"status":"erro", "mensagem":"Login ja existente"}), 409


        cursor.execute('''
            insert into Users
            values (?, ?)           
        ''', (login_usuario, senha_usuario))
        conn.commit()
        conn.close()

        
        return jsonify({
            "status": "sucesso", 
            "mensagem": f"Login {login_usuario} criado"    
        }), 201
    

    except Exception as e:
        return jsonify({"status": "erro_de_conexao", "detalhes": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    