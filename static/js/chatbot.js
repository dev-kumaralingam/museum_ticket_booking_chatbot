let chatState = 'welcome';
let bookingData = {};

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessageToChatWindow('user', message);
        processUserInput(message);
        userInput.value = '';
    }
}

function addMessageToChatWindow(sender, message, options = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;

    if (options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = option;
            button.addEventListener('click', () => processUserInput(option));
            optionsContainer.appendChild(button);
        });
        messageElement.appendChild(optionsContainer);
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processUserInput(message) {
    if (message.toLowerCase() === 'go to ticket booking' || message.toLowerCase() === 'ticket registration') {
        chatState = 'welcome';
        bookingData = {};
    }

    switch (chatState) {
        case 'welcome':
            welcomeMessage();
            break;
        case 'museum_selection':
            selectMuseum(message);
            break;
        case 'time_slot_selection':
            selectTimeSlot(message);
            break;
        case 'date_selection':
            selectDate(message);
            break;
        case 'ticket_selection':
            selectTickets(message);
            break;
        case 'email_input':
            processEmail(message);
            break;
        case 'payment':
            processPayment(message);
            break;
    }
}

function welcomeMessage() {
    const museums = ['National Museum, New Delhi', 'Indian Museum, Kolkata', 'Salar Jung Museum, Hyderabad'];
    addMessageToChatWindow('bot', "Welcome to the Museum Ticket Booking Chatbot! Please select a museum:", museums);
    chatState = 'museum_selection';
}

function selectMuseum(museum) {
    const museums = ['National Museum, New Delhi', 'Indian Museum, Kolkata', 'Salar Jung Museum, Hyderabad'];
    if (museums.includes(museum)) {
        bookingData.museum = museum;
        const timeSlots = ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'];
        addMessageToChatWindow('bot', `You've selected ${museum}. Please choose a time slot:`, timeSlots);
        chatState = 'time_slot_selection';
    } else {
        addMessageToChatWindow('bot', "Invalid museum selection. Please try again.", museums);
    }
}

function selectTimeSlot(timeSlot) {
    const timeSlots = ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'];
    if (timeSlots.includes(timeSlot)) {
        bookingData.timeSlot = timeSlot;
        addMessageToChatWindow('bot', "Please select a date:");
        initDatePicker();
        chatState = 'date_selection';
    } else {
        addMessageToChatWindow('bot', "Invalid time slot. Please try again.", timeSlots);
    }
}

function initDatePicker() {
    const datePickerInput = document.createElement('input');
    datePickerInput.type = 'text';
    datePickerInput.id = 'date-picker';
    chatMessages.appendChild(datePickerInput);

    flatpickr("#date-picker", {
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
            selectDate(dateStr);
        }
    });
}

function selectDate(date) {
    if (isValidDate(date)) {
        bookingData.date = date;
        showTicketSelection();
    } else {
        addMessageToChatWindow('bot', "Invalid date format. Please use YYYY-MM-DD.");
    }
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && date >= new Date();
}

function showTicketSelection() {
    const ticketCategories = [
        { name: 'Child', price: 50 },
        { name: 'Student', price: 100 },
        { name: 'Adult', price: 200 }
    ];

    let message = "Please select the number of tickets for each category:";
    ticketCategories.forEach(category => {
        message += `\n${category.name}: ₹${category.price}`;
    });

    addMessageToChatWindow('bot', message);

    const ticketSelectionContainer = document.createElement('div');
    ticketSelectionContainer.id = 'ticket-selection';

    ticketCategories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('ticket-category');
        categoryDiv.innerHTML = `
            <span>${category.name}</span>
            <div class="ticket-controls">
                <button class="decrement-btn" data-category="${category.name}">-</button>
                <input type="number" class="ticket-input" data-category="${category.name}" value="0" min="0">
                <button class="increment-btn" data-category="${category.name}">+</button>
            </div>
        `;
        ticketSelectionContainer.appendChild(categoryDiv);
    });

    const totalCostDiv = document.createElement('div');
    totalCostDiv.id = 'total-cost';
    totalCostDiv.textContent = 'Total Cost: ₹0';
    ticketSelectionContainer.appendChild(totalCostDiv);

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm Selection';
    confirmButton.addEventListener('click', confirmTicketSelection);
    ticketSelectionContainer.appendChild(confirmButton);

    chatMessages.appendChild(ticketSelectionContainer);

    // Add event listeners for ticket selection
    document.querySelectorAll('.increment-btn, .decrement-btn').forEach(button => {
        button.addEventListener('click', updateTicketCount);
    });

    document.querySelectorAll('.ticket-input').forEach(input => {
        input.addEventListener('input', updateTotalCost);
    });

    chatState = 'ticket_selection';
}

