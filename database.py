import mysql.connector
from mysql.connector import Error
from datetime import datetime
import config

class Database:
    def __init__(self):
        self.conn = None
        self.cur = None
        self.connect()

    def connect(self):
        try:
            self.conn = mysql.connector.connect(**config.DATABASE_CONFIG)
            if self.conn.is_connected():
                self.cur = self.conn.cursor(dictionary=True)
        except Error as e:
            print(f"Error connecting to MySQL: {e}")

    def create_tables(self):
        self.cur.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                museum_name VARCHAR(255) NOT NULL,
                time_slot VARCHAR(50) NOT NULL,
                date DATE NOT NULL,
                child_tickets INT NOT NULL,
                student_tickets INT NOT NULL,
                adult_tickets INT NOT NULL,
                total_cost DECIMAL(10, 2) NOT NULL,
                email VARCHAR(255) NOT NULL,
                ticket_id VARCHAR(50) UNIQUE NOT NULL
            )
        """)
        self.conn.commit()

    def insert_booking(self, booking_data):
        query = """
            INSERT INTO bookings 
            (museum_name, time_slot, date, child_tickets, student_tickets, adult_tickets, total_cost, email, ticket_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        self.cur.execute(query, (
            booking_data['museum_name'],
            booking_data['time_slot'],
            booking_data['date'],
            booking_data['child_tickets'],
            booking_data['student_tickets'],
            booking_data['adult_tickets'],
            booking_data['total_cost'],
            booking_data['email'],
            booking_data['ticket_id']
        ))
        self.conn.commit()

    def delete_expired_bookings(self):
        query = """
            DELETE FROM bookings
            WHERE date < %s
        """
        self.cur.execute(query, (datetime.now().date(),))
        self.conn.commit()

    def close(self):
        if self.conn.is_connected():
            self.cur.close()
            self.conn.close()