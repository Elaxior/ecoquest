// Utility functions
export function showAlert(container, message, type = 'error') {
    const alertClasses = {
        error: 'bg-red-50 border border-red-200 text-red-800',
        success: 'bg-green-50 border border-green-200 text-green-800'
    };
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `p-4 rounded-lg ${alertClasses[type]} font-medium`;
    alertDiv.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(alertDiv);
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

export function showLoading(button) {
    const originalText = button.textContent;
    button.innerHTML = `
        <svg class="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    `;
    button.disabled = true;
    return originalText;
}

export function hideLoading(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
}

export function calculateLevel(xp) {
    return Math.floor(xp / 100) + 1;
}

export function calculateXPForNextLevel(currentXP) {
    const currentLevel = calculateLevel(currentXP);
    const nextLevelXP = currentLevel * 100;
    return nextLevelXP;
}

export function calculateXPProgress(currentXP) {
    const level = calculateLevel(currentXP);
    const currentLevelStartXP = (level - 1) * 100;
    const nextLevelXP = level * 100;
    const progressXP = currentXP - currentLevelStartXP;
    const totalNeeded = nextLevelXP - currentLevelStartXP;
    
    return {
        current: progressXP,
        total: totalNeeded,
        percentage: (progressXP / totalNeeded) * 100
    };
}
