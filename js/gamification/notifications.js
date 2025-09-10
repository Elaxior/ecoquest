// Notification system for rewards and achievements
let notificationQueue = [];
let isShowingNotification = false;

// Show notification
export function showNotification(notification) {
    notificationQueue.push(notification);
    if (!isShowingNotification) {
        processNotificationQueue();
    }
}

// Process notification queue
function processNotificationQueue() {
    if (notificationQueue.length === 0) {
        isShowingNotification = false;
        return;
    }
    
    isShowingNotification = true;
    const notification = notificationQueue.shift();
    displayNotification(notification);
}

// Display notification
function displayNotification(notification) {
    // Remove existing notification if any
    const existingNotification = document.getElementById('rewardNotification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notificationEl = document.createElement('div');
    notificationEl.id = 'rewardNotification';
    notificationEl.className = `
        fixed top-4 right-4 bg-white rounded-xl shadow-2xl border-l-4 border-primary 
        p-6 max-w-sm z-50 transform translate-x-full transition-all duration-300
    `;
    
    const typeConfig = getNotificationConfig(notification.type);
    
    notificationEl.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="text-3xl">${typeConfig.icon}</div>
            <div class="flex-1">
                <h3 class="font-bold text-gray-900 mb-1">${notification.title}</h3>
                <p class="text-gray-600 text-sm mb-3">${notification.message}</p>
                ${notification.xpBonus ? `
                    <div class="bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
                        +${notification.xpBonus} XP
                    </div>
                ` : ''}
            </div>
            <button onclick="closeNotification()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notificationEl);
    
    // Animate in
    setTimeout(() => {
        notificationEl.classList.remove('translate-x-full');
    }, 100);
    
    // Auto hide after duration
    const duration = notification.type === 'level-up' ? 5000 : 3000;
    setTimeout(() => {
        hideNotification(notificationEl);
    }, duration);
    
    // Add celebration animation for special notifications
    if (notification.type === 'level-up' || notification.type === 'achievement') {
        showCelebrationAnimation();
    }
}

// Get notification configuration
function getNotificationConfig(type) {
    const configs = {
        'mission-complete': { icon: '🎯', color: 'blue' },
        'quest-complete': { icon: '🏆', color: 'green' },
        'level-up': { icon: '🎉', color: 'purple' },
        'achievement': { icon: '🏅', color: 'gold' },
        'streak': { icon: '🔥', color: 'orange' }
    };
    
    return configs[type] || { icon: '✨', color: 'blue' };
}

// Hide notification
function hideNotification(notificationEl) {
    notificationEl.classList.add('translate-x-full');
    setTimeout(() => {
        if (notificationEl && notificationEl.parentNode) {
            notificationEl.remove();
        }
        // Process next notification in queue
        setTimeout(processNotificationQueue, 500);
    }, 300);
}

// Close notification manually
window.closeNotification = function() {
    const notificationEl = document.getElementById('rewardNotification');
    if (notificationEl) {
        hideNotification(notificationEl);
    }
};

// Show celebration animation
function showCelebrationAnimation() {
    // Create confetti animation
    const canvas = document.createElement('canvas');
    canvas.id = 'confettiCanvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    // Create particles
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 2,
            gravity: 0.1
        });
    }
    
    // Animate particles
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            
            // Remove particles that are off screen
            if (particle.y > canvas.height) {
                particles.splice(index, 1);
            }
        });
        
        if (particles.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            canvas.remove();
        }
    }
    
    animateConfetti();
}

// Show progress update notification
export function showProgressNotification(questTitle, completedMissions, totalMissions) {
    const progress = Math.round((completedMissions / totalMissions) * 100);
    
    showNotification({
        type: 'progress',
        title: 'Quest Progress Updated',
        message: `${questTitle}: ${completedMissions}/${totalMissions} missions completed (${progress}%)`
    });
}

// Show streak notification
export function showStreakNotification(streakDays) {
    const milestones = [3, 7, 14, 21, 30];
    if (milestones.includes(streakDays)) {
        showNotification({
            type: 'streak',
            title: `${streakDays} Day Streak! 🔥`,
            message: `Amazing dedication! You've completed missions for ${streakDays} days in a row!`,
            xpBonus: streakDays * 5
        });
    }
}
