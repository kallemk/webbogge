from flask import request
from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from Twidder.functions import *
import os
import json

PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))

app = Flask(__name__, static_url_path='/static')
app.secret_key = "nEOppiika4ucIcfhxEFFdR6NLJfp2qSj"

#list to store connected users
socket_storage = []


@app.route('/')
@app.route('/index')
def index():
    """The file that is rendered then the app is starting"""
    return app.send_static_file('newclient.html')


""" The routes below that uses send_static_file makes it possible to refresh. """
@app.route('/home')
def home_tab():
    return app.send_static_file('newclient.html')


@app.route('/browse')
def browse_tab():
    return app.send_static_file('newclient.html')


@app.route('/account')
def account_tab():
    return app.send_static_file('newclient.html')


@app.route('/sign_in', methods=['POST', 'GET'])
def server_sign_in():
    """ The function signs in the user with the email and password.
     The connections are stored in the socket_storage variable.
     The functions for updating the live data are called"""
    """Signs the user in"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        return sign_in(email, password)

    """Handles the websocket connection when signing in"""
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while True:
            token = ws.receive()
            if token is not None:
                email = str(get_user_email_by_token(token))
                #Creates a dictionary item to put in the global list of connections
                connected_user = {'email': email, 'connection': ws, 'token': token}
                #The function below checks if there are other connections with the same email
                #and removes it if that is the case
                global socket_storage
                if check_socket_status(connected_user):
                    #Adds the signed in user to the list of connected users
                    socket_storage.append(connected_user)
                live_login(socket_storage)
                live_message(socket_storage)
        return ""

@app.route('/sign_up', methods=['POST'])
def server_sign_up():
    """Receives sign-up information and sends it to functions."""
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']
    response = sign_up(email, password, firstname, familyname, gender, city, country)
    global socket_storage
    live_login(socket_storage)
    return response

@app.route('/sign_out', methods=['POST'])
def server_sign_out():
    """Receives the token for the user that will be signed out"""
    if request.method == 'POST':
        token = request.form['token']
        email = str(get_user_email_by_token(token))
        connected_user = {'email': email, 'token': token}
        global socket_storage
        socket_storage = logout_socket(connected_user, socket_storage)
        response = sign_out(token)
        live_login(socket_storage)
        return response



def check_socket_status(connected_user):
    """The function checks for other connections with the same
    email, then if that's the case old connections are removed"""
    #A counter for the loop through the socket list
    #counter = 0
    global socket_storage
    for i in socket_storage:
        #Checks if the current position in the list matches the current user
        if i['email'] == connected_user.get('email'):
            if (connected_user['connection'] != i['connection']) and (connected_user['token'] == i['token']):
                #Creates a websocket variable out of the current position in the socket storage list
                i['connection'] = connected_user['connection']
                return False
            else:
                response = json.dumps({'token' : i['token']})
                send_to = i['connection']
                send_to.send(response)
                socket_storage.remove(i)
        #counter += 1
    return True


def logout_socket(connected_user, socket_storage):
    """ This function is used to remove a user from the socket storage when logged out. """
    counter = 0
    for i in socket_storage:
        if i['email'] == connected_user.get('email') and i['token'] == connected_user.get('token'):
            socket_storage.pop(counter)
        counter += 1
    return socket_storage


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
    """Receives a token and sends it to functions.py to fetch the
    user with the given token"""
    token = request.form['token']
    data = get_user_data_by_token(token)
    return data


@app.route('/get_user_by_email', methods=['POST'])
def server_get_user_by_email():
    """Receives a token and an email and sends it further
    to functions.py. Then it retrieves a JSON object with
    different components"""
    token = request.form['token']
    email = request.form['email']
    return get_user_data_by_email(token, email)


@app.route('/post_message', methods=['POST'])
def server_post_message():
    """Receives a token, a message and an optional email-wall
    (none=my own wall) which is sent to appropriate function
    in functions.py. Then it retrieves a JSON object with
    different components"""
    token = request.form['token']
    message = request.form['message']
    email_wall = request.form['email_wall']
    response = post_message(token, message, email_wall)
    global socket_storage
    live_message(socket_storage)
    return response


@app.route('/messages_by_email', methods=['POST'])
def server_messages_by_email():
    """Receives a token and an email which is sent to
    appropriate function in functions.py. Then it retrieves
    a JSON object with different components"""
    token = request.form['token']
    email = request.form['email']
    return messages_by_email(token, email)


@app.route('/messages_by_token', methods=['POST'])
def server_messages_by_token():
    """Receives a token which is sent to
    appropriate function in functions.py. Then it retrieves
    a JSON object with different components"""
    token = request.form['token']
    return messages_by_token(token)


@app.route('/count')
def server_count_sessions():
    """Function that counts the number of sessions"""
    global socket_storage
    temp_socket_storage = socket_storage
    counter = 0
    for i in temp_socket_storage:
        if i['token'] is not None:
            counter += 1
    users = count_users()
    return "Logged in users: " + str(counter) + " Total users: " + users


@app.route('/clear_sockets')
def cleaer_sockets():
    """  Function used to clear all stored sockets.
     For testing purposes."""
    global socket_storage
    socket_storage = []
    return "sockets cleared"


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
    """Function that initializes the database"""
    init_db_function()
    return "A new database has been set up!"


if __name__ == "__main__":
    """Starts the server"""
    #app.run(debug=True)
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()