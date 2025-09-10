// Achievement and badge definitions
export const ACHIEVEMENTS = {
    // Water Conservation Badges
    'water-warrior': {
        id: 'water-warrior',
        name: 'Water Warrior',
        description: 'Complete your first water conservation quest',
        icon: '💧',
        color: 'blue',
        type: 'quest_completion',
        requirement: { category: 'water-conservation', count: 1 },
        xpBonus: 50
    },
    'water-champion': {
        id: 'water-champion',
        name: 'Water Champion',
        description: 'Complete 3 water conservation quests',
        icon: '🌊',
        color: 'blue',
        type: 'quest_completion',
        requirement: { category: 'water-conservation', count: 3 },
        xpBonus: 100
    },
    
    // Waste Management Badges
    'recycling-rookie': {
        id: 'recycling-rookie',
        name: 'Recycling Rookie',
        description: 'Complete your first waste management quest',
        icon: '♻️',
        color: 'green',
        type: 'quest_completion',
        requirement: { category: 'waste-management', count: 1 },
        xpBonus: 50
    },
    'waste-wizard': {
        id: 'waste-wizard',
        name: 'Waste Wizard',
        description: 'Complete 5 waste management quests',
        icon: '🧙‍♂️',
        color: 'green',
        type: 'quest_completion',
        requirement: { category: 'waste-management', count: 5 },
        xpBonus: 150
    },
    
    // Energy Conservation Badges
    'energy-saver': {
        id: 'energy-saver',
        name: 'Energy Saver',
        description: 'Complete your first energy conservation quest',
        icon: '⚡',
        color: 'yellow',
        type: 'quest_completion',
        requirement: { category: 'energy-saving', count: 1 },
        xpBonus: 50
    },
    
    // XP Level Badges
    'eco-apprentice': {
        id: 'eco-apprentice',
        name: 'Eco Apprentice',
        description: 'Reach Level 5',
        icon: '🌱',
        color: 'green',
        type: 'level_milestone',
        requirement: { level: 5 },
        xpBonus: 100
    },
    'eco-champion': {
        id: 'eco-champion',
        name: 'Eco Champion',
        description: 'Reach Level 10',
        icon: '🏆',
        color: 'gold',
        type: 'level_milestone',
        requirement: { level: 10 },
        xpBonus: 200
    },
    'eco-master': {
        id: 'eco-master',
        name: 'Eco Master',
        description: 'Reach Level 20',
        icon: '👑',
        color: 'purple',
        type: 'level_milestone',
        requirement: { level: 20 },
        xpBonus: 500
    },
    
    // Streak Badges
    'consistent-learner': {
        id: 'consistent-learner',
        name: 'Consistent Learner',
        description: 'Complete missions for 7 days in a row',
        icon: '🔥',
        color: 'orange',
        type: 'streak',
        requirement: { streak: 7 },
        xpBonus: 150
    },
    'dedication-master': {
        id: 'dedication-master',
        name: 'Dedication Master',
        description: 'Complete missions for 30 days in a row',
        icon: '💪',
        color: 'red',
        type: 'streak',
        requirement: { streak: 30 },
        xpBonus: 500
    },
    
    // Mission Count Badges
    'mission-starter': {
        id: 'mission-starter',
        name: 'Mission Starter',
        description: 'Complete 10 missions',
        icon: '🎯',
        color: 'blue',
        type: 'mission_count',
        requirement: { missions: 10 },
        xpBonus: 100
    },
    'mission-expert': {
        id: 'mission-expert',
        name: 'Mission Expert',
        description: 'Complete 50 missions',
        icon: '🎖️',
        color: 'purple',
        type: 'mission_count',
        requirement: { missions: 50 },
        xpBonus: 300
    },
    
    // Photo Mission Badges
    'eco-photographer': {
        id: 'eco-photographer',
        name: 'Eco Photographer',
        description: 'Complete 5 photo missions',
        icon: '📸',
        color: 'indigo',
        type: 'mission_type',
        requirement: { type: 'photo', count: 5 },
        xpBonus: 100
    }
};

// Get all achievements
export function getAllAchievements() {
    return Object.values(ACHIEVEMENTS);
}

// Get achievement by ID
export function getAchievementById(id) {
    return ACHIEVEMENTS[id] || null;
}

// Check if user qualifies for achievement
export function checkAchievementEligibility(achievement, userStats) {
    switch (achievement.type) {
        case 'quest_completion':
            const categoryCount = userStats.questsByCategory?.[achievement.requirement.category] || 0;
            return categoryCount >= achievement.requirement.count;
            
        case 'level_milestone':
            return userStats.level >= achievement.requirement.level;
            
        case 'streak':
            return userStats.currentStreak >= achievement.requirement.streak;
            
        case 'mission_count':
            return userStats.totalMissions >= achievement.requirement.missions;
            
        case 'mission_type':
            const typeCount = userStats.missionsByType?.[achievement.requirement.type] || 0;
            return typeCount >= achievement.requirement.count;
            
        default:
            return false;
    }
}

// Get newly earned achievements
export function getNewlyEarnedAchievements(userStats, currentBadges = []) {
    const currentBadgeIds = currentBadges.map(badge => badge.id);
    const newlyEarned = [];
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (!currentBadgeIds.includes(achievement.id) && 
            checkAchievementEligibility(achievement, userStats)) {
            newlyEarned.push(achievement);
        }
    });
    
    return newlyEarned;
}
