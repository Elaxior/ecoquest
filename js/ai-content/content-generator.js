import { db } from '../config/firebase-config.js';
import { collection, addDoc, doc, setDoc, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { geminiClient, validateGeneratedQuest } from './gemini-client.js';
import { createQuestPrompt, createRegionalPrompt } from './prompt-templates.js';

// Content generation and management system
export class ContentGenerator {
    constructor() {
        this.geminiClient = geminiClient;
    }
    
    // Generate and save quest to Firestore
    async generateAndSaveQuest(params) {
        try {
            console.log('Generating quest with params:', params);
            
            // Generate quest using Gemini API
            const generatedQuest = await this.geminiClient.generateQuest(params);
            
            // Validate generated content
            validateGeneratedQuest(generatedQuest);
            
            // Add metadata
            const questData = {
                ...generatedQuest,
                id: this.generateQuestId(generatedQuest.category, generatedQuest.title),
                createdAt: new Date(),
                createdBy: 'ai',
                status: 'pending_review', // Requires admin approval
                generationParams: params,
                views: 0,
                completions: 0,
                rating: 0,
                reviews: []
            };
            
            // Save to Firestore
            const questRef = doc(db, 'ai_generated_quests', questData.id);
            await setDoc(questRef, questData);
            
            console.log('Quest saved successfully:', questData.id);
            return questData;
            
        } catch (error) {
            console.error('Error generating and saving quest:', error);
            throw error;
        }
    }
    
    // Generate multiple quests for different categories
    async generateQuestBatch(baseParams, categories) {
        const results = [];
        
        for (const category of categories) {
            try {
                const categoryParams = { ...baseParams, category };
                const quest = await this.generateAndSaveQuest(categoryParams);
                results.push({ category, quest, success: true });
                
                // Rate limiting delay
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Error generating quest for ${category}:`, error);
                results.push({ category, error: error.message, success: false });
            }
        }
        
        return results;
    }
    
    // Generate state-specific content
    async generateStateSpecificContent(baseParams, targetStates) {
        const results = {};
        
        for (const state of targetStates) {
            try {
                console.log(`Generating content for ${state}...`);
                
                const stateParams = {
                    ...baseParams,
                    userState: state,
                    count: 2 // Generate 2 quests per state
                };
                
                const quests = await this.geminiClient.generateQuests(stateParams);
                
                for (const quest of quests) {
                    const questData = {
                        ...quest,
                        id: this.generateQuestId(quest.category, quest.title),
                        createdAt: new Date(),
                        createdBy: 'ai',
                        status: 'pending_review',
                        targetState: state,
                        generationParams: stateParams
                    };
                    
                    const questRef = doc(db, 'ai_generated_quests', questData.id);
                    await setDoc(questRef, questData);
                }
                
                results[state] = { success: true, questCount: quests.length };
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (error) {
                console.error(`Error generating content for ${state}:`, error);
                results[state] = { success: false, error: error.message };
            }
        }
        
        return results;
    }
    
    // Get AI-generated quests from Firestore
    async getGeneratedQuests(filters = {}) {
        try {
            let questQuery = collection(db, 'ai_generated_quests');
            
            // Apply filters
            if (filters.status) {
                questQuery = query(questQuery, where('status', '==', filters.status));
            }
            
            if (filters.category) {
                questQuery = query(questQuery, where('category', '==', filters.category));
            }
            
            if (filters.targetState) {
                questQuery = query(questQuery, where('targetState', '==', filters.targetState));
            }
            
            // Order by creation date
            questQuery = query(questQuery, orderBy('createdAt', 'desc'));
            
            // Limit results
            if (filters.limit) {
                questQuery = query(questQuery, limit(filters.limit));
            }
            
            const snapshot = await getDocs(questQuery);
            const quests = [];
            
            snapshot.forEach(doc => {
                quests.push({ id: doc.id, ...doc.data() });
            });
            
            return quests;
            
        } catch (error) {
            console.error('Error fetching generated quests:', error);
            throw error;
        }
    }
    
    // Approve quest for public use
    async approveQuest(questId, adminId) {
        try {
            const questRef = doc(db, 'ai_generated_quests', questId);
            await updateDoc(questRef, {
                status: 'approved',
                approvedBy: adminId,
                approvedAt: new Date(),
                publishedAt: new Date()
            });
            
            // Copy to main quests collection
            const questDoc = await getDoc(questRef);
            if (questDoc.exists()) {
                const questData = questDoc.data();
                const publicQuestRef = doc(db, 'quests', questId);
                await setDoc(publicQuestRef, {
                    ...questData,
                    source: 'ai_generated',
                    originalId: questId
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error approving quest:', error);
            throw error;
        }
    }
    
    // Generate unique quest ID
    generateQuestId(category, title) {
        const sanitized = title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        const timestamp = Date.now().toString().slice(-6);
        return `${category}-${sanitized}-${timestamp}`;
    }
    
    // Content quality scoring
    async scoreQuestQuality(quest) {
        let score = 0;
        
        // Check completeness
        if (quest.title && quest.description) score += 20;
        if (quest.missions && quest.missions.length >= 4) score += 30;
        
        // Check content quality
        if (quest.description.length >= 100) score += 20;
        if (quest.missions.every(m => m.description && m.content)) score += 20;
        
        // Check educational value
        if (quest.xpReward >= 100 && quest.xpReward <= 300) score += 10;
        
        return Math.min(score, 100);
    }
}

// Global instance
export const contentGenerator = new ContentGenerator();

// Utility functions for content management
export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

export const ENVIRONMENTAL_CATEGORIES = [
    'water-conservation',
    'waste-management', 
    'energy-saving',
    'biodiversity',
    'air-quality',
    'climate-action',
    'sustainable-agriculture',
    'renewable-energy'
];

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

export const GRADE_LEVELS = [6, 7, 8, 9, 10, 11, 12];
