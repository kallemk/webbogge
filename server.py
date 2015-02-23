from flask import Flask
from functions import *

app = Flask(__name__)


@app.route('/')
@app.route('/index')
def index():
    return "Hello, World!"

@app.route('/sign_in')
def sign_in():
    return "temp"

if __name__ == "__main__":
    app.run(debug=True)