from flask import Flask
app = Flask(__name__)

asteroids = open("programs/0006/server/astJ2000.bin").read();

#TODO

@app.route("/programs/0006/server/searchAsteroids.php")
def asteroid():
    return "Hello World!"