// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    // Toggle mobile menu
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileMenu && mobileMenuBtn) {
            if (!mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
    
    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    });
    
    // Mobile logout functionality
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', function() {
            // Import and use Firebase auth
            import('./config/firebase-config.js').then(({ auth }) => {
                import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js').then(({ signOut }) => {
                    signOut(auth).then(() => {
                        window.location.href = 'index.html';
                    }).catch((error) => {
                        console.error('Logout error:', error);
                    });
                });
            });
        });
    }
});
