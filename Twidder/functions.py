import math
import random
import json
from flask import jsonify, session
from Twidder.database_helper import *

def sign_in(email, password):
    """The function checks if email exists and if the password
     works with it, and if it does it creates a session."""
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
    if email_check_db(email):
        return jsonify(success=False,
                       message="User already exists.")
    else:
        if password_validation(password) is False:
            return jsonify(success=False,
                           message="The password must contain at least 5 characters")
        try:
            #The user is added to the user table in the database
            sign_up_db(email, password, firstname, familyname, gender, city, country)
            return jsonify(success=True,
                           message="Successfully created a new user.")
        except:
            return jsonify(success=False,
                           message="Formdata not complete.")


def sign_out(token):
    """Checks if user is signed in and then removes the user from the signed in users"""
    #Check if the token exists/user is logged in
    if session_exists(token):
        #Remove the token from logged in users
        session.pop(token, None)
        return jsonify(success=True,
                       message="Successfully signed out.")
    else:
        return jsonify(success=False,
                       message="You are not signed in.")


def change_password(token, old_pwd, new_pwd):
    """If successful, this function changes the password
    of the user that is currently logged in"""
    #Check if token exists/user logged in
    if session_exists(token):
        #Get the email for the token of the current session.
        email = session[token]
        #Check if the old_password corresponds to the password in the db for the email
        if password_check_db(email, old_pwd):
            if password_validation(new_pwd) is True:
                #Assign new password
                change_password_db(email, old_pwd, new_pwd)
                return jsonify(success=True,
                           message="Password changed.")
            else:
                return jsonify(success=False,
                           message="The password must contain at least 5 characters")
        else:
            return jsonify(success=False,
                       message="Wrong password.")
    else:
        return jsonify(success=True,
                       message="You are not logged in.")

def get_user_data_by_token(token):
    """The function takes the token of the currently logged in user
    and sends the session to the function that fetches a user"""
    if session_exists(token):
        #Get the email for the token of the current session.
        email = session[token]
        return get_user_data_by_email(token, email)
    else:
        return jsonify(success=False,
                       message="You are not signed in.")

def get_user_email_by_token(token):
    """The function returns the email of the logged in
    user if it has an active session"""
    if session_exists(token):
        #Get the email for the token of the current session.
        email = session[token]
        return email
    else:
        return jsonify(success=False,
                       message="Couldn't find email")

def get_user_data_by_email(token, email):
    """If there is an active session and the email that is searched for
    exists, a user will be fetched from the database table users"""
    if session_exists(token):
        if email_check_db(email):
            #Fetch the specific user from the database
            user = get_user_db(email)
            #Setting up a python dictionary for json to interpret
            user_information = {'email': user[0],
                                  'firstname': user[2],
                                  'familyname': user[3],
                                  'gender': user[4],
                                  'city': user[5],
                                  'country': user[6]}
            return jsonify(success=True,
                           message="User data retrieved",
                           data=user_information)
        else:
            return jsonify(success=False,
                           message="No such user.")
    else:
        return jsonify(success=False,
                       message="You are not signed in.")

def messages_by_token(token):
    """The function takes the token of the currently logged in user
    and sends the token together with it's email to the function that fetches the messages"""
    if session_exists(token):
        #Get the email for the token of the current session.
        email = session[token]
        return messages_by_email(token, email)
    else:
        return jsonify(success=False,
                       message="You are not signed in.")


def messages_by_email(token, email):
    """Receives a token and an email.
    First the function looks for a session with the token as a key.
    Then the the existence of the email is checked.
    Finally the messages for the requested user are retrieved from the database
    and the result is returned together with a message."""
    if session_exists(token):
        if email_check_db(email):
            #Fetches the messages of the wanted email
            messages = messages_by_email_db(email)
            #Creates a list to store messages in
            messages_list = []
            for i in messages:
                #Loops through the messages and put them in a dictionary
                #that is appended to the message list
                message = {'id' : i[0],
                           'email_sender' : i[1],
                           'email_wall' : i[2],
                           'message' : i[3]}
                messages_list.append(message)
            return jsonify(success=True,
                           message="User messages retreived.",
                           data=messages_list)
        else:
            return jsonify(success=False,
                           message="No such user.")
    else:
        return jsonify(success=False,
                       message="You are not signed in.")



