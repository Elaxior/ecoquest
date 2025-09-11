// js/chatbot/chatbot-ui.js
export class ChatbotUI {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.robotIconUrl = '/assets/images/chatbot.png'; // ✅ Your chatbot PNG
        this.init();
    }
    
    init() {
        this.createChatWidget();
        this.setupEventListeners();
        this.addWelcomeMessage();
    }
    
    createChatWidget() {
        const chatHTML = `
            <!-- 🤖 "Need Help?" Chat Toggle with Custom AI Bot Icon -->
            <div class="fixed bottom-6 right-6 z-50">
                <div id="chat-toggle-container" class="flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    
                    <!-- Custom AI Bot Icon -->
                    <button id="chat-toggle" class="relative w-12 h-12 rounded-full bg-white text-green-600 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-md">
                        <div id="chat-icon">
                            <img src="${this.robotIconUrl}" alt="AI Bot" class="w-8 h-8 object-contain">
                        </div>
                        <div id="close-icon" class="hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-7 h-7">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </button>
                    
                    <!-- "Need Help?" Text -->
                    <span class="text-white font-semibold text-lg whitespace-nowrap pr-1 group-hover:text-green-100 transition-colors duration-300">
                        Need help?
                    </span>
                </div>
            </div>

            <!-- Chat Window -->
            <div id="chat-window" class="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 transform translate-y-full opacity-0 transition-all duration-300 z-40 flex flex-col overflow-hidden">
                
                <!-- Chat Header -->
                <div class="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center">
                    <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm border border-white border-opacity-30">
                        <img src="${this.robotIconUrl}" alt="AI Bot" class="w-6 h-6 object-contain">
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg">Eco-Buddy AI</h3>
                        <p class="text-xs opacity-90">Environmental Learning Assistant</p>
                    </div>
                    <div class="w-3 h-3 bg-green-300 rounded-full animate-pulse shadow-lg"></div>
                </div>
                
                <!-- Chat Messages -->
                <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50 to-white"></div>
                
                <!-- Typing Indicator -->
                <div id="typing-indicator" class="px-4 pb-2 hidden">
                    <div class="flex items-center space-x-3 text-gray-500 bg-gray-100 rounded-lg p-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <img src="${this.robotIconUrl}" alt="AI Bot" class="w-5 h-5 object-contain">
                        </div>
                        <div class="flex space-x-1">
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                        </div>
                        <span class="text-sm font-medium">Eco-Buddy is thinking...</span>
                    </div>
                </div>
                
                <!-- Chat Input -->
                <div class="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                    <div class="flex space-x-3">
                        <input 
                            id="chat-input" 
                            type="text" 
                            placeholder="Ask about environmental topics..." 
                            class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors placeholder-gray-500"
                            maxlength="200"
                        >
                        <button 
                            id="send-message" 
                            class="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg"
                        >
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }
    
    setupEventListeners() {
        document.getElementById('chat-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('chat-toggle-container').addEventListener('click', () => this.toggleChat());
        document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isTyping) this.sendMessage();
        });
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('chat-window');
        const chatIcon = document.getElementById('chat-icon');
        const closeIcon = document.getElementById('close-icon');
        const container = document.getElementById('chat-toggle-container');
        
        if (this.isOpen) {
            chatWindow.classList.remove('translate-y-full', 'opacity-0');
            chatWindow.classList.add('translate-y-0', 'opacity-100');
            chatIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            container.classList.remove('from-green-500', 'to-emerald-600');
            container.classList.add('from-red-500', 'to-red-600');
        } else {
            chatWindow.classList.add('translate-y-full', 'opacity-0');
            chatWindow.classList.remove('translate-y-0', 'opacity-100');
            chatIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            container.classList.remove('from-red-500', 'to-red-600');
            container.classList.add('from-green-500', 'to-emerald-600');
        }
    }
    
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message || this.isTyping) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        this.showTyping();
        
        try {
            const response = await this.getBotResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTyping();
            this.addMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment! 🌱", 'bot');
            console.error('Chatbot error:', error);
        }
    }
    
    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const isUser = sender === 'user';
        
        const messageHTML = `
            <div class="flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-2 animate-fade-in-up" style="animation: fadeInUp 0.3s ease-out;">
                ${!isUser ? `
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <img src="${this.robotIconUrl}" alt="AI Bot" class="w-5 h-5 object-contain">
                    </div>
                ` : ''}
                <div class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-md ${
                    isUser 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-md ml-8' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                } transform transition-all duration-200 hover:scale-105">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                ${isUser ? `
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span class="text-white text-sm">👤</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ content, sender, timestamp: new Date() });
    }
    
    addWelcomeMessage() {
        const welcomeMessages = [
            "Hi! I'm Eco-Buddy AI, your environmental learning assistant! 🤖",
            "I can help you with:",
            "🎯 Finding the perfect quests for you\n🏆 Understanding XP and achievements\n🌍 Environmental topics and questions\n📚 Getting started with EcoQuest",
            "What would you like to explore today?"
        ];
        
        welcomeMessages.forEach((msg, index) => {
            setTimeout(() => this.addMessage(msg, 'bot'), index * 1000);
        });
    }
    
    showTyping() {
        this.isTyping = true;
        document.getElementById('typing-indicator').classList.remove('hidden');
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTyping() {
        this.isTyping = false;
        document.getElementById('typing-indicator').classList.add('hidden');
    }
    
    async getBotResponse(userMessage) {
        const { ChatbotEngine } = await import('./chatbot-engine.js');
        const engine = new ChatbotEngine();
        return await engine.generateResponse(userMessage, this.messages);
    }
    
    updateRobotIcon(newIconUrl) {
        this.robotIconUrl = newIconUrl;
        const robotIcons = document.querySelectorAll('img[alt="AI Bot"]');
        robotIcons.forEach(icon => icon.src = newIconUrl);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new ChatbotUI();
});
