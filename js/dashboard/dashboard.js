import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getUserData } from '../utils/user-data.js';
import { calculateLevel, calculateXPProgress } from '../utils/helpers.js';

let currentUser = null;

// Sample quest data for dashboard previews
const SAMPLE_QUESTS = [
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

// Initialize dashboard
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadDashboard();
        loadQuestPreviews();
        loadRecentActivity();
        setupQuickActions();
    }
});

// Load dashboard data
async function loadDashboard() {
    try {
        const userData = await getUserData(currentUser.uid);
        if (userData) {
            updateDashboardUI(userData);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Update dashboard UI
function updateDashboardUI(userData) {
    // Welcome message
    const displayName = userData.displayName || 'Eco-Warrior';
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${displayName}!`;
    document.getElementById('userInfo').textContent = `${userData.school || 'School'} • ${userData.state || 'State'}`;
    
    // Level and XP
    const level = calculateLevel(userData.xp || 0);
    const xpProgress = calculateXPProgress(userData.xp || 0);
    
    document.getElementById('userLevel').textContent = `Level ${level}`;
    document.getElementById('xpInfo').textContent = `${xpProgress.current} / ${xpProgress.total} XP`;
    document.getElementById('xpProgress').style.width = `${xpProgress.percentage}%`;
    
    const nextLevelXP = xpProgress.total - xpProgress.current;
    document.getElementById('nextLevelInfo').textContent = `${nextLevelXP} XP to Level ${level + 1}`;
    
    // Stats
    document.getElementById('totalXP').textContent = userData.xp || 0;
    document.getElementById('questsCompleted').textContent = userData.questsCompleted || 0;
    document.getElementById('badgesEarned').textContent = (userData.badges || []).length;
    document.getElementById('leaderboardRank').textContent = userData.rank || '--';
    
    // Additional stats
    const stats = userData.stats || {};
    document.getElementById('currentStreak').textContent = `${stats.streak || 0} day streak`;
    document.getElementById('xpGainedToday').textContent = `+${stats.xpGainedToday || 0} today`;
    document.getElementById('questsInProgress').textContent = `${stats.questsInProgress || 0} in progress`;
    document.getElementById('rankChange').textContent = userData.rankChange || 'Not ranked yet';
}

// Load quest previews
function loadQuestPreviews() {
    const container = document.getElementById('questPreviewContainer');
    const loading = document.getElementById('loadingQuests');
    
    setTimeout(() => {
        const quests = SAMPLE_QUESTS.slice(0, 3); // Show first 3 quests
        
        container.innerHTML = quests.map(quest => `
            <div class="border border-gray-200 rounded-lg p-4 hover:border-${quest.color}-300 hover:bg-${quest.color}-50 hover:bg-opacity-20 transition-all cursor-pointer" onclick="startQuest('${quest.id}')">
                <div class="flex items-start gap-4">
                    <div class="text-3xl">${quest.icon}</div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-semibold text-gray-900">${quest.title}</h3>
                            <div class="flex items-center gap-2">
                                <span class="text-xs bg-${quest.color}-100 text-${quest.color}-700 px-2 py-1 rounded-full">${quest.difficulty}</span>
                                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">+${quest.xpReward} XP</span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 mb-3">${quest.description}</p>
                        <div class="flex justify-between items-center text-xs text-gray-500">
                            <span>${quest.missions} missions • ${quest.estimatedTime}</span>
                            <span class="text-${quest.color}-600 font-medium hover:text-${quest.color}-700">Start Quest →</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        loading.style.display = 'none';
        container.style.display = 'block';
    }, 1000);
}

// Setup quick actions
function setupQuickActions() {
    // Add event listeners to quick action buttons
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            switch(action) {
                case 'new-quest':
                    window.location.href = 'quests.html';
                    break;
                case 'view-progress':
                    window.location.href = 'profile.html';
                    break;
                case 'leaderboard':
                    // Will implement in later phase
                    alert('Leaderboard coming soon!');
                    break;
            }
        });
    });
}

// Load recent activity
function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    const noActivity = document.getElementById('noActivity');
    
    // For now, show no activity message
    // In later phases, we'll populate this with real activity data
    setTimeout(() => {
        container.style.display = 'none';
        noActivity.style.display = 'block';
    }, 500);
}

// Global function for starting quests (accessible from onclick)
window.startQuest = function(questId) {
    window.location.href = `quest-detail.html?id=${questId}`;
};

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
const logoutBtnMobile = document.getElementById('logoutBtnMobile');

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}


