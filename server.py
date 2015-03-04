from flask import Flask, request
from functions import *

app = Flask(__name__)


@app.route('/')
@app.route('/index')
def index():
    return "Hello, World!"


@app.route('/sign_in', methods=['POST'])
def server_sign_in():
    """Signs the user in"""
    email = request.form['email']
    password = request.form['password']
    return sign_in(email, password)


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


@app.route('/sign_out')
def server_sign_out():
    """Receives the token for the user that will be signed out"""
    token = "blahblahbla"
    return sign_out(token)


@app.route('/change_password', methods=['POST'])
def server_change_password():
    """Receives a token, old password and new password.
    They are sent further to functions.py in order for the password to be changed."""
    old_pwd = request.form['old_pw']
    new_pwd = request.form['new_pwd']
    token = request.form['token']
    return change_password(token, old_pwd, new_pwd)


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
    return test_db_function(a,b)

@app.route('/init_db')
def server_init_db():
    """Function that inits the database"""
    init_db_function()
    return "A new database has been set up!"


if __name__ == "__main__":
    app.run(debug=True)