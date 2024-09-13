import mysql.connector
from mysql.connector import Error
from datetime import datetime

class Database:
    def __init__(self, host, user, password, database):
        try:
            self.conn = mysql.connector.connect(
                host=host,
                user=user,
                password=password,
                database=database
            )
            if self.conn.is_connected():
                print("Connected to MySQL database")
                self.cursor = self.conn.cursor()
                self.create_tables()
        except Error as e:
            print(f"Error connecting to MySQL database: {e}")

    def create_tables(self):
        try:
            self.cursor.execute("""
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
                    ticket_id VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.commit()
            print("Table created successfully")
        except Error as e:
            print(f"Error creating table: {e}")

    def save_booking(self, booking_data):
        try:
            sql = """
                INSERT INTO bookings 
                (museum_name, time_slot, date, child_tickets, student_tickets, adult_tickets, total_cost, email, ticket_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                booking_data['museum_name'],
                booking_data['time_slot'],
                booking_data['date'],
                booking_data['child_tickets'],
                booking_data['student_tickets'],
                booking_data['adult_tickets'],
                booking_data['total_cost'],
                booking_data['email'],
                booking_data['ticket_id']
            )
            self.cursor.execute(sql, values)
            self.conn.commit()
            print("Booking saved successfully")
        except Error as e:
            print(f"Error saving booking: {e}")

    def delete_expired_bookings(self):
        try:
            sql = "DELETE FROM bookings WHERE date < %s"
            self.cursor.execute(sql, (datetime.now().date(),))
            self.conn.commit()
            print("Expired bookings deleted successfully")
        except Error as e:
            print(f"Error deleting expired bookings: {e}")

    def __del__(self):
        if hasattr(self, 'conn') and self.conn.is_connected():
            self.cursor.close()
            self.conn.close()
            print("MySQL connection closed")