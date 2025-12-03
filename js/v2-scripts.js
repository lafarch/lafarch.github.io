// ===== CONFIGURATION =====
const GITHUB_USERNAME = 'lafarch';
const PROJECTS_TO_EXCLUDE = ['lafarch', 'lafarch.github.io'];
const MAX_PROJECTS = 6;

const LANGUAGE_ICONS = {
    'Python': '🐍',
    'JavaScript': '⚡',
    'Java': '☕',
    'C++': '⚙️',
    'R': '📊',
    'TypeScript': '📘',
    'Default': '💻'
};

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
    const projectsGrid = document.getElementById('projects-grid');
    
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
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);">No projects found</p>';
            return;
        }
        
        projects.forEach(repo => {
            const card = createProjectCard(repo);
            projectsGrid.appendChild(card);
        });
        
        observeProjects();
        
    } catch (error) {
        console.error('Error loading projects:', error);
        loadingEl.innerHTML = '<p style="color:var(--text-tertiary);">Unable to load projects. Visit <a href="https://github.com/lafarch" target="_blank" style="color:var(--accent);">GitHub</a> directly.</p>';
    }
}

// ===== CREATE PROJECT CARD =====
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'work-card';
    
    const icon = LANGUAGE_ICONS[repo.language] || LANGUAGE_ICONS['Default'];
    const year = new Date(repo.created_at).getFullYear();
    
    card.innerHTML = `
        <div class="work-image">
            <div class="work-icon">${icon}</div>
            ${repo.language ? `<span class="work-badge">${repo.language}</span>` : ''}
        </div>
        <div class="work-content">
            <div class="work-header">
                <h3 class="work-title">${formatRepoName(repo.name)}</h3>
                <span class="work-year">${year}</span>
            </div>
            <p class="work-description">
                ${repo.description || 'A data science project exploring computational methods and statistical analysis.'}
            </p>
            <div class="work-meta">
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🔱 ${repo.forks_count}</span>
                <span>Updated ${getTimeAgo(repo.updated_at)}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" class="work-link">View Project →</a>
        </div>
    `;
    
    return card;
}

// ===== UTILITIES =====
function formatRepoName(name) {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval}${unit.charAt(0)} ago`;
        }
    }
    
    return 'recently';
}

// ===== SCROLL ANIMATIONS =====
function observeProjects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.work-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// ===== ACTIVE SECTION DETECTION =====
function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveSection);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadGitHubProjects();
    updateActiveSection();
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Year
    document.getElementById('current-year').textContent = new Date().getFullYear();
});