function updateTicketCount(event) {
    const category = event.target.dataset.category;
    const input = document.querySelector(`.ticket-input[data-category="${category}"]`);
    let count = parseInt(input.value);

    if (event.target.classList.contains('increment-btn')) {
        count++;
    } else if (event.target.classList.contains('decrement-btn')) {
        count = Math.max(0, count - 1);
    }

    input.value = count;
    updateTotalCost();
}

function updateTotalCost() {
    const ticketPrices = { Child: 50, Student: 100, Adult: 200 };
    let totalCost = 0;

    document.querySelectorAll('.ticket-input').forEach(input => {
        const category = input.dataset.category;
        const count = parseInt(input.value) || 0;
        totalCost += count * ticketPrices[category];
    });

    document.getElementById('total-cost').textContent = `Total Cost: ₹${totalCost}`;
}

function confirmTicketSelection() {
    const ticketCounts = {};
    let totalTickets = 0;

    document.querySelectorAll('.ticket-input').forEach(input => {
        const category = input.dataset.category;
        const count = parseInt(input.value) || 0;
        ticketCounts[category] = count;
        totalTickets += count;
    });

    if (totalTickets === 0) {
        addMessageToChatWindow('bot', "Please select at least one ticket.");
        return;
    }

    bookingData.tickets = ticketCounts;
    bookingData.totalCost = parseInt(document.getElementById('total-cost').textContent.split('₹')[1]);

    addMessageToChatWindow('bot', "Please enter your email address:");
    chatState = 'email_input';
}

function processEmail(email) {
    if (isValidEmail(email)) {
        bookingData.email = email;
        showQRCode();
    } else {
        addMessageToChatWindow('bot', "Invalid email address. Please try again.");
    }
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function showQRCode() {
    addMessageToChatWindow('bot', "Please scan the QR code to complete the payment:");
    const qrCode = document.createElement('img');
    qrCode.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FakePaymentQRCode";
    qrCode.alt = "Payment QR Code";
    qrCode.id = "qr-code";
    chatMessages.appendChild(qrCode);

    addMessageToChatWindow('bot', "After completing the payment, please type 'done'.");
    chatState = 'payment';
}

function processPayment(message) {
    if (message.toLowerCase() === 'done') {
        const ticketId = generateTicketId();
        bookingData.ticketId = ticketId;

        let confirmationMessage = `Booking successful! Your ticket ID is ${ticketId}. Details have been sent to your email.\n\n`;
        confirmationMessage += `Museum: ${bookingData.museum}\n`;
        confirmationMessage += `Date: ${bookingData.date}\n`;
        confirmationMessage += `Time: ${bookingData.timeSlot}\n`;
        confirmationMessage += `Tickets:\n`;
        for (const [category, count] of Object.entries(bookingData.tickets)) {
            if (count > 0) {
                confirmationMessage += `  ${category}: ${count}\n`;
            }
        }
        confirmationMessage += `Total Cost: ₹${bookingData.totalCost}`;

        addMessageToChatWindow('bot', confirmationMessage);

        // Here you would typically send the booking data to the server
        // For this example, we'll just log it to the console
        console.log('Booking data:', bookingData);

        // Reset the chat state and booking data
        chatState = 'welcome';
        bookingData = {};

        // Offer to start a new booking
        setTimeout(() => {
            addMessageToChatWindow('bot', "Would you like to make another booking?", ['Yes', 'No']);
        }, 2000);
    } else {
        addMessageToChatWindow('bot', "Please complete the payment and type 'done' when finished.");
    }
}

function generateTicketId() {
    return 'TKT' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Initialize the chatbot
welcomeMessage();