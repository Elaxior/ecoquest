import { auth } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAllQuests, searchQuests } from './quest-data.js';

let currentUser = null;
let allQuests = [];
let filteredQuests = [];

// Initialize quest browser
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        initializeQuestBrowser();
    }
});

// Initialize quest browser
function initializeQuestBrowser() {
    setupEventListeners();
    loadQuests();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('questSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterQuests);
    }
    
    // Filter dropdowns
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    
    if (categoryFilter) categoryFilter.addEventListener('change', filterQuests);
    if (difficultyFilter) difficultyFilter.addEventListener('change', filterQuests);
    
    // Logout functionality
    setupLogoutHandlers();
}

// Load and display quests (Updated with AI content support)
async function loadQuests() {
    try {
        // Start with hardcoded quests
        const hardcodedQuests = getAllQuests();
        
        // Try to load AI-generated approved quests
        let aiQuests = [];
        try {
            // Dynamically import content generator to avoid loading issues
            const { contentGenerator } = await import('../ai-content/content-generator.js');
            aiQuests = await contentGenerator.getGeneratedQuests({
                status: 'approved',
                limit: 50
            });
            
            console.log(`Loaded ${aiQuests.length} AI-generated quests`);
        } catch (aiError) {
            console.warn('Could not load AI-generated quests, using hardcoded only:', aiError);
            // Continue with hardcoded quests only
        }
        
        // Combine both types of quests
        allQuests = [...hardcodedQuests, ...aiQuests];
        filteredQuests = [...allQuests];
        
        console.log(`Total quests available: ${allQuests.length}`);
        
        // Update quest count if element exists
        const questCount = document.getElementById('questCount');
        if (questCount) {
            questCount.textContent = `${allQuests.length} quest${allQuests.length === 1 ? '' : 's'}`;
        }
        
        renderQuests();
        
    } catch (error) {
        console.error('Error loading quests:', error);
        // Fallback to hardcoded quests only
        allQuests = getAllQuests();
        filteredQuests = [...allQuests];
        renderQuests();
    }
}

// Filter quests based on current filters
function filterQuests() {
    const searchQuery = document.getElementById('questSearch')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
    
    filteredQuests = allQuests.filter(quest => {
        // Search filter
        if (searchQuery && !quest.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !quest.description.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        
        // Category filter - handle both old format and new format
        const questCategory = quest.category || quest.categoryName?.toLowerCase().replace(/\s+/g, '-');
        if (categoryFilter && questCategory !== categoryFilter) {
            return false;
        }
        
        // Difficulty filter
        if (difficultyFilter && quest.difficulty !== difficultyFilter) {
            return false;
        }
        
        return true;
    });
    
    // Update quest count
    const questCount = document.getElementById('questCount');
    if (questCount) {
        questCount.textContent = `${filteredQuests.length} quest${filteredQuests.length === 1 ? '' : 's'}`;
    }
    
    renderQuests();
}

// Render quest grid
function renderQuests() {
    const questGrid = document.getElementById('questGrid');
    const loadingElement = document.getElementById('loadingQuests');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    if (!questGrid) return;
    
    if (filteredQuests.length === 0) {
        questGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">No quests found</h3>
                <p class="text-gray-600">Try adjusting your search filters.</p>
            </div>
        `;
        return;
    }
    
    const questsHtml = filteredQuests.map(quest => {
        const colorClasses = {
            blue: 'border-blue-300 bg-blue-50 text-blue-700',
            green: 'border-green-300 bg-green-50 text-green-700',
            yellow: 'border-yellow-300 bg-yellow-50 text-yellow-700',
            purple: 'border-purple-300 bg-purple-50 text-purple-700',
            red: 'border-red-300 bg-red-50 text-red-700',
            orange: 'border-orange-300 bg-orange-50 text-orange-700'
        };
        
        const colorClass = colorClasses[quest.color] || colorClasses.blue;
        const categoryName = quest.categoryName || quest.category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return `
            <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:${colorClass.split(' ')[0]}" onclick="startQuest('${quest.id}')">
                <div class="p-6">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="text-4xl">${quest.icon || '🌱'}</div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${quest.title}</h3>
                                ${quest.createdBy === 'ai' ? '<div class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">AI</div>' : ''}
                            </div>
                            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${quest.description}</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="bg-${quest.color}-100 text-${quest.color}-700 px-2 py-1 rounded-full text-xs font-medium">
                                    ${categoryName}
                                </span>
                                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                    ${quest.difficulty}
                                </span>
                                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                    +${quest.xpReward} XP
                                </span>
                                ${quest.targetState ? `<span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">${quest.targetState}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <span>⏱️ ${quest.estimatedTime || 'Variable'}</span>
                        <span class="text-${quest.color}-600 font-medium hover:text-${quest.color}-700">
                            Start Quest →
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    questGrid.innerHTML = questsHtml;
}

// Global function for starting quests
window.startQuest = function(questId) {
    console.log('Starting quest:', questId);
    window.location.href = `quest-detail.html?id=${questId}`;
};

// Setup logout handlers
function setupLogoutHandlers() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    [logoutBtn, logoutBtnMobile].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', async () => {
                try {
                    await signOut(auth);
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        }
    });
}
