// ===== THEME AUTO BY TIME OF DAY =====

function getTimeBasedTheme() {
    const hour = new Date().getHours();
    // Day: 6am - 7pm (6-19), Night: 7pm - 6am
    return (hour >= 6 && hour < 19) ? 'light' : 'dark';
}

function initTheme() {
    // Check if user has manually set a preference
    const savedTheme = localStorage.getItem('theme-preference');
    
    if (savedTheme) {
        // User has a preference, use it
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // No preference, use time-based theme
        const autoTheme = getTimeBasedTheme();
        document.documentElement.setAttribute('data-theme', autoTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Set new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save user preference (overrides auto)
    localStorage.setItem('theme-preference', newTheme);
    
    // Visual feedback
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.style.transform = 'rotate(360deg) scale(1.2)';
        setTimeout(() => {
            themeBtn.style.transform = '';
        }, 400);
    }
}

// Initialize theme on load
initTheme();

// Attach toggle function to button
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});

// Optional: Auto-update theme every hour if no manual preference
setInterval(() => {
    const savedTheme = localStorage.getItem('theme-preference');
    if (!savedTheme) {
        const autoTheme = getTimeBasedTheme();
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (autoTheme !== currentTheme) {
            document.documentElement.setAttribute('data-theme', autoTheme);
        }
    }
}, 60000 * 60); // Check every hour