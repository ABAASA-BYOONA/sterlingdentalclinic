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

// Custom responses for specific questions
// Your custom responses
const customResponses = {
  "who is your main doctor?": "Our main dentist is DR. BIREN N.YAJNIK, an experienced cosmetic dentist and past president of the Uganda Dental Association.",
  "who is dr. biren n.yajnik?": "DR. BIREN N.YAJNIK is our lead dentist, a cosmetic dentist with qualifications including B.D.S., F.A.G.E., F.R.S.H(Lon), F.P.F.A(USA), and has served as President of the Uganda Dental Association.",
  "what is your mission?": "Our mission is to deliver exceptional dental care through personalized treatment plans, advanced technology, and compassionate service.",
  "what is your vision?": "Our vision is to be Kampala’s most trusted dental clinic, transforming smiles and improving oral health for generations to come.",
  "where are you located?": "We are located at Garden City Mall, Ground Floor, Kampala, Uganda. Check our Contact page for a map and directions.",
  "how can I contact you?": "You can call us at +256 772 488592 or +256 766 526236, email info@kampalasterlingdentalclinic.com, or WhatsApp us using the links on our website.",
  "what is your phone number?": "You can reach us at +256 772 488592 or +256 766 526236.",
  "what is your email address?": "Our email address is info@kampalasterlingdentalclinic.com.",
  "what are your working hours?": "We are open Monday to Friday, 9:00 AM to 6:00 PM, and Saturday, 9:00 AM to 3:00 PM. Sunday is for emergencies only.",
  "are you open on weekends?": "We are open on Saturday from 9:00 AM to 3:00 PM. On Sunday, we are available for emergencies only.",
  "what services do you offer?": "We offer General Dentistry, Cosmetic Dentistry, Orthodontics, Pediatric Dentistry, Emergency Care, and Dental Implants. Ask for more details on any service.",
  "tell me about general dentistry": "Our general dentistry includes dental exams, cleanings, fillings, root canal therapy, and gum disease treatment.",
  "tell me about cosmetic dentistry": "Our cosmetic dentistry services include teeth whitening, veneers, composite bonding, and smile makeovers.",
  "do you do orthodontics?": "Yes, we offer orthodontics, including traditional braces, Invisalign clear aligners, retainers, and space maintainers.",
  "do you treat children?": "Yes, we provide pediatric dentistry, including exams, fluoride treatments, sealants, and early orthodontic care.",
  "do you handle dental emergencies?": "Yes, we offer emergency care for toothache, broken teeth, knocked-out teeth, and other dental trauma.",
  "do you offer dental implants?": "Yes, we offer single tooth implants, implant-supported bridges, full arch restoration, and bone grafting.",
  "how can I book an appointment?": "You can book an appointment online through our website using the 'Book Appointment' section, or call us at +256 772 488592.",
  "can I book an appointment online?": "Yes! Visit the 'Book Appointment' section on our website to schedule your visit.",
  "what do I need to book an appointment?": "Please provide your name, phone number, email, preferred service, and desired date when booking online.",
  "are you on social media?": "Yes, you can find us on Facebook, Instagram, Twitter, LinkedIn, Snapchat, TikTok, and WhatsApp. Check the links in the website footer."
};

// Initialize Fuse.js for fuzzy matching
const fuse = new Fuse(Object.keys(customResponses), {
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  isCaseSensitive: false,
});

// Keywords to allow (dental and site related)
const allowedKeywords = [
  "dental", "dentist", "teeth", "oral", "smile", "clinic", "appointment", "emergency",
  "services", "contact", "location", "hours", "doctor", "dr.", "sterling", "implant",
  "orthodontics", "cosmetic", "pediatric", "cleaning", "whitening", "root canal",
  "booking", "social media", "email", "phone", "weekend", "weekdays", "treatment"
];

// Function to check if message is dental/site related
function isAllowedTopic(message) {
  const lower = message.toLowerCase();
  return allowedKeywords.some(keyword => lower.includes(keyword));
}

// Handle user input
async function handleUserInput() {
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage(message, 'user');
  chatInput.value = '';
  chatInput.disabled = true;
  chatSend.disabled = true;

  // Check if message is on allowed topics
  if (!isAllowedTopic(message)) {
    appendMessage("I'm here to help with dental-related questions or information about Sterling Dental Clinic. Could you please ask something related?", 'bot');
    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.focus();
    return;
  }

  // Use Fuse.js to find best matching custom response
  const results = fuse.search(message);
  if (results.length > 0 && results[0].score <= 0.4) {
    const bestMatch = results[0].item;
    appendMessage(customResponses[bestMatch], 'bot');
    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.focus();
    return;
  }

  // If no custom response matched, fallback to AI
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

// Handle user input
async function handleUserInput() {
    const message = chatInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    chatSend.disabled = true;

    // Check for custom response (case insensitive)
    const lowerMessage = message.toLowerCase();
    if (customResponses[lowerMessage]) {
        appendMessage(customResponses[lowerMessage], 'bot');
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
        return;
    }

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
