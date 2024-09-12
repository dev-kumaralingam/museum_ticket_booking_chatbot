from flask import Flask, render_template, request, jsonify
from chatbot import Chatbot
from database import Database

app = Flask(__name__)
db = Database()
chatbot = Chatbot(db)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    response = chatbot.process_message(user_message)
    return jsonify(response)

if __name__ == '__main__':
    db.create_tables()  # Ensure tables are created when the app starts
    app.run(debug=True)