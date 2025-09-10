import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getQuestById } from './quest-data.js';
import { completeMission, completeQuest, awardXP } from '../gamification/rewards.js';

let currentUser = null;
let currentQuest = null;
let userProgress = null;

// Initialize quest detail page
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadQuestDetail();
    }
});

// Load quest detail from URL parameter (FIXED - Checks both sources)
async function loadQuestDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const questId = urlParams.get('id');
    
    if (!questId) {
        window.location.href = 'quests.html';
        return;
    }
    
    try {
        // First try to load from hardcoded quests
        currentQuest = getQuestById(questId);
        
        // If not found, try to load from AI-generated approved quests
        if (!currentQuest) {
            console.log('Quest not found in hardcoded data, checking AI-generated quests...');
            const questDoc = await getDoc(doc(db, 'quests', questId));
            
            if (questDoc.exists()) {
                currentQuest = { id: questDoc.id, ...questDoc.data() };
                console.log('Loaded AI-generated quest:', currentQuest);
            }
        }
        
        if (!currentQuest) {
            showQuestNotFound();
            return;
        }
        
        // Load user progress
        await loadUserProgress();
        
        // Render quest
        renderQuestDetail();
        
    } catch (error) {
        console.error('Error loading quest:', error);
        showQuestNotFound();
    }
}

// Load user progress for this quest
async function loadUserProgress() {
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            userProgress = userData.questProgress?.[currentQuest.id] || {
                completedMissions: [],
                startedAt: null,
                completedAt: null
            };
        } else {
            userProgress = { completedMissions: [], startedAt: null, completedAt: null };
        }
        
        console.log('User progress loaded:', userProgress);
    } catch (error) {
        console.error('Error loading user progress:', error);
        userProgress = { completedMissions: [], startedAt: null, completedAt: null };
    }
}

