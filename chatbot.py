import random
import string
from datetime import datetime, timedelta

class Chatbot:
    def __init__(self, db):
        self.db = db
        self.state = 'welcome'
        self.booking_data = {}
        self.museums = ['National Museum, New Delhi', 'Indian Museum, Kolkata', 'Salar Jung Museum, Hyderabad']
        self.time_slots = ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM']
        self.ticket_categories = ['Child', 'Student', 'Adult']
        self.ticket_prices = {'Child': 50, 'Student': 100, 'Adult': 200}

    def process_message(self, message):
        if message.lower() in ['go to ticket booking', 'ticket registration']:
            self.state = 'welcome'
            return self.welcome_message()

        if self.state == 'welcome':
            return self.welcome_message()
        elif self.state == 'museum_selection':
            return self.select_museum(message)
        elif self.state == 'time_slot_selection':
            return self.select_time_slot(message)
        elif self.state == 'date_selection':
            return self.select_date(message)
        elif self.state == 'ticket_selection':
            return self.select_tickets(message)
        elif self.state == 'email_input':
            return self.process_email(message)
        elif self.state == 'payment':
            return self.process_payment(message)

    def welcome_message(self):
        self.state = 'museum_selection'
        return {
            'message': "Welcome to the Museum Ticket Booking Chatbot! Please select a museum:",
            'options': self.museums
        }

    def select_museum(self, museum):
        if museum in self.museums:
            self.booking_data['museum_name'] = museum
            self.state = 'time_slot_selection'
            return {
                'message': f"You've selected {museum}. Please choose a time slot:",
                'options': self.time_slots
            }
        else:
            return {'message': "Invalid museum selection. Please try again."}

    def select_time_slot(self, time_slot):
        if time_slot in self.time_slots:
            self.booking_data['time_slot'] = time_slot
            self.state = 'date_selection'
            return {
                'message': "Please select a date:",
                'date_selection': True
            }
        else:
            return {'message': "Invalid time slot. Please try again."}

    def select_date(self, date_str):
        try:
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            if selected_date < datetime.now().date():
                return {'message': "Please select a future date."}
            self.booking_data['date'] = selected_date
            self.state = 'ticket_selection'
            return {
                'message': "Please select the number of tickets for each category:",
                'ticket_categories': self.ticket_categories
            }
        except ValueError:
            return {'message': "Invalid date format. Please use YYYY-MM-DD."}

    def select_tickets(self, ticket_info):
        try:
            tickets = eval(ticket_info)
            if not isinstance(tickets, dict):
                raise ValueError
            
            total_cost = sum(self.ticket_prices[category] * count for category, count in tickets.items())
            self.booking_data.update(tickets)
            self.booking_data['total_cost'] = total_cost

            self.state = 'email_input'
            return {'message': f"Total cost: ₹{total_cost}. Please enter your email address:"}
        except:
            return {'message': "Invalid ticket selection. Please try again."}

    def process_email(self, email):
        if '@' in email and '.' in email:
            self.booking_data['email'] = email
            self.state = 'payment'
            return {
                'message': "Please scan the QR code to complete the payment:",
                'qr_code': "https://example.com/fake-qr-code.png"
            }
        else:
            return {'message': "Invalid email address. Please try again."}

    def process_payment(self, payment_status):
        if payment_status.lower() == 'done':
            ticket_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            self.booking_data['ticket_id'] = ticket_id
            self.db.insert_booking(self.booking_data)
            
            return {
                'message': f"Booking successful! Your ticket ID is {ticket_id}. Details have been sent to your email.",
                'booking_details': self.booking_data
            }
        else:
            return {'message': "Payment not completed. Please try again or type 'cancel' to start over."}