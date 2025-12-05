// ===== CREATIVE TRANSITION TO ABOUT PAGE =====
// "Zoom & Spiral" effect - elegant and professional

const urlParams = new URLSearchParams(window.location.search);
const withTransition = urlParams.get('transition') === 'spiral';

if (withTransition && document.querySelector('.about-page')) {
    showSpiralTransition();
}

function showSpiralTransition() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--bg-base);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    `;
    
    // Create animated circle
    const circle = document.createElement('div');
    circle.style.cssText = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent);
        opacity: 0.8;
        animation: spiralGrow 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spiralGrow {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
            }
            50% {
                transform: scale(20) rotate(360deg);
                opacity: 0.5;
            }
            100% {
                transform: scale(40) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    overlay.appendChild(circle);
    document.body.appendChild(overlay);
    
    // Hide content initially
    document.querySelectorAll('.about-hero, .about-content-section').forEach(el => {
        el.style.opacity = '0';
    });
    
    // Remove overlay and show content after animation
    setTimeout(() => {
        overlay.remove();
        document.querySelectorAll('.about-hero, .about-content-section').forEach(el => {
            el.style.opacity = '1';
            el.style.transition = 'opacity 0.8s ease';
        });
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }, 1200);
}

// Add transition trigger to "About" links
document.addEventListener('DOMContentLoaded', () => {
    const aboutLinks = document.querySelectorAll('a[href="about.html"]');
    
    aboutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'about.html?transition=spiral';
        });
    });
});