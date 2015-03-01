from flask import Flask
from functions import *

app = Flask(__name__)


@app.route('/')
@app.route('/index')
def index():
    return "Hello, World!"


@app.route('/sign_in')
def server_sign_in():
    """Signs the user in"""
    (email,password) = ("oskno129@student.liu.se","webbogge")
    #This function is still under construction!!!
    return sign_in(email,password)


@app.route('/sign_up')
def server_sign_up():
    """Receives sing-in information and sends it to functions."""
    #At the moment we are using dummy code
    (email, password, firstname, familyname, gender, city, country) = ("oskno129@student.liu.se","webbogge","Oskar","Norberg","Male","Linkoping","Sweden")
    return sign_up(email, password, firstname, familyname, gender, city, country)


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