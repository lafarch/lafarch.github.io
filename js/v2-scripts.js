// ===== CONFIGURATION =====
const GITHUB_USERNAME = 'lafarch';
const PROJECTS_TO_EXCLUDE = ['lafarch', 'lafarch.github.io'];
const MAX_PROJECTS = 8;

// ===== THEME MANAGEMENT =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ===== LOAD GITHUB PROJECTS =====
async function loadGitHubProjects() {
    const loadingEl = document.getElementById('projects-loading');
    const track = document.getElementById('projects-track');
    
    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`
        );
        
        if (!response.ok) throw new Error('Failed to load projects');
        
        const repos = await response.json();
        const projects = repos
            .filter(repo => !repo.fork && !PROJECTS_TO_EXCLUDE.includes(repo.name))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, MAX_PROJECTS);
        
        loadingEl.style.display = 'none';
        
        if (projects.length === 0) return;

        const cardsHTML = projects.map(repo => createProjectCard(repo)).join('');
        // Duplicate content for infinite loop illusion
        track.innerHTML = cardsHTML + cardsHTML; 

    } catch (error) {
        console.error('Error loading projects:', error);
        loadingEl.innerHTML = '<p>Check GitHub directly.</p>';
    }
}

function createProjectCard(repo) {
    const name = repo.name.replace(/-/g, ' '); 
    // Truncate description safely
    const desc = repo.description 
        ? (repo.description.length > 85 ? repo.description.substring(0, 85) + '...' : repo.description)
        : 'A data science project exploring computational methods.';

    return `
        <a href="${repo.html_url}" target="_blank" class="work-card">
            <div class="work-header">
                <span class="work-lang">${repo.language || 'Code'}</span>
                <span class="work-stars">★ ${repo.stargazers_count}</span>
            </div>
            <h3 class="work-title">${name}</h3>
            <p class="work-desc">${desc}</p>
            <div class="work-footer">
                <span>View Project</span>
                <span>→</span>
            </div>
        </a>
    `;
}

// ===== SCROLL ANIMATIONS (Intersection Observer) =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Optional: Stop observing once shown so it doesn't animate out again
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before element is fully in view
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
}

// ===== ACTIVE NAVIGATION LINK ON SCROLL =====
function initActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 300)) { // Offset for header
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadGitHubProjects();
    initScrollAnimations();
    initActiveNav();
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    
    document.getElementById('current-year').textContent = new Date().getFullYear();
});