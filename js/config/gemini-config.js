// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyCV0d1Id8lwbTZpztabSPzwsCRg4WrSGM8'; // Replace with your actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Model configurations for different content types
export const GEMINI_MODELS = {
    quest: 'gemini-1.5-flash',
    quiz: 'gemini-1.5-flash',
    content: 'gemini-1.5-pro'
};

// Safety settings for educational content
export const SAFETY_SETTINGS = [
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
];

// Generation parameters
export const GENERATION_CONFIG = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
};

// API client configuration
export const GEMINI_CONFIG = {
    apiKey: GEMINI_API_KEY,
    apiUrl: GEMINI_API_URL,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: GENERATION_CONFIG
};
