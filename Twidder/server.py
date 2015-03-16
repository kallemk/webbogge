from flask import request, send_from_directory
from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from Twidder.functions import *
from werkzeug.utils import secure_filename
import os


PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))
UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, 'uploads')
print(UPLOAD_FOLDER)
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif', 'mp4'])

app = Flask(__name__, static_url_path='/static')
app.secret_key = "kallemarskit"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

socket_storage = []


@app.route('/')
@app.route('/index')
def index():
    return app.send_static_file('newclient.html')

@app.route('/home')
def home_tab():
    return app.send_static_file('newclient.html')

@app.route('/browse')
def browse_tab():
    return app.send_static_file('newclient.html')

@app.route('/account')
def account_tab():
    return app.send_static_file('newclient.html')

@app.route('/stats')
def stats_tab():
    return app.send_static_file('newclient.html')

@app.route('/sign_in', methods=['POST', 'GET'])
def server_sign_in():
    """Signs the user in"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        return sign_in(email, password)

    """Handles the websocket connection"""
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while True:
            token = ws.receive()
            email = str(get_user_email_by_token(token))
            connected_user = {'email': email, 'connection': ws, 'token': token}
            global socket_storage
            socket_storage = check_socket_status(connected_user, socket_storage)
            socket_storage.append(connected_user)
        return ""

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
    if request.method == 'POST':
        token = request.form['token']
        email = str(get_user_email_by_token(token))
        connected_user = {'email': email, 'token': token}
        global socket_storage
        socket_storage = logout_socket(connected_user, socket_storage)
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
    data = get_user_data_by_token(token)
    return data


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


@app.route('/upload_media', methods=['POST', 'GET'])
def server_upload_media():
    if request.method == 'POST':
        print("post")
        file = request.files['file']
        #token = request.form['token']
        #email_wall = request.form['email_wall']
        return upload_media(file)
    return'''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form action="" method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''


def upload_media(file):
    if file and allowed_file(file.filename):
        print("allowed")
        filename = secure_filename(file.filename)
        print("filename")
        print(filename)
        print(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        print("FUNGERAR")
        return "FUNGERAR?!?!?!?!?"


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


@app.route('/uploads/<filename>', methods=['POST', 'GET'])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)



@app.route('/messages_by_email', methods=['POST'])
def server_messages_by_email():
    token = request.form['token']
    email = request.form['email']
    return messages_by_email(token, email)


@app.route('/messages_by_token', methods=['POST'])
def server_messages_by_token():
    token = request.form['token']
    return messages_by_token(token)


@app.route('/count')
def server_count_sessions():
    """Function that counts the number of sessions"""
    global socket_storage
    temp_socket_stroage = socket_storage
    counter = 0
    for i in temp_socket_stroage:
        if i['token'] is not None:
            counter += 1
    users = count_users()
    return "Logged in users: " + str(counter) + " Total users: " + users


@app.route('/messages')
def server_count_messages():
    return count_messages()


@app.route('/top')
def server_top_posters():
    return top_posters()


@app.route('/clear_sockets')
def cleaer_sockets():
    """s"""
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
    """Function that inits the database"""
    init_db_function()
    return "A new database has been set up!"



if __name__ == "__main__":
    #app.run(debug=True)
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()