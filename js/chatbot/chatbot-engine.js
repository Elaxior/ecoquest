// js/chatbot/chatbot-engine.js
import { GEMINI_CONFIG } from '../config/gemini-config.js';

export class ChatbotEngine {
    constructor() {
        this.apiKey = GEMINI_CONFIG.apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.systemPrompt = this.createSystemPrompt();
    }
    
    createSystemPrompt() {
        return `You are Eco-Buddy, the friendly environmental education chatbot for EcoQuest platform. Your role is to help students learn about environmental topics and use the EcoQuest platform effectively.

PERSONALITY:
- Friendly, encouraging, and knowledgeable about environmental science
- Use emojis moderately to make responses engaging 
- Keep responses concise but informative (2-3 sentences max)
- Always stay positive about environmental action

KNOWLEDGE AREAS:
- Environmental topics: water conservation, waste management, energy saving, biodiversity, climate change
- EcoQuest platform: quests, missions, XP system, achievements, leaderboards
- Indian environmental issues: pollution in Delhi, water scarcity, renewable energy

RESPONSE GUIDELINES:
- For quest questions: Recommend specific quests and explain XP rewards
- For environmental questions: Provide educational but simple explanations
- For platform help: Guide users to relevant sections
- Always encourage environmental action and learning

AVAILABLE QUESTS TO RECOMMEND:
- "Delhi's Water Warriors!" (Water conservation, 250 XP, 5 missions)
- Waste management quests
- Energy conservation challenges
- Biodiversity protection missions

If asked about technical issues, politely direct them to contact support while offering general help.`;
    }
    
    async generateResponse(userMessage, conversationHistory = []) {
        try {
            // Build conversation context
            const context = this.buildContext(userMessage, conversationHistory);
            
            const response = await this.callGeminiAPI(context);
            
            // Post-process response for EcoQuest platform
            return this.processResponse(response, userMessage);
            
        } catch (error) {
            console.error('Chatbot generation error:', error);
            return this.getErrorResponse(error);
        }
    }
    
    buildContext(userMessage, history) {
        // Start with system prompt
        let context = this.systemPrompt + "\n\nCONVERSATION:\n";
        
        // Add recent conversation history (last 6 messages)
        const recentHistory = history.slice(-6);
        recentHistory.forEach(msg => {
            const role = msg.sender === 'user' ? 'User' : 'Eco-Buddy';
            context += `${role}: ${msg.content}\n`;
        });
        
        // Add current user message
        context += `User: ${userMessage}\nEco-Buddy:`;
        
        return context;
    }
    
    async callGeminiAPI(prompt) {
        const requestData = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 150, // Keep responses concise
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", 
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
        
        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response format from Gemini API');
        }
        
        return data.candidates[0].content.parts[0].text;
    }
    
    processResponse(response, userMessage) {
        // Clean up response
        let processedResponse = response.trim();
        
        // Add quest links for specific topics
        if (this.isAskingAboutQuests(userMessage)) {
            processedResponse += "\n\n[Visit our Quests section to start your environmental journey!]";
        }
        
        // Add registration prompt for new users
        if (this.isAskingAboutGettingStarted(userMessage)) {
            processedResponse += "\n\n[Ready to join? Click 'Register' to create your EcoQuest account!]";
        }
        
        return processedResponse;
    }
    
    isAskingAboutQuests(message) {
        const questKeywords = ['quest', 'mission', 'challenge', 'activity', 'what can i do'];
        return questKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    isAskingAboutGettingStarted(message) {
        const startKeywords = ['how to start', 'get started', 'begin', 'sign up', 'register'];
        return startKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }
    
    getErrorResponse(error) {
        if (error.message.includes('503') || error.message.includes('overloaded')) {
            return "I'm experiencing high demand right now! 🌱 Please try asking again in a moment. In the meantime, feel free to explore our quests!";
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            return "I've reached my daily chat limit! 📊 But don't worry - you can still explore EcoQuest and start your environmental learning journey!";
        } else {
            return "Oops! I'm having a small technical hiccup 🔧 Try asking again, or explore our quests while I get back on track!";
        }
    }
}
