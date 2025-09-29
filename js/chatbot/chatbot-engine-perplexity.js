// js/chatbot/chatbot-engine-perplexity.js - COMPLETE OPTIMIZED VERSION
import { PERPLEXITY_CONFIG } from '../config/perplexity-config.js';

export class PerplexityChatbotEngine {
    constructor() {
        this.apiKey = PERPLEXITY_CONFIG.apiKey;
        this.baseURL = PERPLEXITY_CONFIG.baseURL;
        this.model = 'sonar'; // ✅ Correct model name
        this.systemPrompt = this.createSystemPrompt();
    }
    
    createSystemPrompt() {
        return `You are Eco-Buddy, the friendly environmental education chatbot for EcoQuest platform.

RESPONSE RULES:
- Behave like a chatbot, not a search engine
- Focus on environmental topics and EcoQuest features
- Provide accurate, concise, and relevant information   
- Keep responses SHORT (1-2 sentences maximum)
- Use simple, student-friendly language
- Always include 1-2 relevant emojis
- Format with bullet points when giving tips
- End with encouragement or call-to-action

PERSONALITY:
- Friendly and encouraging
- Educational but fun
- Positive about environmental action

KNOWLEDGE AREAS:
- Water conservation, waste management, energy saving
- Climate change, biodiversity, sustainability
- EcoQuest platform features

RESPONSE FORMAT EXAMPLES:
For tips: Use bullet points
• Tip 1
• Tip 2

For facts: Short sentences with emojis
"Climate change is caused by greenhouse gases 🌡️ Simple actions like using renewable energy can help! 💚"

Always encourage practical action and EcoQuest participation.`;
    }
    
    async generateResponse(userMessage, conversationHistory = []) {
        try {
            console.log('🔍 Generating Perplexity AI response for:', userMessage);
            
            // Build conversation context with proper alternation
            const messages = this.buildMessages(userMessage, conversationHistory);
            const response = await this.callPerplexityAPI(messages);
            return this.processResponse(response, userMessage);
            
        } catch (error) {
            console.error('Perplexity API error:', error);
            return this.getErrorResponse(error);
        }
    }
    
    buildMessages(userMessage, conversationHistory) {
        const messages = [
            {
                role: "system",
                content: this.systemPrompt
            }
        ];
        
        // ✅ FIXED: Properly filter and alternate messages
        const realConversation = [];
        
        // Filter out welcome messages and HTML content
        const filteredHistory = conversationHistory.filter(msg => {
            const content = msg.content.toLowerCase();
            // Skip welcome messages, powered by messages, etc.
            return !content.includes('powered by') &&
                   !content.includes('what would you like') &&
                   !content.includes('i can help you with') &&
                   !content.includes('finding perfect quests') &&
                   !content.includes('ready for action') &&
                   !content.includes('join ecoquest') &&
                   content.length > 10; // Skip very short messages
        });
        
        // ✅ CRITICAL: Ensure proper user/assistant alternation
        let lastRole = null;
        for (const msg of filteredHistory) {
            const role = msg.sender === 'user' ? 'user' : 'assistant';
            const cleanContent = msg.content.replace(/<[^>]*>/g, '').trim(); // Remove HTML
            
            // Only add if it alternates properly
            if (role !== lastRole && cleanContent) {
                realConversation.push({
                    role: role,
                    content: cleanContent
                });
                lastRole = role;
            }
        }
        
        // Add only the last 4 messages to keep context manageable
        const recentMessages = realConversation.slice(-4);
        messages.push(...recentMessages);
        
        // Add current user message (ensure it's not a duplicate)
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.content !== userMessage || lastMessage.role !== 'user') {
            messages.push({
                role: "user",
                content: userMessage
            });
        }
        
        // ✅ VALIDATION: Ensure proper message alternation
        this.validateMessageAlternation(messages);
        
