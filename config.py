import os

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'Your_Username')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'Your_Password')
DB_NAME = os.getenv('DB_NAME', 'museum_chatbot')