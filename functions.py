import math
from database_helper import *
from flask import jsonify

def sign_in(email, password):
    print(password_check_db(email, password))
    if email_check_db(email) and password_check_db(email, password):
        # Here the token generator should be called and returned, but now I'm just returning a string.
        return "User should be logged in"
    else:
        return jsonify(success=False,
                       message="Wrong username or password.")

def sign_up(email, password, firstname, familyname, gender, city, country):
    """Checks if the email is unique and
     sends the sign-up information to database helper.
     Returns a success or failure message"""
    if email_check_db(email):
        return jsonify(success=False,
                       message="User already exists.")
    else:
        try:
            sign_up_db(email, password, firstname, familyname, gender, city, country)
            return jsonify(success=True,
                           message="Successfully created a new user.")
        except:
            return jsonify(success=False,
                           message="Formdata not complete.")




def sign_out(token):
    return "success or false"

def change_password(token, old_pwd, new_pwd):
    return "success or false"

def get_user_data_by_token(token):
    return "user"

def get_user_data_by_email(token, email):
    return "user"

def get_user_messages_by_token(token):
    return "messages"

def get_user_messages_by_email(token, email):
    return "messages"

def post_message(token, message, email):
    return "tackar"

def create_token():
    """Returns a randomly generated token"""
    letters = "abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    token = ""
    for i in range(0, 36, 1):
        token += letters[math.floor(math.random()*letters.length)]
    return token

def init_db_function():
    init_db()

def test_db_function(a,b):
    #test_db()
    return a + b