        return messages;
    }
    
    // ✅ NEW: Validate message alternation to prevent API errors
    validateMessageAlternation(messages) {
        let lastRole = 'system';
        
        for (let i = 1; i < messages.length; i++) {
            const currentRole = messages[i].role;
            
            // Skip system messages in validation
            if (currentRole === 'system') continue;
            
            // Check for consecutive same roles
            if (currentRole === lastRole && currentRole !== 'system') {
                console.warn('⚠️ Message alternation issue detected, fixing...');
                // Remove the duplicate role message
                messages.splice(i, 1);
                i--; // Adjust index after removal
                continue;
            }
            
            lastRole = currentRole;
        }
        
        console.log('✅ Message alternation validated successfully');
    }
    
    async callPerplexityAPI(messages) {
        console.log('📡 Calling Perplexity API...');
        console.log('🤖 Using Perplexity Sonar model');
        
        // ✅ OPTIMIZED: Parameters for short, focused responses
        const requestBody = {
            model: this.model,
            messages: messages,
            temperature: 0.6,        // ✅ REDUCED: Less creative, more focused
            max_tokens: 120,         // ✅ REDUCED: Shorter responses
            top_p: 0.8,             // ✅ REDUCED: More focused responses
            stream: false
        };
        
        console.log('📤 Final request messages:');
        messages.forEach((msg, i) => {
            console.log(`  ${i}: ${msg.role} - ${msg.content.substring(0, 50)}...`);
        });
        
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📊 Perplexity response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ Perplexity API Error:', response.status, errorData);
            
            if (response.status === 401) {
                throw new Error('Invalid Perplexity API key. Please check your configuration.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment.');
            } else if (response.status === 402) {
                throw new Error('Insufficient credits. Please add credits to your account.');
            } else if (response.status === 400) {
                throw new Error(`Bad request: ${JSON.stringify(errorData)}`);
            }
            
            throw new Error(`Perplexity API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Perplexity AI response received successfully');
        
        return data;
    }
    
    processResponse(data, userMessage) {
        console.log('🔧 Processing Perplexity AI response...');
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response structure from Perplexity API');
        }
        
        let response = data.choices[0].message.content.trim();
        
        // ✅ ENHANCED: Better formatting and length control
        response = this.formatResponse(response, userMessage);
        
        // Add EcoQuest context for specific keywords
        if (this.isAskingAboutQuests(userMessage)) {
            response += "\n\n🎯 **Ready for action?** Try our environmental quests!";
        } else if (this.isAskingAboutGettingStarted(userMessage)) {
            response += "\n\n🚀 **Join EcoQuest** to start your environmental journey!";
        }
        
        console.log('✅ Final formatted response ready');
        return response;
    }

    // ✅ NEW: Smart response formatting method
    formatResponse(response, userMessage) {
        // Remove any markdown formatting that doesn't display well
        response = response.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
        response = response.replace(/\*(.*?)\*/g, '$1');     // Remove italic markdown
        
        // Split into sentences and keep only 2-3 best ones
        let sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        // For longer responses, take first 2-3 sentences
        if (sentences.length > 3) {
            sentences = sentences.slice(0, 3);
        }
        
        // Rejoin sentences
        let formattedResponse = sentences.join('. ').trim();
        
        // Ensure it ends with proper punctuation
        if (!formattedResponse.match(/[.!?]$/)) {
            formattedResponse += '.';
        }
        
        // ✅ SMART FORMATTING: Add structure for different types of questions
        if (this.needsBulletPoints(userMessage)) {
            formattedResponse = this.convertToBullets(formattedResponse, userMessage);
        }
        
        // Ensure response isn't too long (max 300 characters for chat)
        if (formattedResponse.length > 300) {
            formattedResponse = formattedResponse.substring(0, 297) + '...';
        }
        
        return formattedResponse;
    }

    // ✅ NEW: Check if response should use bullet points
    needsBulletPoints(message) {
        const bulletKeywords = ['how to', 'tips', 'ways to', 'steps', 'methods', 'what can i do'];
        return bulletKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    // ✅ NEW: Convert long responses to bullet format
    convertToBullets(response, userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // If response mentions multiple items, convert to bullets
        if (response.includes(' and ') || response.includes(', ')) {
            // Smart conversion for common patterns
            if (lowerMessage.includes('water') || lowerMessage.includes('save water')) {
                return "💧 **Water Conservation Tips:**\n• Fix leaky taps\n• Take shorter showers\n• Collect rainwater\n• Use water-efficient appliances";
            } else if (lowerMessage.includes('waste') || lowerMessage.includes('recycle')) {
                return "♻️ **Waste Management Tips:**\n• Reduce what you buy\n• Reuse items creatively\n• Recycle properly\n• Choose reusable alternatives";
            } else if (lowerMessage.includes('energy') || lowerMessage.includes('electricity')) {
                return "⚡ **Energy Saving Tips:**\n• Use LED bulbs\n• Unplug unused devices\n• Choose efficient appliances\n• Consider solar power";
            } else if (lowerMessage.includes('climate') || lowerMessage.includes('global warming')) {
                return "🌡️ **Climate Action Tips:**\n• Use public transport\n• Eat less meat\n• Support renewable energy\n• Plant trees";
            }
        }
        
        return response;
    }
    
    isAskingAboutQuests(message) {
        const questKeywords = ['quest', 'mission', 'challenge', 'activity', 'what can i do', 'game', 'action'];
        return questKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    isAskingAboutGettingStarted(message) {
        const startKeywords = ['start', 'begin', 'sign up', 'register', 'join', 'account', 'how to'];
        return startKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    getErrorResponse(error) {
        console.log('🚨 Generating error response for:', error.message);
        
        if (error.message.includes('API key') || error.message.includes('401')) {
            return "I'm having authentication issues! 🔐 Please check the Perplexity API key. Meanwhile, explore our environmental quests!";
        } else if (error.message.includes('credits') || error.message.includes('402')) {
            return "I've reached my usage limit! 💳 Please add credits to your Perplexity account. You can explore our environmental quests while we fix this!";
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
            return "I'm getting lots of questions right now! ⏱️ Please wait a moment and try again, or check out our environmental quests!";
        } else if (error.message.includes('alternate') || error.message.includes('invalid_message')) {
            return "I'm having a conversation flow issue! 🔄 Try starting a fresh conversation or explore our EcoQuest challenges!";
        } else {
            return "I'm experiencing a small technical hiccup! 🔧 Try asking your environmental question again, or explore our EcoQuest challenges!";
        }
    }
}
