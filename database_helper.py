from sqlite3 import dbapi2 as sqlite3
from flask import g, Flask
#from contextlib import closing
#import math, random
import os

"""Used to get the path to the webbogge-folder"""
PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))
"""Creates the path for the database-file"""
DATABASE = os.path.join(PROJECT_ROOT, 'database.db')

"""Works with these but I'm not sure if it is a problem that
I have the flask-app thing in both server.py and database_helper.py"""
app = Flask(__name__)
app.config.from_object(__name__)


def connect_db():
    """(Connects to the specific database.)
    From flask website. Used by get_db()."""
    rv = sqlite3.connect(app.config['DATABASE'])
    #rv.row_factory = sqlite3.Row
    return rv


def get_db():
    """(Opens a new database connection if there is none yet for the
    current application context.)
    From flask website. Used by init_db().
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db


def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()


def init_db():
    """Call this method to run the init the database with the database.sql file"""
    db = get_db()
    with app.open_resource('database.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()


def email_check_db(email):
    """Checks if the email already is in use"""
    c = get_db()
    # Returns 1 (anything) if email exists and None if email doesn't exist.
    result = c.execute("SELECT 1 FROM users WHERE email=?", (email,))
    c.commit()
    return result.fetchone()


def password_check_db(email, password):
    """Checks if the email has the given password. 1 if password exists, None if not."""
    # Is this a safe way to handle the password? Might have to be changed later.
    c = get_db()
    # Returns 1 (anything) if the email exists and has has the password.
    # Returns None if the password or email does not exist.
    result = c.execute("SELECT 1 FROM users WHERE email=? AND password=?", (email, password))
    c.commit()
    return result.fetchone()

def sign_up_db(email, password, firstname, familyname, gender, city, country):
    """Receives data from new user, inserts it into the database and returna a success statement"""
    c = get_db()
    c.execute("INSERT INTO users(email, password, firstname, familyname, gender, city, country) VALUES(?,?,?,?,?,?,?)", (email, password, firstname, familyname, gender, city, country))
    c.commit()

def change_password_db(email, old_pwd, new_pwd):
    """Changes the old_pwd with the new_pwd in the row with the email and old_pwd"""
    c = get_db()
    c.execute("UPDATE users SET password=? WHERE email=? AND password=?", (new_pwd, email, old_pwd))
    c.commit()

def test_db():
    """Used to test the connection with server.py"""
    return "Testresultat"