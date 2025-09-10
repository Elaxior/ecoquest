import { db } from '../config/firebase-config.js';
import { doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Get user data
export async function getUserData(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// Update user profile
export async function updateUserProfile(userId, profileData) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...profileData,
            lastUpdated: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// Update user stats
export async function updateUserStats(userId, stats) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            stats: stats,
            lastStatsUpdate: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating stats:', error);
        throw error;
    }
}

// Add XP to user
export async function addXP(userId, xpAmount, source = 'quest') {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const currentData = userDoc.data();
            const newXP = (currentData.xp || 0) + xpAmount;
            const newLevel = Math.floor(newXP / 100) + 1;
            
            await updateDoc(doc(db, 'users', userId), {
                xp: newXP,
                level: newLevel,
                lastXPGain: {
                    amount: xpAmount,
                    source: source,
                    timestamp: new Date()
                }
            });
            
            return { newXP, newLevel, leveledUp: newLevel > (currentData.level || 1) };
        }
        return null;
    } catch (error) {
        console.error('Error adding XP:', error);
        throw error;
    }
}

// Get sample quest data (temporary for Phase 2)
export function getSampleQuests() {
    return [
        {
            id: 'water-conservation-basics',
            title: 'Water Conservation Basics',
            description: 'Learn essential water-saving techniques for your daily routine',
            category: 'Water Conservation',
            difficulty: 'Beginner',
            estimatedTime: '20 minutes',
            xpReward: 50,
            icon: '💧',
            color: 'blue',
            missions: 3,
            completed: false
        },
        {
            id: 'waste-segregation',
            title: 'Smart Waste Segregation',
            description: 'Master the art of proper waste sorting and recycling',
            category: 'Waste Management',
            difficulty: 'Beginner',
            estimatedTime: '30 minutes',
            xpReward: 75,
            icon: '♻️',
            color: 'green',
            missions: 4,
            completed: false
        },
        {
            id: 'energy-saving',
            title: 'Energy Saving Champion',
            description: 'Discover simple ways to reduce energy consumption at home',
            category: 'Energy Conservation',
            difficulty: 'Intermediate',
            estimatedTime: '45 minutes',
            xpReward: 100,
            icon: '⚡',
            color: 'yellow',
            missions: 5,
            completed: false
        }
    ];
}
