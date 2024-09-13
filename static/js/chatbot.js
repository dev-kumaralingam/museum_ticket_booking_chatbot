document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-message');
    const sendButton = document.getElementById('send-button');
    const museumSelection = document.getElementById('museum-selection');
    const museumButtons = document.getElementById('museum-buttons');
    const timeslotSelection = document.getElementById('timeslot-selection');
    const timeslotButtons = document.getElementById('timeslot-buttons');
    const dateSelection = document.getElementById('date-selection');
    const datePicker = document.getElementById('date-picker');
    const ticketSelection = document.getElementById('ticket-selection');
    const ticketOptions = document.getElementById('ticket-options');
    const totalTickets = document.getElementById('total-tickets');
    const totalCost = document.getElementById('total-cost');
    const confirmTickets = document.getElementById('confirm-tickets');
    const emailInput = document.getElementById('email-input');
    const userEmail = document.getElementById('user-email');
    const submitEmail = document.getElementById('submit-email');
    const paymentQR = document.getElementById('payment-qr');
    const qrCode = document.getElementById('qr-code');
    const confirmPayment = document.getElementById('confirm-payment');

    let currentState = 'welcome';
    let selectedMuseum = '';
    let selectedTimeSlot = '';
    let selectedDate = '';
    let tickets = { child: 0, student: 0, adult: 0 };
    const ticketPrices = { child: 50, student: 100, adult: 200 };
    const museums = ["National Museum, New Delhi", "Indian Museum, Kolkata", "Salar Jung Museum, Hyderabad"];
    const timeSlots = ["10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM", "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM"];

    sendMessage('start');

    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            sendMessage(message);
            userInput.value = '';
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    function sendMessage(message) {
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, state: currentState }),
        })
        .then(response => response.json())
        .then(data => {
            addMessage(data.response, 'bot');
            currentState = data.state;
            handleState(data.state, data.response);
        });
    }

    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleState(state, response) {
        switch (state) {
            case 'choose_museum':
                showMuseumSelection();
                break;
            case 'choose_time_slot':
                showTimeslotSelection();
                break;
            case 'choose_date':
                showDateSelection();
                break;
            case 'choose_tickets':
                showTicketSelection();
                break;
            case 'get_email':
                showEmailInput();
                break;
            case 'process_payment':
                showPaymentQR();
                break;
            case 'booking_confirmed':
                hideAllSelections();
                resetBooking();
                break;
        }
    }

    function showMuseumSelection() {
        hideAllSelections();
        museumSelection.style.display = 'block';
        museumButtons.innerHTML = '';
        museums.forEach(museum => {
            const button = document.createElement('button');
            button.textContent = museum;
            button.addEventListener('click', () => {
                selectedMuseum = museum;
                sendMessage(`Selected museum: ${museum}`);
            });
            museumButtons.appendChild(button);
        });
    }

    function showTimeslotSelection() {
        hideAllSelections();
        timeslotSelection.style.display = 'block';
        timeslotButtons.innerHTML = '';
        timeSlots.forEach(slot => {
            const button = document.createElement('button');
            button.textContent = slot;
            button.addEventListener('click', () => {
                selectedTimeSlot = slot;
                sendMessage(`Selected time slot: ${slot}`);
            });
            timeslotButtons.appendChild(button);
        });
    }

    function showDateSelection() {
        hideAllSelections();
        dateSelection.style.display = 'block';
        flatpickr(datePicker, {
            minDate: "today",
            maxDate: new Date().fp_incr(30), // Allow booking up to 30 days in advance
            dateFormat: "Y-m-d",
            onChange: function(selectedDates, dateStr) {
                selectedDate = dateStr;
                sendMessage(`Selected date: ${selectedDate}`);
            }
        });
    }

    function showTicketSelection() {
        hideAllSelections();
        ticketSelection.style.display = 'block';
        ticketOptions.innerHTML = '';
        for (const [category, price] of Object.entries(ticketPrices)) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${category.charAt(0).toUpperCase() + category.slice(1)}: ₹${price}</span>
                <div class="ticket-controls">
                    <button class="decrease">-</button>
                    <input type="number" min="0" value="${tickets[category]}" data-category="${category}">
                    <button class="increase">+</button>
                </div>
            `;
            ticketOptions.appendChild(li);
        }
        updateTotalCost();
    }

    function showEmailInput() {
        hideAllSelections();
        emailInput.style.display = 'block';
    }

    function showPaymentQR() {
        hideAllSelections();
        paymentQR.style.display = 'block';
        // In a real application, you would generate a unique QR code for each transaction
        qrCode.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DummyPaymentData';
    }

    function hideAllSelections() {
        museumSelection.style.display = 'none';
        timeslotSelection.style.display = 'none';
        dateSelection.style.display = 'none';
        ticketSelection.style.display = 'none';
        emailInput.style.display = 'none';
        paymentQR.style.display = 'none';
    }

    ticketOptions.addEventListener('click', (e) => {
        if (e.target.classList.contains('decrease') || e.target.classList.contains('increase')) {
            const input = e.target.parentElement.querySelector('input');
            const category = input.dataset.category;
            if (e.target.classList.contains('decrease') && tickets[category] > 0) {
                tickets[category]--;
            } else if (e.target.classList.contains('increase')) {
                tickets[category]++;
            }
            input.value = tickets[category];
            updateTotalCost();
        }
    });

    ticketOptions.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            const category = e.target.dataset.category;
            const value = parseInt(e.target.value) || 0;
            if (value >= 0) {
                tickets[category] = value;
                updateTotalCost();
            } else {
                e.target.value = tickets[category];
            }
        }
    });

    function updateTotalCost() {
        const total = Object.entries(tickets).reduce((sum, [category, quantity]) => {
            return sum + (quantity * ticketPrices[category]);
        }, 0);
        const totalTicketCount = Object.values(tickets).reduce((sum, quantity) => sum + quantity, 0);
        totalTickets.textContent = totalTicketCount;
        totalCost.textContent = `₹${total}`;
    }

    confirmTickets.addEventListener('click', () => {
        const ticketSummary = Object.entries(tickets)
            .map(([category, quantity]) => `${category}: ${quantity}`)
            .join(', ');
        sendMessage(`Confirm tickets: ${ticketSummary}`);
    });

    submitEmail.addEventListener('click', () => {
        const email = userEmail.value.trim();
        if (validateEmail(email)) {
            sendMessage(`Email: ${email}`);
        } else {
            addMessage("Please enter a valid email address (e.g., example@gmail.com)", 'bot');
        }
    });

    confirmPayment.addEventListener('click', () => {
        sendMessage("Payment confirmed");
    });

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return re.test(String(email).toLowerCase());
    }

    function resetBooking() {
        currentState = 'welcome';
        selectedMuseum = '';
        selectedTimeSlot = '';
        selectedDate = '';
        tickets = { child: 0, student: 0, adult: 0 };
    }

    // Handle navigation to previous steps
    userInput.addEventListener('input', (e) => {
        const message = e.target.value.toLowerCase();
        if (message.includes('go to ticket booking') || message.includes('ticket registration')) {
            sendMessage('go to ticket_booking');
        } else if (message.includes('go to time slot')) {
            sendMessage('go to time_slot');
        } else if (message.includes('go to date selection')) {
            sendMessage('go to date_selection');
        } else if (message.includes('go to ticket selection')) {
            sendMessage('go to ticket_selection');
        }
    });
});