def post_message(token, message, email_wall):
    """The function takes in the message, an email for the wall it will be posted on and a token.
    The token is checked and used to get the email for the sender.
    The the message is inserted into the database and a success message is returned"""
    if session_exists(token):
        #Determines the sender of the message by the current session
        email_sender = session[token]
        if email_wall == "":
            return jsonify(success=False,
                           message="No such user")
        if email_check_db(email_wall):
            #Puts the message into the messages table in the database
            post_message_db(message, email_wall, email_sender)
            return jsonify(success=True,
                       message="Message posted")
        else:
            return jsonify(success=False,
                       message="No such user")
    else:
        return jsonify(success=False,
                       message="You are not signed in.")

def password_validation(pwd):
    """Checks the length of the password.
    Returns True if the password is long enough
    and false if the password is too short.
    This function is just an extra feature and not required"""
    #Set the min length of the password.
    min_length = 5
    if len(pwd) < min_length:
        return False
    else:
        return True


def check_socket_status(connected_user, socket_storage):
    """The function checks for other connections with the same
    email, then if that's the case old connections are removed"""
    #A counter for the loop through the socket list
    counter = 0
    for i in socket_storage:
        #Checks if the current position in the list matches the current user
        if i['email'] == connected_user.get('email'):
            #Creates a websocket variable out of the current position in the socket storage list
            socket_connection = i['connection']
            response = json.dumps({'token' : i['token']})
            socket_connection.send(response)
            socket_storage.pop(counter)
        counter += 1
    return socket_storage


def logout_socket(connected_user, socket_storage):
    counter = 0
    for i in socket_storage:
        if i['email'] == connected_user.get('email') and i['token'] == connected_user.get('token'):
            socket_storage.pop(counter)
        counter += 1
    return socket_storage


def live_message(socket_storage):
    print("Starting live message")
    total_messages = count_total_messages()
    top_list = top_posters()
    print(total_messages)
    print(top_list)
    for i in socket_storage:
        print(i)
        socket_connection = i['connection']
        print(socket_connection)
        email = i['email']
        user_messages = count_user_messages(email)
        data = {'total_messages' : total_messages, 'user_messages' : user_messages, 'top_list' : top_list}
        response = json.dumps({'type' : "live_message", 'data' : data})
        socket_connection.send(response)



def live_login(socket_storage):
    print("Starting live login")
    counter = 0
    for i in socket_storage:
        if i['token'] is not None:
            counter += 1
    online_users = counter
    print("Online users: " + str(online_users))
    total_users = count_users()
    print("Total users: " + str(total_users))
    data = {'online_users' : online_users, 'total_users' : total_users}
    response = json.dumps({'type' : "live_login", 'data' : data})

    print(response)
    print("Looping sockets...")
    for i in socket_storage:
        print(i)
        socket_connection = i['connection']
        print(socket_connection)
        socket_connection.send(response)



def count_users():
    """This function retrieves the result from the database helper
    function that counts the total number of users"""
    result = count_users_db()
    return str(result[0])


def count_user_messages(email):
    result = count_user_messages_db(email)
    return str(result[0])


def count_total_messages():
    result = count_total_messages_db()
    return str(result[0])


def top_posters():
    result = top_posters_db()
    top_list = []
    print("111111111111111222222222222222223333333333333333")
    for user in result:
        temp = {'email' : user[0], 'messages' : user[1]}
        print(user[0])
        print(user[1])
        top_list.append(temp)
    return top_list



def session_exists(token):
    """Short function that checks if there is a session for the token.
    Returns true or false"""
    try:
        if session[token]:
            return True
    except:
        pass
    return False


def create_token():
    """Returns a randomly generated token"""
    letters = "abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    token = ""
    for i in range(0, 36, 1):
        token += letters[int(math.floor(random.random()*len(letters)))]
    return token

def init_db_function():
    """Initializes the database"""
    init_db()


def test_db_function(a,b):
    #test_db()
    return "bizmillah"