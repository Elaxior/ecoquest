import { db } from '../config/firebase-config.js';
import { doc, updateDoc, getDoc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getNewlyEarnedAchievements } from './achievements.js';
import { showNotification } from './notifications.js';

// XP calculation constants
const XP_MULTIPLIERS = {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0
};

const LEVEL_XP_REQUIREMENTS = {
    1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
    6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
    11: 3250, 12: 3850, 13: 4500, 14: 5200, 15: 5950,
    16: 6750, 17: 7600, 18: 8500, 19: 9450, 20: 10450
};

// Calculate level from XP
export function calculateLevel(xp) {
    let level = 1;
    for (let l = 20; l >= 1; l--) {
        if (xp >= LEVEL_XP_REQUIREMENTS[l]) {
            level = l;
            break;
        }
    }
    return level;
}

// Calculate XP needed for next level
export function calculateXPForNextLevel(xp) {
    const currentLevel = calculateLevel(xp);
    const nextLevel = Math.min(currentLevel + 1, 20);
    return LEVEL_XP_REQUIREMENTS[nextLevel] - xp;
}

// Calculate XP progress percentage for current level
export function calculateXPProgress(xp) {
    const currentLevel = calculateLevel(xp);
    const currentLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel];
    const nextLevelXP = LEVEL_XP_REQUIREMENTS[Math.min(currentLevel + 1, 20)];
    
    if (currentLevel >= 20) {
        return { current: xp - currentLevelXP, total: 1000, percentage: 100 };
    }
    
    const progressXP = xp - currentLevelXP;
    const totalNeeded = nextLevelXP - currentLevelXP;
    const percentage = (progressXP / totalNeeded) * 100;
    
    return {
        current: progressXP,
        total: totalNeeded,
        percentage: Math.min(percentage, 100)
    };
}

// Award XP to user
export async function awardXP(userId, baseXP, difficulty = 'beginner', source = 'mission') {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        const multiplier = XP_MULTIPLIERS[difficulty] || 1.0;
        const finalXP = Math.round(baseXP * multiplier);
        
        const oldLevel = calculateLevel(userData.xp || 0);
        const newXP = (userData.xp || 0) + finalXP;
        const newLevel = calculateLevel(newXP);
        
        // Update user XP and level
        const updateData = {
            xp: newXP,
            level: newLevel,
            lastXPGain: {
                amount: finalXP,
                source: source,
                timestamp: new Date()
            }
        };
        
        // Update daily XP if it's a new day
        const today = new Date().toDateString();
        const lastActiveDay = userData.lastActive?.toDate()?.toDateString();
        
        if (today !== lastActiveDay) {
            updateData['stats.xpGainedToday'] = finalXP;
            updateData.lastActive = new Date();
        } else {
            updateData['stats.xpGainedToday'] = increment(finalXP);
        }
        
        await updateDoc(userRef, updateData);
        
        // Check for level up
        if (newLevel > oldLevel) {
            await handleLevelUp(userId, newLevel, oldLevel);
        }
        
        // Check for new achievements
        await checkAndAwardAchievements(userId);
        
        return {
            xpAwarded: finalXP,
            newXP: newXP,
            newLevel: newLevel,
            leveledUp: newLevel > oldLevel
        };
        
    } catch (error) {
        console.error('Error awarding XP:', error);
        throw error;
    }
}

// Handle level up rewards
async function handleLevelUp(userId, newLevel, oldLevel) {
    try {
        const bonusXP = newLevel * 25; // Bonus XP for leveling up
        
        // Show level up notification
        showNotification({
            type: 'level-up',
            title: `Level Up! 🎉`,
            message: `Congratulations! You've reached Level ${newLevel}!`,
            xpBonus: bonusXP
        });
        
        // Award bonus XP for level up
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            xp: increment(bonusXP),
            levelUpHistory: arrayUnion({
                level: newLevel,
                timestamp: new Date(),
                bonusXP: bonusXP
            })
        });
        
    } catch (error) {
        console.error('Error handling level up:', error);
    }
}

