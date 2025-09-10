import { auth } from '../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['index.html', 'login.html', 'register.html', ''];
    
    if (!user && !publicPages.includes(currentPage)) {
        // User is not logged in and trying to access protected page
        window.location.href = 'login.html';
    } else if (user && (currentPage === 'login.html' || currentPage === 'register.html')) {
        // User is logged in and trying to access auth pages
        window.location.href = 'dashboard.html';
    }
});
