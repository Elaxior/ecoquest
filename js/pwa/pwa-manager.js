// js/pwa/pwa-manager.js
export class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.notificationPermission = 'default';
        
        this.init();
    }
    
    async init() {
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Setup notifications
        await this.setupNotifications();
        
        // Check if already installed
        this.checkInstallStatus();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('PWA Manager initialized');
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration.scope);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }
    
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            event.preventDefault();
            
            // Store the event so it can be triggered later
            this.deferredPrompt = event;
            
            // Show custom install UI
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.isInstalled = true;
            this.hideInstallButton();
            this.deferredPrompt = null;
            
            // Track installation
            this.trackInstallation();
        });
    }
    
    showInstallButton() {
        // Create install prompt if it doesn't exist
        if (!document.getElementById('install-prompt')) {
            const installPrompt = document.createElement('div');
            installPrompt.id = 'install-prompt';
            installPrompt.className = 'install-prompt';
            installPrompt.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-2xl">📱</div>
                    <div class="flex-1">
                        <div class="font-semibold">Install EcoQuest</div>
                        <div class="text-sm opacity-90">Get the app experience</div>
                    </div>
                    <button id="install-btn" class="bg-white text-primary px-4 py-2 rounded-lg font-semibold">
                        Install
                    </button>
                    <button id="install-dismiss" class="text-white opacity-70 p-1">
                        ✕
                    </button>
                </div>
            `;
            
            document.body.appendChild(installPrompt);
            
            // Add event listeners
            document.getElementById('install-btn').addEventListener('click', () => {
                this.promptInstall();
            });
            
            document.getElementById('install-dismiss').addEventListener('click', () => {
                this.hideInstallButton();
            });
        }
        
        // Show the prompt
        const prompt = document.getElementById('install-prompt');
        if (prompt) {
            prompt.classList.remove('hidden');
        }
    }
    
    hideInstallButton() {
        const prompt = document.getElementById('install-prompt');
        if (prompt) {
            prompt.classList.add('hidden');
            
            // Remove after animation
            setTimeout(() => {
                if (prompt.parentNode) {
                    prompt.parentNode.removeChild(prompt);
                }
            }, 300);
        }
    }
    
    async promptInstall() {
        if (this.deferredPrompt) {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('User response to install prompt:', outcome);
            
            // Clear the deferredPrompt
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }
    
    async setupNotifications() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }
        
        this.notificationPermission = Notification.permission;
        
        // Don't auto-request permission - wait for user action
        console.log('Notification permission status:', this.notificationPermission);
    }
    
    async requestNotificationPermission() {
        if (this.notificationPermission === 'default') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            
            if (permission === 'granted') {
                this.showStatusMessage('Notifications enabled! 🔔', 'success');
                this.setupPushSubscription();
            } else {
                this.showStatusMessage('Notifications disabled', 'info');
            }
            
            return permission === 'granted';
        }
        
        return this.notificationPermission === 'granted';
    }
    
    async setupPushSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // For basic demo - you'd need actual VAPID keys for production
            console.log('Push subscription setup ready');
            
        } catch (error) {
            console.error('Failed to setup push subscription:', error);
        }
    }
    
    checkInstallStatus() {
        // Check if running in PWA mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = window.navigator.standalone === true;
        
        this.isInstalled = isStandalone || isIOSStandalone;
        
        if (this.isInstalled) {
            console.log('Running in PWA mode');
            document.body.classList.add('pwa-mode');
        }
    }
    
    setupEventListeners() {
        // Add notification permission button to settings/profile
        const notificationBtn = document.getElementById('enable-notifications');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.requestNotificationPermission();
            });
        }
        
        // Handle mobile navigation
        this.setupMobileNavigation();
    }
    
    setupMobileNavigation() {
        // Add mobile navigation if it doesn't exist
        if (!document.querySelector('.mobile-nav') && window.innerWidth <= 768) {
            this.createMobileNavigation();
        }
        
        // Update active nav item based on current page
        this.updateActiveNavItem();
    }
    
    createMobileNavigation() {
        const mobileNav = document.createElement('nav');
        mobileNav.className = 'mobile-nav';
        mobileNav.innerHTML = `
            <div class="flex justify-around">
                <a href="/dashboard.html" class="mobile-nav-item no-select" data-page="dashboard">
                    <div class="mobile-nav-icon">🏠</div>
                    <span>Home</span>
                </a>
                <a href="/quests.html" class="mobile-nav-item no-select" data-page="quests">
                    <div class="mobile-nav-icon">🎯</div>
                    <span>Quests</span>
                </a>
                <a href="/profile.html" class="mobile-nav-item no-select" data-page="profile">
                    <div class="mobile-nav-icon">👤</div>
                    <span>Profile</span>
                </a>
                <button class="mobile-nav-item no-select" id="mobile-notifications">
                    <div class="mobile-nav-icon">🔔</div>
                    <span>Alerts</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(mobileNav);
        
        // Add main content padding
        const mainContent = document.querySelector('main') || document.body;
        mainContent.classList.add('main-content');
        
        // Setup notifications button
        document.getElementById('mobile-notifications').addEventListener('click', () => {
            this.requestNotificationPermission();
        });
    }
    
    updateActiveNavItem() {
        const currentPage = window.location.pathname;
        const navItems = document.querySelectorAll('.mobile-nav-item[data-page]');
        
        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (currentPage.includes(page)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    showUpdateNotification() {
        this.showStatusMessage('New version available! Refresh to update.', 'info', 5000);
    }
    
    showStatusMessage(message, type = 'info', duration = 3000) {
        // Remove existing status indicators
        const existing = document.querySelector('.status-indicator');
        if (existing) {
            existing.remove();
        }
        
        // Create new status indicator
        const indicator = document.createElement('div');
        indicator.className = `status-indicator ${type}`;
        indicator.textContent = message;
        
        document.body.appendChild(indicator);
        
        // Show with animation
        setTimeout(() => {
            indicator.classList.remove('hidden');
        }, 10);
        
        // Hide after duration
        setTimeout(() => {
            indicator.classList.add('hidden');
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }, duration);
    }
    
    trackInstallation() {
        // Track PWA installation for analytics
        console.log('PWA installed at:', new Date());
        
        // You can send this data to your analytics service
        // Example: gtag('event', 'pwa_install');
    }
}

// Initialize PWA Manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaManager = new PWAManager();
    });
} else {
    window.pwaManager = new PWAManager();
}

export default PWAManager;
