import { auth, db } from '../config/firebase-config.js';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showAlert, showLoading, hideLoading } from '../utils/helpers.js';

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();

// Handle registration form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const registerBtn = document.getElementById('registerBtn');
    const originalText = showLoading(registerBtn);
    const alertContainer = document.getElementById('alertContainer');
    
    try {
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const fullName = formData.get('fullName');
        const school = formData.get('school');
        const state = formData.get('state');
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showAlert(alertContainer, 'Passwords do not match', 'error');
            return;
        }
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await createUserDocument(user.uid, {
            email: email,
            displayName: fullName,
            school: school,
            state: state,
            createdAt: new Date(),
            lastActive: new Date(),
            // Initialize gamification data
            xp: 0,
            level: 1,
            questsCompleted: 0,
            badges: [],
            questProgress: {},
            stats: {
                totalMissions: 0,
                currentStreak: 0,
                longestStreak: 0,
                xpGainedToday: 0,
                questsByCategory: {},
                missionsByType: {}
            }
        });
        
        showAlert(alertContainer, 'Account created successfully!', 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Failed to create account. Please try again.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'An account with this email already exists.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters long.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
        }
        
        showAlert(alertContainer, errorMessage, 'error');
    } finally {
        hideLoading(registerBtn, originalText);
    }
});

// Google Sign In
document.getElementById('googleSignIn').addEventListener('click', async () => {
    const alertContainer = document.getElementById('alertContainer');
    
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user document exists, create if not
        await createUserDocumentIfNotExists(user);
        
        showAlert(alertContainer, 'Successfully signed in with Google!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        showAlert(alertContainer, 'Failed to sign in with Google. Please try again.', 'error');
    }
});

// Create user document in Firestore
async function createUserDocument(uid, userData) {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, userData);
        console.log('User document created successfully');
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
}

// Create user document if it doesn't exist (for Google sign-in)
async function createUserDocumentIfNotExists(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            await createUserDocument(user.uid, {
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                school: 'Not specified',
                state: 'Not specified',
                createdAt: new Date(),
                lastActive: new Date(),
                xp: 0,
                level: 1,
                questsCompleted: 0,
                badges: [],
                questProgress: {},
                stats: {
                    totalMissions: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    xpGainedToday: 0,
                    questsByCategory: {},
                    missionsByType: {}
                }
            });
        }
    } catch (error) {
        console.error('Error checking/creating user document:', error);
        throw error;
    }
}
