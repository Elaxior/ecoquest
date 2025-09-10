import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, orderBy, limit, getDocs, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getUserData } from '../utils/user-data.js';

let currentUser = null;
let currentTab = 'students';

// Initialize leaderboard
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadCurrentUserRank();
        setupLeaderboardTabs();
        loadLeaderboard();
    }
});

// Load current user rank
async function loadCurrentUserRank() {
    try {
        const userData = await getUserData(currentUser.uid);
        if (userData) {
            // Calculate user rank (simplified - in production, this would be pre-calculated)
            const usersQuery = query(
                collection(db, 'users'),
                orderBy('xp', 'desc')
            );
            
            const usersSnapshot = await getDocs(usersQuery);
            let rank = 1;
            let found = false;
            
            usersSnapshot.forEach((doc) => {
                if (doc.id === currentUser.uid) {
                    found = true;
                    return;
                }
                if (!found) rank++;
            });
            
            document.getElementById('currentUserRank').querySelector('div:last-child').textContent = 
                `#${rank} (${userData.xp || 0} XP)`;
        }
    } catch (error) {
        console.error('Error loading user rank:', error);
        document.getElementById('currentUserRank').querySelector('div:last-child').textContent = '#-- Error';
    }
}

// Setup leaderboard tabs
function setupLeaderboardTabs() {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => {
                t.classList.remove('active', 'text-primary', 'border-primary');
                t.classList.add('text-gray-500', 'border-transparent');
            });
            tab.classList.add('active', 'text-primary', 'border-primary');
            tab.classList.remove('text-gray-500', 'border-transparent');
            
            // Show target content
            tabContents.forEach(content => content.classList.add('hidden'));
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
            
            currentTab = targetTab;
            loadLeaderboard();
        });
    });
    
    // Set initial active state
    const firstTab = tabs[0];
    if (firstTab) {
        firstTab.classList.add('text-primary', 'border-primary');
        firstTab.classList.remove('text-gray-500', 'border-transparent');
    }
}

// Load leaderboard data
function loadLeaderboard() {
    if (currentTab === 'students') {
        loadStudentsLeaderboard();
    } else if (currentTab === 'schools') {
        loadSchoolsLeaderboard();
    } else if (currentTab === 'states') {
        loadStatesLeaderboard();
    }
}

// Load students leaderboard
async function loadStudentsLeaderboard() {
    const container = document.getElementById('studentsLeaderboard');
    const loading = document.getElementById('loadingStudents');
    
    try {
        loading.style.display = 'block';
        container.innerHTML = '';
        
        // Query top users by XP
        const usersQuery = query(
            collection(db, 'users'),
            orderBy('xp', 'desc'),
            limit(50)
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const users = [];
        
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            users.push({
                id: doc.id,
                name: userData.displayName || 'Anonymous',
                school: userData.school || 'Unknown School',
                state: userData.state || 'Unknown State',
                xp: userData.xp || 0,
                level: userData.level || 1,
                badges: userData.badges || [],
                questsCompleted: userData.questsCompleted || 0
            });
        });
        
        renderStudentsLeaderboard(users);
        loading.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading students leaderboard:', error);
        loading.style.display = 'none';
        container.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <div class="text-4xl mb-4">❌</div>
                <p>Error loading leaderboard. Please try again.</p>
            </div>
        `;
    }
}

// Render students leaderboard
function renderStudentsLeaderboard(users) {
    const container = document.getElementById('studentsLeaderboard');
    
    if (users.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-4">🏆</div>
                <p>No users found. Be the first to complete some quests!</p>
            </div>
        `;
        return;
    }
    
    const leaderboardHtml = users.map((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.id === currentUser.uid;
        const medalEmojis = ['🥇', '🥈', '🥉'];
        const medal = rank <= 3 ? medalEmojis[rank - 1] : `#${rank}`;
        
        return `
            <div class="flex items-center gap-4 p-4 rounded-lg border ${isCurrentUser ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200 hover:border-gray-300'} transition-all">
                <div class="text-2xl font-bold ${rank <= 3 ? 'text-' + (['yellow', 'gray', 'yellow'][rank - 1]) + '-600' : 'text-gray-600'} min-w-[3rem] text-center">
                    ${medal}
                </div>
                
                <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                
                <div class="flex-1">
                    <div class="font-semibold text-gray-900 ${isCurrentUser ? 'text-primary' : ''}">
                        ${user.name} ${isCurrentUser ? '(You)' : ''}
                    </div>
                    <div class="text-sm text-gray-600">${user.school} • ${user.state}</div>
                </div>
                
                <div class="text-right">
                    <div class="font-bold text-gray-900">${user.xp.toLocaleString()} XP</div>
                    <div class="text-sm text-gray-600">Level ${user.level}</div>
                </div>
                
                <div class="flex items-center gap-2">
                    <div class="text-sm text-gray-600">${user.badges.length} 🏅</div>
                    <div class="text-sm text-gray-600">${user.questsCompleted} 🎯</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = leaderboardHtml;
}

// Load schools leaderboard (placeholder)
function loadSchoolsLeaderboard() {
    // Implementation for school rankings would go here
    // This would aggregate user data by school
}

// Load states leaderboard (placeholder)  
function loadStatesLeaderboard() {
    // Implementation for state rankings would go here
    // This would aggregate user data by state
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
