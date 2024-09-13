from flask import Flask, render_template, request, jsonify
from chatbot import Chatbot
from database import Database
import config

app = Flask(__name__)
db = Database(config.DB_HOST, config.DB_USER, config.DB_PASSWORD, config.DB_NAME)
chatbot = Chatbot(db)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    user_state = request.json.get('state', 'welcome')
    response, new_state = chatbot.process_message(user_message, user_state)
    return jsonify({'response': response, 'state': new_state})

if __name__ == '__main__':
    app.run(debug=True)