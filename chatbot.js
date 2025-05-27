// Initialize chat variables
let chatHistory = [];

// DOM Elements
const chatButton = document.getElementById('ai-chat-button');
const chatPopup = document.getElementById('ai-chat-popup');
const chatMessages = document.getElementById('ai-chat-messages');
const chatInput = document.getElementById('ai-chat-input');
const chatSend = document.getElementById('ai-chat-send');
const chatHeader = document.getElementById('ai-chat-header');

// Toggle chat popup
chatButton.addEventListener('click', () => {
    chatPopup.style.display = chatPopup.style.display === 'flex' ? 'none' : 'flex';
    if (chatPopup.style.display === 'flex') {
        chatInput.focus();
        // Add welcome message if it's the first time
        if (chatHistory.length === 0) {
            appendMessage("Hello! I'm your Sterling Dental assistant. How can I help you today?", 'bot');
        }
    }
});

// Close chat when clicking outside
chatPopup.addEventListener('click', (e) => {
    if (e.target === chatPopup) {
        chatPopup.style.display = 'none';
    }
});

// Add message to chat
function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', `${sender}-message`);
    
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'chat-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle user input
async function handleUserInput() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    appendMessage(message, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    chatSend.disabled = true;
    
    try {
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Get AI response
        const response = await getAIResponse(message);
        
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        
        // Add AI response to chat
        appendMessage(response, 'bot');
    } catch (error) {
        console.error('Error getting AI response:', error);
        appendMessage("I'm sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
    } finally {
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
    }
}

// Get AI response from OpenRouter
async function getAIResponse(message) {
    // Add message to chat history
    chatHistory.push({ role: 'user', content: message });
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'Sterling Dental Clinic'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful dental assistant for Sterling Dental Clinic located at Garden City Mall, Ground Floor, Kampala, Uganda.
                        The main doctor is Dr. Biren N. Yajnik, a highly skilled dental professional.
                        
                        Working Hours:
                        - Monday to Friday: 9:00 AM to 6:00 PM
                        - Saturday: 9:00 AM to 3:00 PM
                        - Sunday: Closed
                        
                        Provide concise, professional, and friendly responses about dental services, appointments, 
                        and oral health. If asked about the doctors or staff, mention Dr. Biren N. Yajnik as the 
                        primary dentist. For unrelated topics, politely guide the conversation back to dental topics. 
                        Keep responses under 3 sentences unless more detail is requested.`
                    },
                    ...chatHistory.slice(-5) // Keep last 5 messages for context
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();
        
        // Add AI response to chat history
        chatHistory.push({ role: 'assistant', content: aiResponse });
        
        return aiResponse;
    } catch (error) {
        console.error('Error fetching AI response:', error);
        throw error;
    }
}

// Event listeners
chatSend.addEventListener('click', handleUserInput);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});

// Use the API key from the window.ENV object
const OPENROUTER_API_KEY = window.ENV.OPENROUTER_API_KEY;

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for chat header to minimize/maximize
    chatHeader.addEventListener('click', () => {
        const chatBody = document.querySelector('.chat-body');
        if (chatBody) {
            chatBody.style.display = chatBody.style.display === 'none' ? 'flex' : 'none';
        }
    });

    // Add click event for chat send button
    chatSend.addEventListener('click', handleUserInput);
    
    // Add keydown event for chat input
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
});
