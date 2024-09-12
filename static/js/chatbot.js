document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userMessage = document.getElementById('user-message');
    const sendButton = document.getElementById('send-button');

    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
        messageElement.innerHTML = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createDatePicker() {
        const dateInput = document.createElement('input');
        dateInput.type = 'text';
        dateInput.id = 'date-picker';
        chatMessages.appendChild(dateInput);

        flatpickr(dateInput, {
            minDate: "today",
            dateFormat: "Y-m-d",
            onChange: function(selectedDates, dateStr) {
                sendMessage(dateStr);
            }
        });
    }

    function createTicketOptions(categories) {
        const optionsContainer = document.createElement('div');
        categories.forEach(category => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('ticket-option');

            const label = document.createElement('label');
            label.textContent = category;
            optionDiv.appendChild(label);

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '0';
            input.dataset.category = category;
            optionDiv.appendChild(input);

            const minusButton = document.createElement('button');
            minusButton.textContent = '-';
            minusButton.onclick = () => updateTicketCount(input, -1);
            optionDiv.appendChild(minusButton);

            const plusButton = document.createElement('button');
            plusButton.textContent = '+';
            plusButton.onclick = () => updateTicketCount(input, 1);
            optionDiv.appendChild(plusButton);

            optionsContainer.appendChild(optionDiv);
        });

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.onclick = submitTicketSelection;
        optionsContainer.appendChild(submitButton);

        chatMessages.appendChild(optionsContainer);
    }

    function updateTicketCount(input, change) {
        input.value = Math.max(0, parseInt(input.value) + change);
    }

    function submitTicketSelection() {
        const ticketCounts = {};
        document.querySelectorAll('.ticket-option input').forEach(input => {
            ticketCounts[input.dataset.category] = parseInt(input.value);
        });
        sendMessage(JSON.stringify(ticketCounts));
    }

    function sendMessage(message) {
        addMessage(message, true);
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            addMessage(data.message);
            if (data.date_selection) {
                createDatePicker();
            }
            if (data.ticket_categories) {
                createTicketOptions(data.ticket_categories);
            }
            if (data.qr_code) {
                const qrCode = document.createElement('img');
                qrCode.src = data.qr_code;
                qrCode.alt = 'QR Code for payment';
                chatMessages.appendChild(qrCode);
            }
        });
        userMessage.value = '';
    }

    sendButton.addEventListener('click', () => sendMessage(userMessage.value));
    userMessage.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(userMessage.value);
        }
    });

    // Start the conversation
    sendMessage('start');
});