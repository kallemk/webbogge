import math

def sign_in(email, password):
    return "token"

def sign_up(email, password, firstname, familyname, gender, city, country):
    return "success or false"

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
    letters = "abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    token = ""
    for i in range(0, 36, 1):
        token += letters[math.floor(math.random()*letters.length)]
    return token