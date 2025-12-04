// ===== TRAIN TRANSITION FROM HOME TO WORK PAGE =====

// Check if coming from home page with transition flag
const urlParams = new URLSearchParams(window.location.search);
const withTransition = urlParams.get('transition') === 'train';

if (withTransition && document.querySelector('.work-page')) {
    // We're on work page and should show transition
    showTrainTransition();
}

function showTrainTransition() {
    const transitionTrack = document.getElementById('transition-track');
    const workGrid = document.getElementById('work-grid');
    
    if (!transitionTrack || !workGrid) return;
    
    // Hide work grid initially
    workGrid.style.opacity = '0';
    
    // Show transition track
    transitionTrack.classList.add('active');
    transitionTrack.style.display = 'flex';
    transitionTrack.style.justifyContent = 'center';
    transitionTrack.style.alignItems = 'center';
    transitionTrack.style.overflow = 'hidden';
    
    // Create accelerating cards
    const numCards = 8;
    const cards = [];
    
    for (let i = 0; i < numCards; i++) {
        const card = document.createElement('div');
        card.className = 'work-card transition-card';
        card.style.position = 'absolute';
        card.style.left = `${i * 400 - 1600}px`;
        card.style.width = '360px';
        card.style.height = '340px';
        card.innerHTML = `
            <div class="work-header">
                <span class="work-lang">Loading</span>
                <span class="work-stars">★ 0</span>
            </div>
            <h3 class="work-title">Project ${i + 1}</h3>
            <p class="work-desc">Loading project data...</p>
        `;
        transitionTrack.appendChild(card);
        cards.push(card);
    }
    
    // Animate cards moving across screen (train effect)
    let position = -1600;
    let speed = 5;
    const maxSpeed = 80;
    const acceleration = 1.15;
    
    const animate = () => {
        speed = Math.min(speed * acceleration, maxSpeed);
        position += speed;
        
        cards.forEach((card, i) => {
            card.style.left = `${position + (i * 400)}px`;
        });
        
        // Continue until cards are off screen
        if (position < window.innerWidth + 1600) {
            requestAnimationFrame(animate);
        } else {
            // Transition complete, show grid
            transitionTrack.style.display = 'none';
            transitionTrack.classList.remove('active');
            workGrid.style.opacity = '1';
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };
    
    // Start animation after small delay
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 300);
}

// Add transition trigger to "Work" link on home page
document.addEventListener('DOMContentLoaded', () => {
    const workLinks = document.querySelectorAll('a[href="work.html"], a[href="projects.html"]');
    
    workLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add transition parameter
            window.location.href = 'work.html?transition=train';
        });
    });
});