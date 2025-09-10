import { auth, db } from '../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getUserData, updateUserProfile } from '../utils/user-data.js';
import { showAlert, showLoading, hideLoading, calculateLevel, calculateXPProgress } from '../utils/helpers.js';

let currentUser = null;

// Initialize profile page
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserProfile();
        setupProfileTabs();
        setupProfileForm();
    }
});

// Load user profile data
async function loadUserProfile() {
    try {
        const userData = await getUserData(currentUser.uid);
        if (userData) {
            updateProfileDisplay(userData);
            populateProfileForm(userData);
            loadUserStats(userData);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert(document.getElementById('profileAlerts'), 'Failed to load profile data', 'error');
    }
}

// Update profile display
function updateProfileDisplay(userData) {
    const level = calculateLevel(userData.xp || 0);
    
    document.getElementById('profileName').textContent = userData.displayName || 'Eco-Warrior';
    document.getElementById('profileInfo').textContent = `${userData.school || 'School'} • ${userData.state || 'State'}`;
    document.getElementById('profileLevel').textContent = `Level ${level}`;
    document.getElementById('profileXP').textContent = `${userData.xp || 0} XP`;
}

// Populate profile form
function populateProfileForm(userData) {
    document.getElementById('displayName').value = userData.displayName || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('school').value = userData.school || '';
    document.getElementById('state').value = userData.state || '';
    document.getElementById('bio').value = userData.bio || '';
}

// Setup profile tabs
function setupProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary'));
            tab.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
            
            // Show target content
            tabContents.forEach(content => content.classList.add('hidden'));
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
    
    // Set initial active state
    const firstTab = tabs[0];
    if (firstTab) {
        firstTab.classList.add('text-primary', 'border-b-2', 'border-primary');
    }
}

// Setup profile form
function setupProfileForm() {
    const form = document.getElementById('profileForm');
    const updateBtn = document.getElementById('updateProfileBtn');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const originalText = showLoading(updateBtn);
        const alertContainer = document.getElementById('profileAlerts');
        
        try {
            const formData = new FormData(form);
            const profileData = {
                displayName: formData.get('displayName'),
                school: formData.get('school'),
                state: formData.get('state'),
                bio: formData.get('bio') || ''
            };
            
            await updateUserProfile(currentUser.uid, profileData);
            showAlert(alertContainer, 'Profile updated successfully!', 'success');
            
            // Update display
            const userData = await getUserData(currentUser.uid);
            updateProfileDisplay(userData);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert(alertContainer, 'Failed to update profile. Please try again.', 'error');
        }
        
        hideLoading(updateBtn, originalText);
    });
}

// Load user statistics
function loadUserStats(userData) {
    const stats = userData.stats || {};
    
    document.getElementById('statTreesPlanted').textContent = stats.treesPlanted || 0;
    document.getElementById('statWaterSaved').textContent = (stats.waterSaved || 0) + 'L';
    document.getElementById('statWasteRecycled').textContent = (stats.wasteRecycled || 0) + 'kg';
    document.getElementById('statEnergySaved').textContent = (stats.energySaved || 0) + 'kWh';
    document.getElementById('statStreak').textContent = stats.streak || 0;
    document.getElementById('statRank').textContent = userData.rank ? `#${userData.rank}` : '#--';
    
    // Load badges
    loadUserBadges(userData.badges || []);
}

// Load user badges
function loadUserBadges(badges) {
    const badgesContainer = document.getElementById('badgesContainer');
    const noBadges = document.getElementById('noBadges');
    
    if (badges.length === 0) {
        badgesContainer.style.display = 'none';
        noBadges.style.display = 'block';
        return;
    }
    
    badgesContainer.style.display = 'grid';
    noBadges.style.display = 'none';
    
    badgesContainer.innerHTML = badges.map(badge => `
        <div class="bg-white p-6 rounded-xl border border-gray-200 text-center">
            <div class="text-4xl mb-3">${badge.icon}</div>
            <h3 class="font-semibold text-gray-900 mb-2">${badge.name}</h3>
            <p class="text-sm text-gray-600 mb-3">${badge.description}</p>
            <div class="text-xs text-gray-500">Earned ${new Date(badge.earnedAt.toDate()).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// Handle logout for mobile
const logoutBtnMobile = document.getElementById('logoutBtnMobile');
if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}

// Handle logout for desktop
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}
