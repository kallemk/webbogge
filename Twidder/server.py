from flask import request
from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from Twidder.functions import *


app = Flask(__name__, static_url_path='/static')
app.secret_key = "kallemarskit"

#TODO
##Array to store python dictionary. [{}], global
##Dictionary containing email and conn
##Signin socket (should check sign_out_socket)
##sign_out_socket where the row in the dictionary with certain email is removed
##Remove socket

@app.route('/')
@app.route('/index')
def index():
    return app.send_static_file('newclient.html')


@app.route('/sign_in', methods=['POST', 'GET'])
def server_sign_in():
    """Signs the user in"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        return sign_in(email, password)

    if request.environ.get('wsgi.websocket'):
        print("hej")
        ws = request.environ['wsgi.websocket']
        while True:
            message = ws.receive()
            print(message)
            ws.send(message)
    return


@app.route('/sign_up', methods=['POST'])
def server_sign_up():
    """Receives sing-in information and sends it to functions."""
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']
    return sign_up(email, password, firstname, familyname, gender, city, country)

@app.route('/sign_out', methods=['POST'])
def server_sign_out():
    """Receives the token for the user that will be signed out"""
    token = request.form['token']
    return sign_out(token)


@app.route('/change_password', methods=['POST'])
def server_change_password():
    """Receives a token, old password and new password.
    They are sent further to functions.py in order for the password to be changed."""
    old_pwd = request.form['old_pwd']
    new_pwd = request.form['new_pwd']
    token = request.form['token']
    return change_password(token, old_pwd, new_pwd)


@app.route('/get_user_by_token', methods=['POST'])
def server_get_user_by_token():
    token = request.form['token']
    return get_user_data_by_token(token)


@app.route('/get_user_by_email', methods=['POST'])
def server_get_user_by_email():
    token = request.form['token']
    email = request.form['email']
    return get_user_data_by_email(token, email)


@app.route('/post_message', methods=['POST'])
def server_post_message():
    token = request.form['token']
    message = request.form['message']
    email_wall = request.form['email_wall']
    return post_message(token, message, email_wall)


@app.route('/messages_by_email', methods=['POST'])
def server_messages_by_email():
    token = request.form['token']
    email = request.form['email']
    return messages_by_email(token, email)


@app.route('/messages_by_token', methods=['POST'])
def server_messages_by_token():
    token = request.form['token']
    return messages_by_token(token)


@app.route('/test')
def test_page():
    """This is used to test how simple things in flask an python works"""
    (a,b)=("Oskar","Norberg")
    return a + b


@app.route('/test_db')
def server_test_db():
    """Function for testing the communication between
    server.py-functions.py-database_helper.py"""
    (a,b)=("Oskar","Norberg")
    password_validation("aaaaa")
    return "check pycharm log"


@app.route('/init_db')
def server_init_db():
    """Function that inits the database"""
    init_db_function()
    return "A new database has been set up!"

@app.route('/get_sessions')
def server_get_sessions():
    """Function that returns the sessions"""
    return "get_sessions()"

@app.route('/clear_sessions')
def server_clear_sessions():
    """Function that clears the sessions"""
    #clear_sessions()
    return "A new database has been set up!"


if __name__ == "__main__":
    #app.run(debug=True)
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()