// Show quest not found error
function showQuestNotFound() {
    document.getElementById('questHeader').innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-4">❌</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Quest Not Found</h2>
            <p class="text-gray-600 mb-6">The requested quest could not be found.</p>
            <a href="quests.html" class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all">
                Back to Quests
            </a>
        </div>
    `;
}

// Render quest detail (UPDATED - Better progress tracking)
function renderQuestDetail() {
    // Update breadcrumb
    document.getElementById('questBreadcrumb').textContent = currentQuest.title;
    
    // Calculate progress
    const completedCount = userProgress.completedMissions.length;
    const totalCount = currentQuest.missions.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const isQuestCompleted = userProgress.completedAt !== null;
    
    // Get quest color (default to blue for AI quests)
    const questColor = currentQuest.color || 'blue';
    const colorClass = questColor === 'blue' ? 'blue' : questColor;
    
    // Render quest header with AI badge
    const questHeader = `
        <div class="text-center">
            <div class="text-6xl mb-4">${currentQuest.icon || '🌱'}</div>
            <div class="flex justify-center items-center gap-3 mb-4">
                <h1 class="text-3xl font-bold text-gray-900">${currentQuest.title}</h1>
                ${currentQuest.source === 'ai_generated' ? '<div class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">AI Generated</div>' : ''}
            </div>
            <p class="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">${currentQuest.description}</p>
            
            <div class="flex flex-wrap justify-center gap-4 mb-6">
                <div class="bg-${colorClass}-100 text-${colorClass}-700 px-4 py-2 rounded-full font-medium">
                    ${currentQuest.categoryName || currentQuest.category}
                </div>
                <div class="bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
                    ${currentQuest.difficulty} Level
                </div>
                <div class="bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
                    ⏱️ ${currentQuest.estimatedTime}
                </div>
                <div class="bg-accent text-white px-4 py-2 rounded-full font-semibold">
                    +${currentQuest.xpReward} XP Total
                </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <div class="text-sm text-gray-600 mb-2">Quest Progress</div>
                <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div class="bg-${colorClass}-500 h-3 rounded-full transition-all duration-300" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="text-sm font-medium text-gray-900">
                    ${completedCount} of ${totalCount} missions completed
                    ${isQuestCompleted ? ' - Quest Complete! 🎉' : ''}
                </div>
                ${!userProgress.startedAt && !isQuestCompleted ? `
                    <button onclick="startQuest()" class="mt-4 bg-${colorClass}-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-${colorClass}-600 transition-all">
                        Start Quest
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('questHeader').innerHTML = questHeader;
    
    // Render missions
    renderMissions();
    
    // Show mission section
    document.getElementById('missionSection').style.display = 'block';
}

// Render missions (UPDATED - Real progress tracking)
function renderMissions() {
    const missionList = document.getElementById('missionList');
    const questColor = currentQuest.color || 'blue';
    
    const missionsHtml = currentQuest.missions.map((mission, index) => {
        const isCompleted = userProgress.completedMissions.includes(mission.id);
        const isLocked = index > 0 && !userProgress.completedMissions.includes(currentQuest.missions[index - 1].id);
        const canStart = userProgress.startedAt && !isCompleted && !isLocked;
        
        const statusIcon = isCompleted ? '✅' : (isLocked ? '🔒' : (canStart ? '📝' : '⏳'));
        const statusText = isCompleted ? 'Completed' : (isLocked ? 'Locked' : (canStart ? 'Start Mission' : 'Ready'));
        const buttonClass = isCompleted ? 'bg-green-500 text-white cursor-default' : 
                          isLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                          `bg-${questColor}-500 text-white hover:bg-${questColor}-600`;
        
        return `
            <div class="border border-gray-200 rounded-lg p-6 ${isLocked ? 'opacity-50' : 'hover:border-' + questColor + '-300 transition-all'}">
                <div class="flex items-start gap-4">
                    <div class="text-3xl">${statusIcon}</div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-lg font-semibold text-gray-900">Mission ${index + 1}: ${mission.title}</h3>
                            <span class="bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">+${mission.xpReward} XP</span>
                        </div>
                        <p class="text-gray-600 mb-4">${mission.description}</p>
                        <div class="flex justify-between items-center">
                            <div class="text-sm text-gray-500">
                                Type: ${mission.type.charAt(0).toUpperCase() + mission.type.slice(1)}
                            </div>
                            <button onclick="handleMissionAction('${mission.id}', '${mission.type}', ${index})" 
                                    class="px-4 py-2 rounded-lg font-medium transition-all ${buttonClass}"
                                    ${isLocked || isCompleted ? 'disabled' : ''}>
                                ${statusText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    missionList.innerHTML = missionsHtml;
}

// Fixed quest start function with better error handling
window.startQuest = async function() {
    try {
        console.log('Starting quest for user:', currentUser.uid);
        console.log('Quest ID:', currentQuest.id);
        
        // Create user document if it doesn't exist
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            // Create initial user document
            await setDoc(userRef, {
                email: currentUser.email,
                questProgress: {},
                xp: 0,
                level: 1,
                stats: {
                    totalMissions: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    questsByCategory: {},
                    missionsByType: {}
                },
                badges: [],
                createdAt: new Date(),
                lastActive: new Date()
            });
        }
        
        // Update quest progress
        await updateDoc(userRef, {
            [`questProgress.${currentQuest.id}.startedAt`]: new Date(),
            [`questProgress.${currentQuest.id}.completedMissions`]: [],
            [`questProgress.${currentQuest.id}.missionResponses`]: {},
            lastActive: new Date()
        });
        
        // Update local progress
        userProgress.startedAt = new Date();
        userProgress.completedMissions = [];
        
        // Re-render to show updated state
        renderQuestDetail();
        
        showNotification('Quest started successfully! 🎯', 'success');
        
    } catch (error) {
        console.error('Error starting quest:', error);
        console.error('Error details:', error.code, error.message);
        
        // Provide specific error messages
        if (error.code === 'permission-denied') {
            showNotification('Permission denied. Please refresh and try again.', 'error');
        } else if (error.code === 'not-found') {
            showNotification('Quest not found. Please check if it still exists.', 'error');
        } else {
            showNotification('Error starting quest: ' + error.message, 'error');
        }
    }
};


// Handle mission action (IMPLEMENTED - Mission completion system)
window.handleMissionAction = function(missionId, missionType, missionIndex) {
    const mission = currentQuest.missions.find(m => m.id === missionId);
    if (!mission) return;
    
    // Show mission interface based on type
    showMissionInterface(mission, missionIndex);
};

// Show mission interface (IMPLEMENTED)
function showMissionInterface(mission, missionIndex) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.id = 'missionModal';
    
    let missionContent = '';
    
    switch (mission.type) {
        case 'quiz':
            missionContent = createQuizInterface(mission);
            break;
        case 'photo':
            missionContent = createPhotoInterface(mission);
            break;
        case 'text':
            missionContent = createTextInterface(mission);
            break;
        case 'tracker':
            missionContent = createTrackerInterface(mission);
            break;
        default:
            missionContent = '<p class="text-gray-600">Mission type not supported yet.</p>';
    }
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-900">${mission.title}</h2>
                    <button onclick="closeMissionModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <p class="text-gray-600 mt-2">${mission.description}</p>
            </div>
            <div class="p-6">
                ${missionContent}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Create quiz interface
function createQuizInterface(mission) {
    const questions = mission.content?.questions || [];
    
    return `
        <div class="space-y-6">
            ${questions.map((q, index) => `
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-900 mb-3">Question ${index + 1}: ${q.question}</h3>
                    <div class="space-y-2">
                        ${q.options.map((option, optIndex) => `
                            <label class="flex items-center">
                                <input type="radio" name="question_${index}" value="${optIndex}" class="mr-2">
                                <span class="text-gray-700">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            <button onclick="submitQuiz('${mission.id}')" class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark">
                Submit Quiz
            </button>
        </div>
    `;
}

// Create photo interface
function createPhotoInterface(mission) {
    return `
        <div class="space-y-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div class="text-4xl mb-2">📷</div>
                <p class="text-gray-600 mb-4">${mission.content?.instructions || 'Take photos as requested'}</p>
                <input type="file" accept="image/*" multiple class="hidden" id="photoInput">
                <label for="photoInput" class="bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-dark">
                    Choose Photos
                </label>
            </div>
            <div id="photoPreview" class="grid grid-cols-2 gap-4"></div>
            <button onclick="submitPhoto('${mission.id}')" class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark">
                Submit Photos
            </button>
        </div>
    `;
}

// Create text interface
function createTextInterface(mission) {
    const minWords = mission.content?.minWords || 100;
    
    return `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Your Response:</label>
                <textarea id="textResponse" rows="8" class="w-full border border-gray-300 rounded-lg p-3" 
                         placeholder="${mission.content?.prompt || 'Write your response here...'}"
                         oninput="updateWordCount()"></textarea>
                <div class="text-sm text-gray-500 mt-1">
                    <span id="wordCount">0</span> / ${minWords} words minimum
                </div>
            </div>
            <button onclick="submitText('${mission.id}', ${minWords})" class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark">
                Submit Response
            </button>
        </div>
    `;
}

// Create tracker interface
function createTrackerInterface(mission) {
    return `
        <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="text-yellow-800">
                    <strong>Tracking Period:</strong> ${mission.content?.trackingDays || 7} days<br>
                    <strong>Instructions:</strong> ${mission.content?.instructions || 'Track your environmental actions daily'}
                </div>
            </div>
            <div class="text-center">
                <p class="text-gray-600 mb-4">This mission requires tracking over multiple days.</p>
                <button onclick="startTracking('${mission.id}')" class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark">
                    Start Tracking
                </button>
            </div>
        </div>
    `;
}

// Mission submission functions
window.submitQuiz = async function(missionId) {
    try {
        const mission = currentQuest.missions.find(m => m.id === missionId);
        const questions = mission.content?.questions || [];
        const answers = [];
        let correctCount = 0;
        
        questions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="question_${index}"]:checked`);
            if (selected) {
                const answer = parseInt(selected.value);
                answers.push(answer);
                if (answer === q.correct) correctCount++;
            } else {
                answers.push(-1);
            }
        });
        
        const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
        
        await completeMissionWithRewards(missionId, {
            type: 'quiz',
            answers: answers,
            score: score,
            correctCount: correctCount,
            totalQuestions: questions.length
        });
        
        closeMissionModal();
        showNotification(`Quiz completed! Score: ${score.toFixed(1)}%`, 'success');
        
    } catch (error) {
        console.error('Error submitting quiz:', error);
        showNotification('Error submitting quiz. Please try again.', 'error');
    }
};

window.submitPhoto = async function(missionId) {
    const fileInput = document.getElementById('photoInput');
    if (fileInput.files.length === 0) {
        showNotification('Please select at least one photo.', 'error');
        return;
    }
    
    try {
        await completeMissionWithRewards(missionId, {
            type: 'photo',
            photoCount: fileInput.files.length,
            submittedAt: new Date()
        });
        
        closeMissionModal();
        showNotification('Photos submitted successfully!', 'success');
        
    } catch (error) {
        console.error('Error submitting photo:', error);
        showNotification('Error submitting photos. Please try again.', 'error');
    }
};

window.submitText = async function(missionId, minWords) {
    const textArea = document.getElementById('textResponse');
    const text = textArea.value.trim();
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount < minWords) {
        showNotification(`Please write at least ${minWords} words. Current: ${wordCount}`, 'error');
        return;
    }
    
    try {
        await completeMissionWithRewards(missionId, {
            type: 'text',
            response: text,
            wordCount: wordCount
        });
        
        closeMissionModal();
        showNotification('Response submitted successfully!', 'success');
        
    } catch (error) {
        console.error('Error submitting text:', error);
        showNotification('Error submitting response. Please try again.', 'error');
    }
};

window.startTracking = async function(missionId) {
    try {
        await completeMissionWithRewards(missionId, {
            type: 'tracker',
            trackingStarted: true,
            startDate: new Date()
        });
        
        closeMissionModal();
        showNotification('Tracking started! Check back daily to log progress.', 'success');
        
    } catch (error) {
        console.error('Error starting tracking:', error);
        showNotification('Error starting tracking. Please try again.', 'error');
    }
};

// Complete mission with rewards integration
async function completeMissionWithRewards(missionId, missionData) {
    try {
        const mission = currentQuest.missions.find(m => m.id === missionId);
        if (!mission) throw new Error('Mission not found');
        
        // Complete mission using rewards system
        const result = await completeMission(
            currentUser.uid, 
            currentQuest.id, 
            missionId, 
            mission.xpReward, 
            currentQuest.difficulty
        );
        
        // Update local progress
        if (!userProgress.completedMissions.includes(missionId)) {
            userProgress.completedMissions.push(missionId);
        }
        
        // Check if quest is complete
        if (userProgress.completedMissions.length === currentQuest.missions.length) {
            await completeQuest(currentUser.uid, currentQuest.id, currentQuest);
            userProgress.completedAt = new Date();
        }
        
        // Save mission response data
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            [`questProgress.${currentQuest.id}.missionResponses.${missionId}`]: {
                ...missionData,
                completedAt: new Date(),
                xpEarned: result.xpAwarded
            }
        });
        
        // Re-render quest
        renderQuestDetail();
        
    } catch (error) {
        console.error('Error completing mission:', error);
        throw error;
    }
}

// Helper functions
window.closeMissionModal = function() {
    const modal = document.getElementById('missionModal');
    if (modal) {
        document.body.removeChild(modal);
    }
};

window.updateWordCount = function() {
    const textArea = document.getElementById('textResponse');
    const wordCountSpan = document.getElementById('wordCount');
    if (textArea && wordCountSpan) {
        const words = textArea.value.trim().split(/\s+/);
        const count = textArea.value.trim() === '' ? 0 : words.length;
        wordCountSpan.textContent = count;
    }
};

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Setup logout handlers
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