// Complete mission and award rewards
export async function completeMission(userId, questId, missionId, missionXP, difficulty = 'beginner') {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        
        // Update mission progress
        const questProgress = userData.questProgress || {};
        if (!questProgress[questId]) {
            questProgress[questId] = { completedMissions: [], startedAt: new Date() };
        }
        
        if (!questProgress[questId].completedMissions.includes(missionId)) {
            questProgress[questId].completedMissions.push(missionId);
            questProgress[questId].lastMissionCompletedAt = new Date();
        }
        
        // Update streak
        const today = new Date();
        const lastActive = userData.lastActive?.toDate();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let newStreak = userData.stats?.currentStreak || 0;
        if (!lastActive || 
            (lastActive.toDateString() === yesterday.toDateString() && 
             lastActive.toDateString() !== today.toDateString())) {
            newStreak += 1;
        } else if (lastActive.toDateString() !== today.toDateString()) {
            newStreak = 1;
        }
        
        // Update user progress
        const updateData = {
            questProgress: questProgress,
            'stats.totalMissions': increment(1),
            'stats.currentStreak': newStreak,
            'stats.longestStreak': Math.max(userData.stats?.longestStreak || 0, newStreak),
            lastActive: today
        };
        
        // Update mission type count
        const missionType = 'quiz'; // This would come from mission data
        updateData[`stats.missionsByType.${missionType}`] = increment(1);
        
        await updateDoc(userRef, updateData);
        
        // Award XP
        const xpResult = await awardXP(userId, missionXP, difficulty, 'mission');
        
        // Show mission completion notification
        showNotification({
            type: 'mission-complete',
            title: 'Mission Completed! 🎯',
            message: `Great job! You earned ${xpResult.xpAwarded} XP`,
            xpBonus: xpResult.xpAwarded
        });
        
        return {
            ...xpResult,
            streakUpdated: true,
            newStreak: newStreak
        };
        
    } catch (error) {
        console.error('Error completing mission:', error);
        throw error;
    }
}

// Complete quest and award bonus rewards
export async function completeQuest(userId, questId, questData) {
    try {
        const userRef = doc(db, 'users', userId);
        const bonusXP = Math.round(questData.xpReward * 0.2); // 20% bonus for quest completion
        
        const updateData = {
            questsCompleted: increment(1),
            [`stats.questsByCategory.${questData.category}`]: increment(1),
            [`questProgress.${questId}.completedAt`]: new Date(),
            [`questProgress.${questId}.bonusXPAwarded`]: bonusXP
        };
        
        await updateDoc(userRef, updateData);
        
        // Award bonus XP
        const xpResult = await awardXP(userId, bonusXP, questData.difficulty, 'quest_completion');
        
        // Show quest completion notification
        showNotification({
            type: 'quest-complete',
            title: 'Quest Completed! 🏆',
            message: `Amazing! You completed "${questData.title}" and earned ${bonusXP} bonus XP!`,
            xpBonus: bonusXP
        });
        
        return xpResult;
        
    } catch (error) {
        console.error('Error completing quest:', error);
        throw error;
    }
}

// Check and award new achievements
export async function checkAndAwardAchievements(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) return;
        
        const userData = userDoc.data();
        const currentBadges = userData.badges || [];
        
        // Calculate user stats for achievement checking
        const userStats = {
            level: userData.level || 1,
            totalMissions: userData.stats?.totalMissions || 0,
            currentStreak: userData.stats?.currentStreak || 0,
            questsByCategory: userData.stats?.questsByCategory || {},
            missionsByType: userData.stats?.missionsByType || {}
        };
        
        const newAchievements = getNewlyEarnedAchievements(userStats, currentBadges);
        
        if (newAchievements.length > 0) {
            // Add new badges to user
            const newBadges = newAchievements.map(achievement => ({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                color: achievement.color,
                earnedAt: new Date(),
                xpBonus: achievement.xpBonus
            }));
            
            await updateDoc(userRef, {
                badges: arrayUnion(...newBadges)
            });
            
            // Award bonus XP for achievements
            const totalBonusXP = newAchievements.reduce((sum, ach) => sum + ach.xpBonus, 0);
            if (totalBonusXP > 0) {
                await awardXP(userId, totalBonusXP, 'beginner', 'achievement');
            }
            
            // Show achievement notifications
            newAchievements.forEach(achievement => {
                showNotification({
                    type: 'achievement',
                    title: 'Achievement Unlocked! 🏅',
                    message: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
                    xpBonus: achievement.xpBonus
                });
            });
        }
        
    } catch (error) {
        console.error('Error checking achievements:', error);
    }
}
