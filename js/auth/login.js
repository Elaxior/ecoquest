import { auth } from '../config/firebase-config.js';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showAlert, showLoading, hideLoading } from '../utils/helpers.js';

const loginForm = document.getElementById('loginForm');
const googleSignInBtn = document.getElementById('googleSignIn');
const alertContainer = document.getElementById('alertContainer');

// Email/Password Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    const originalText = showLoading(loginBtn);
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
        }
        
        showAlert(alertContainer, errorMessage, 'error');
    }
    
    hideLoading(loginBtn, originalText);
});

// Google Sign In
googleSignInBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    
    try {
        await signInWithPopup(auth, provider);
        window.location.href = 'dashboard.html';
    } catch (error) {
        showAlert(alertContainer, 'Google sign-in failed. Please try again.', 'error');
    }
});
