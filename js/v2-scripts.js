// ===== CONFIGURATION =====
const GITHUB_USERNAME = 'lafarch';
const PROJECTS_TO_EXCLUDE = ['lafarch', 'lafarch.github.io'];
const MAX_PROJECTS = 8;

// ===== LOAD GITHUB PROJECTS FOR HOME =====
async function loadGitHubProjects() {
    const loadingEl = document.getElementById('projects-loading');
    const track = document.getElementById('projects-track');
    
    if (!track) return; // Not on home page
    
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
        
        if (loadingEl) loadingEl.style.display = 'none';
        
        if (projects.length === 0) return;

        const cardsHTML = projects.map(repo => createProjectCard(repo)).join('');
        track.innerHTML = cardsHTML + cardsHTML; // Duplicate for infinite loop

    } catch (error) {
        console.error('Error loading projects:', error);
        if (loadingEl) loadingEl.innerHTML = '<p>Check GitHub directly.</p>';
    }
}

// ===== LOAD GITHUB PROJECTS FOR WORK PAGE =====
async function loadWorkPageProjects() {
    const loadingEl = document.getElementById('work-loading');
    const grid = document.getElementById('work-grid');
    
    if (!grid) return; // Not on work page
    
    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=50`
        );
        
        if (!response.ok) throw new Error('Failed to load projects');
        
        const repos = await response.json();
        const projects = repos
            .filter(repo => !repo.fork && !PROJECTS_TO_EXCLUDE.includes(repo.name))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        if (loadingEl) loadingEl.style.display = 'none';
        
        if (projects.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);">No projects found</p>';
            return;
        }

        projects.forEach(repo => {
            const card = createProjectCardElement(repo);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading projects:', error);
        if (loadingEl) loadingEl.innerHTML = '<p>Check GitHub directly.</p>';
    }
}

function createProjectCard(repo) {
    const name = repo.name.replace(/-/g, ' ');
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

function createProjectCardElement(repo) {
    const card = document.createElement('a');
    card.href = repo.html_url;
    card.target = '_blank';
    card.className = 'work-card';
    
    const name = repo.name.replace(/-/g, ' ');
    const desc = repo.description 
        ? (repo.description.length > 85 ? repo.description.substring(0, 85) + '...' : repo.description)
        : 'A data science project exploring computational methods.';
    
    card.innerHTML = `
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
    `;
    
    return card;
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
}

// ===== ACTIVE NAVIGATION =====
function initActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0) return;

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadGitHubProjects(); // For home page
    loadWorkPageProjects(); // For work page
    initScrollAnimations();
    initActiveNav();
    
    // Current year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});