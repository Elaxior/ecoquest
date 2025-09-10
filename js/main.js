import { auth } from './config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Main app initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('EcoQuest App Initialized');
    
    // Update navigation based on auth state
    onAuthStateChanged(auth, (user) => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && user) {
            // User is logged in, update nav to show dashboard link
            navLinks.innerHTML = `
                <li><a href="dashboard.html">Dashboard</a></li>
                <li><a href="#quests">Quests</a></li>
                <li><a href="#leaderboard">Leaderboard</a></li>
                <li><button class="btn logout-btn" onclick="handleLogout()">Logout</button></li>
            `;
        }
    });
});

// Global logout function
window.handleLogout = async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});
