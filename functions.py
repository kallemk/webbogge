import math, random
from database_helper import *
from flask import jsonify, session
import json



def sign_in(email, password):
    if email_check_db(email) and password_check_db(email, password):
        token = create_token()
        session[token] = email
        return jsonify(success=True,
                       message="Successfully signed in.",
                       data=token)
    else:
        return jsonify(success=False,
                       message="Wrong username or password.")

def sign_up(email, password, firstname, familyname, gender, city, country):
    """Checks if the email is unique and
     sends the sign-up information to database helper.
     Returns a success or failure message"""
    # The input might have to be modified if the client sends a formData object.
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
    """Checks if user is signed in and then removes the user from the signed in users"""
    # Check if the token exists/user is logged in
    # Remove the token from logged in users
    # "persist logged in users" will this be needed here? How does the local storage work with backend implemented?
    try:
        if session[token]:
            session.pop(token, None)
            return jsonify(success=True,
                           message="Successfully signed out.")
    except:
        return jsonify(success=True,
                       message="You are not signed in.")


def change_password(token, old_pwd, new_pwd):
    """"""
    # Check if token exists/user logged in
    # Get the email for the token. Assign to variable.
    email = session[token]
    # Check if the old_password corresponds to the password in the db for the email
    if password_check_db(email, old_pwd):
        # Assign new password
        change_password_db(email, old_pwd, new_pwd)
        # Persist users
        return jsonify(success=True,
                   message="Password changed.")
    else:
        return jsonify(success=False,
                   message="Wrong password.")

    return jsonify(success=True,
                   message="You are not logged in.")

def get_user_data_by_token(token):
    """"""
    email = session[token]
    return get_user_data_by_email(token, email)

def get_user_data_by_email(token, email):
    """"""
    try:
        if session[token]:
            if email_check_db(email):
                user = get_user_db(email)
                #DETTA NEDAN FUNKAR INTE
                user_dictionary = [ {'email': user.email, 'firstname': user.firstname,
                                     'familyname': user.familyname, 'gender': user.gender,
                                     'city': user.city, 'country': user.country} ]
                return jsonify(success=True,
                               message="User data retrieved",
                               data=user_dictionary)
            else:
                return jsonify(success=False,
                               message="No such user.")
    except:
        return jsonify(success=False,
                       message="You are not signed in.")

def get_user_messages_by_token(token):
    """"""
    return "messages"

def get_user_messages_by_email(token, email):
    """"""
    return "messages"

def post_message(token, message, email):
    """"""
    return "tackar"

def create_token():
    """Returns a randomly generated token"""
    letters = "abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    token = ""
    for i in range(0, 36, 1):
        token += letters[int(math.floor(random.random()*len(letters)))]
    return token

def init_db_function():
    init_db()

def test_db_function(a,b):
    #test_db()
    session["hej"]
    return "bizmillah"