document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const chatbotBox = document.querySelector('.chatbot-box');
  const closeChat = document.querySelector('.close-chat');
  const messagesContainer = document.querySelector('.chatbot-messages');
  const userInput = document.getElementById('user-message');
  const sendButton = document.getElementById('send-message');

  // Toggle chat box
  chatbotToggle.addEventListener('click', function() {
    chatbotBox.classList.toggle('active');
    if (chatbotBox.classList.contains('active')) {
      userInput.focus();
    }
  });

  // Close chat box
  closeChat.addEventListener('click', function() {
    chatbotBox.classList.remove('active');
  });

  // Send message on button click
  sendButton.addEventListener('click', sendMessage);

  // Send message on Enter key
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Function to send user message
  function sendMessage() {
    const message = userInput.value.trim();
    
    if (message !== '') {
      // Add user message to chat
      addMessage(message, 'user');
      
      // Clear input
      userInput.value = '';
      
      // Show typing indicator
      showTypingIndicator();
      
      // Process the message and get bot response
      setTimeout(() => {
        // Remove typing indicator
        removeTypingIndicator();
        
        // Get bot response
        const botResponse = getBotResponse(message);
        
        // Add bot response to chat
        addMessage(botResponse, 'bot');
        
        // Scroll to bottom
        scrollToBottom();
      }, 1000); // Simulate delay for bot response
    }
  }

  // Function to add message to chat
  function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    
    messageContent.appendChild(paragraph);
    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    
    scrollToBottom();
  }

  // Function to show typing indicator
  function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
    typingIndicator.innerHTML = `
      <div class="message-content">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    messagesContainer.appendChild(typingIndicator);
    scrollToBottom();
  }

  // Function to remove typing indicator
  function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Function to scroll to bottom of messages
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Function to get bot response based on user input
  function getBotResponse(message) {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Simple response logic
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! How can I help you today?";
    } 
    else if (lowerMessage.includes('help')) {
      return "I can help you with information about our products, verification process, or how to use our platform. What would you like to know?";
    }
    else if (lowerMessage.includes('verification') || lowerMessage.includes('verify') || lowerMessage.includes('document')) {
      return "To get verified, you need to upload your business registration, tax ID, identity proof, and address proof documents. Go to the Verification page in your agency dashboard to upload these documents.";
    }
    else if (lowerMessage.includes('product') || lowerMessage.includes('add product')) {
      return "You can add products once your agency is verified. Go to the Products section in your dashboard and click on 'Add New Product'.";
    }
    else if (lowerMessage.includes('order') || lowerMessage.includes('shipping')) {
      return "You can manage your orders in the Orders section of your dashboard. There you can update order status and track shipments.";
    }
    else if (lowerMessage.includes('payment') || lowerMessage.includes('money') || lowerMessage.includes('bank')) {
      return "We process payments every 7 days. You can update your bank details in the Settings section of your dashboard.";
    }
    else if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      return "You can reach our support team at support@setu.com or call us at +1-800-SETU-HELP during business hours.";
    }
    else if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Thank you for chatting with us. Have a great day!";
    }
    else {
      return "I'm not sure I understand. Could you please rephrase your question or ask about verification, products, orders, or payments?";
    }
  }
});
