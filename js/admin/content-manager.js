import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { contentGenerator, ENVIRONMENTAL_CATEGORIES, INDIAN_STATES } from '../ai-content/content-generator.js';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, getCountFromServer, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let currentReviewQuest = null;

// Initialize admin dashboard
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Check if user is admin (you can implement role-based access)
        const isAdmin = await checkAdminAccess(user);
        if (!isAdmin) {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'dashboard.html';
            return;
        }
        
        currentUser = user;
        document.getElementById('adminUser').textContent = user.email;
        
        await loadDashboardStats();
        await loadPendingQuests();
        setupEventListeners();
    } else {
        window.location.href = 'login.html';
    }
});

// Check admin access (implement your own logic)
async function checkAdminAccess(user) {
    // For demo purposes, allow any authenticated user
    // In production, check user roles in Firestore
    return true;
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Count pending quests
        const pendingQuery = query(
            collection(db, 'ai_generated_quests'),
            where('status', '==', 'pending_review')
        );
        const pendingSnapshot = await getCountFromServer(pendingQuery);
        document.getElementById('pendingCount').textContent = pendingSnapshot.data().count;
        
        // Count approved quests
        const approvedQuery = query(
            collection(db, 'ai_generated_quests'),
            where('status', '==', 'approved')
        );
        const approvedSnapshot = await getCountFromServer(approvedQuery);
        document.getElementById('approvedCount').textContent = approvedSnapshot.data().count;
        
        // Total quests
        const totalSnapshot = await getCountFromServer(collection(db, 'ai_generated_quests'));
        document.getElementById('totalQuests').textContent = totalSnapshot.data().count;
        
        // Active users (simplified)
        const usersSnapshot = await getCountFromServer(collection(db, 'users'));
        document.getElementById('activeUsers').textContent = usersSnapshot.data().count;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load pending quests for review
async function loadPendingQuests() {
    try {
        const quests = await contentGenerator.getGeneratedQuests({
            status: 'pending_review',
            limit: 20
        });
        
        const container = document.getElementById('pendingQuests');
        const noPending = document.getElementById('noPending');
        
        if (quests.length === 0) {
            container.innerHTML = '';
            noPending.classList.remove('hidden');
            return;
        }
        
        noPending.classList.add('hidden');
        
        container.innerHTML = quests.map(quest => `
            <div class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-2xl">${quest.icon}</span>
                            <h3 class="font-semibold text-gray-900">${quest.title}</h3>
                            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                ${quest.category}
                            </span>
                            <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                ${quest.difficulty}
                            </span>
                        </div>
                        <p class="text-gray-600 text-sm mb-3">${quest.description.substring(0, 150)}...</p>
                        <div class="flex items-center gap-4 text-xs text-gray-500">
                            <span>📅 ${quest.createdAt.toDate().toLocaleDateString()}</span>
                            <span>🎯 ${quest.missions?.length || 0} missions</span>
                            <span>⭐ ${quest.xpReward} XP</span>
                            ${quest.targetState ? `<span>📍 ${quest.targetState}</span>` : ''}
                        </div>
                    </div>
                    <button onclick="reviewQuest('${quest.id}')" 
                            class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all">
                        Review
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading pending quests:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Generate single quest
    document.getElementById('generateSingleBtn').addEventListener('click', async () => {
        const category = document.getElementById('singleCategory').value;
        const difficulty = document.getElementById('singleDifficulty').value;
        const userState = document.getElementById('singleState').value;
        const userGrade = parseInt(document.getElementById('singleGrade').value);
        
        await generateSingleQuest({ category, difficulty, userState, userGrade });
    });
    
    // Generate batch
    document.getElementById('generateBatchBtn').addEventListener('click', async () => {
        const selectedCategories = Array.from(document.querySelectorAll('.batch-category:checked'))
            .map(cb => cb.value);
        
        if (selectedCategories.length === 0) {
            alert('Please select at least one category');
            return;
        }
        
        await generateBatchQuests(selectedCategories);
    });
    
    // Refresh pending quests
    document.getElementById('refreshBtn').addEventListener('click', loadPendingQuests);
    
    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeReviewModal);
    document.getElementById('approveBtn').addEventListener('click', approveCurrentQuest);
    document.getElementById('rejectBtn').addEventListener('click', rejectCurrentQuest);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'login.html';
    });
}

// Generate single quest
async function generateSingleQuest(params) {
    const statusDiv = document.getElementById('generationStatus');
    const btn = document.getElementById('generateSingleBtn');
    
    try {
        statusDiv.classList.remove('hidden');
        btn.disabled = true;
        btn.textContent = 'Generating...';
        
        const quest = await contentGenerator.generateAndSaveQuest(params);
        
        alert(`Quest "${quest.title}" generated successfully! Added to pending review.`);
        await loadDashboardStats();
        await loadPendingQuests();
        
    } catch (error) {
        console.error('Error generating quest:', error);
        alert('Error generating quest: ' + error.message);
    } finally {
        statusDiv.classList.add('hidden');
        btn.disabled = false;
        btn.textContent = 'Generate Quest';
    }
}

// Generate batch quests
async function generateBatchQuests(categories) {
    const statusDiv = document.getElementById('generationStatus');
    const btn = document.getElementById('generateBatchBtn');
    
    try {
        statusDiv.classList.remove('hidden');
        btn.disabled = true;
        btn.textContent = 'Generating Batch...';
        
        const baseParams = {
            difficulty: 'intermediate',
            userState: 'Delhi',
            userGrade: 9
        };
        
        const results = await contentGenerator.generateQuestBatch(baseParams, categories);
        
        const successful = results.filter(r => r.success).length;
        const failed = results.length - successful;
        
        alert(`Batch generation complete!\nSuccessful: ${successful}\nFailed: ${failed}`);
        await loadDashboardStats();
        await loadPendingQuests();
        
    } catch (error) {
        console.error('Error generating batch:', error);
        alert('Error generating batch: ' + error.message);
    } finally {
        statusDiv.classList.add('hidden');
        btn.disabled = false;
        btn.textContent = 'Generate Batch (Selected Categories)';
    }
}

// Review quest
window.reviewQuest = async function(questId) {
    try {
        const quests = await contentGenerator.getGeneratedQuests({ limit: 100 });
        const quest = quests.find(q => q.id === questId);
        
        if (!quest) {
            alert('Quest not found');
            return;
        }
        
        currentReviewQuest = quest;
        displayQuestReview(quest);
        document.getElementById('reviewModal').classList.remove('hidden');
        document.getElementById('reviewModal').classList.add('flex');
        
    } catch (error) {
        console.error('Error loading quest for review:', error);
        alert('Error loading quest');
    }
};

// Display quest in review modal
function displayQuestReview(quest) {
    const content = document.getElementById('questReviewContent');
    content.innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center gap-4">
                <span class="text-4xl">${quest.icon}</span>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">${quest.title}</h2>
                    <div class="flex gap-2 mt-2">
                        <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            ${quest.category}
                        </span>
                        <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            ${quest.difficulty}
                        </span>
                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            +${quest.xpReward} XP
                        </span>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="font-semibold text-gray-900 mb-2">Description</h3>
                <p class="text-gray-700">${quest.description}</p>
            </div>
            
            <div>
                <h3 class="font-semibold text-gray-900 mb-4">Missions (${quest.missions?.length || 0})</h3>
                <div class="space-y-4">
                    ${quest.missions?.map((mission, index) => `
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-medium text-gray-900">Mission ${index + 1}: ${mission.title}</h4>
                                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                                    ${mission.type} • +${mission.xpReward} XP
                                </span>
                            </div>
                            <p class="text-gray-600 text-sm">${mission.description}</p>
                        </div>
                    `).join('') || '<p class="text-gray-500">No missions found</p>'}
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Generation Details</h3>
                <div class="text-sm text-gray-600 space-y-1">
                    <p><strong>Created:</strong> ${quest.createdAt?.toDate()?.toLocaleString()}</p>
                    <p><strong>Target State:</strong> ${quest.targetState || 'General'}</p>
                    <p><strong>Target Grade:</strong> ${quest.generationParams?.userGrade || 'Not specified'}</p>
                    <p><strong>Estimated Time:</strong> ${quest.estimatedTime}</p>
                </div>
            </div>
        </div>
    `;
}

// Approve quest (FIXED - Complete implementation)
async function approveCurrentQuest() {
    if (!currentReviewQuest) return;
    
    try {
        console.log('Approving quest:', currentReviewQuest.id);
        
        // Update quest status to approved in ai_generated_quests collection
        const questRef = doc(db, 'ai_generated_quests', currentReviewQuest.id);
        await updateDoc(questRef, {
            status: 'approved',
            approvedBy: currentUser.uid,
            approvedAt: new Date(),
            publishedAt: new Date()
        });
        
        // Copy quest to public quests collection for students
        const publicQuestRef = doc(db, 'quests', currentReviewQuest.id);
        await setDoc(publicQuestRef, {
            ...currentReviewQuest,
            source: 'ai_generated',
            originalId: currentReviewQuest.id,
            status: 'approved',
            approvedBy: currentUser.uid,
            approvedAt: new Date(),
            publishedAt: new Date()
        });
        
        console.log('Quest approved and published successfully');
        alert('Quest approved and published! Students can now access it.');
        
        closeReviewModal();
        await loadDashboardStats();
        await loadPendingQuests();
        
    } catch (error) {
        console.error('Error approving quest:', error);
        alert('Error approving quest: ' + error.message);
    }
}

// Reject quest
async function rejectCurrentQuest() {
    if (!currentReviewQuest) return;
    
    const reason = prompt('Reason for rejection (optional):');
    
    try {
        const questRef = doc(db, 'ai_generated_quests', currentReviewQuest.id);
        await updateDoc(questRef, {
            status: 'rejected',
            rejectedBy: currentUser.uid,
            rejectedAt: new Date(),
            rejectionReason: reason || 'No reason provided'
        });
        
        alert('Quest rejected');
        closeReviewModal();
        await loadDashboardStats();
        await loadPendingQuests();
    } catch (error) {
        console.error('Error rejecting quest:', error);
        alert('Error rejecting quest: ' + error.message);
    }
}

// Close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').classList.add('hidden');
    document.getElementById('reviewModal').classList.remove('flex');
    currentReviewQuest = null;
}
