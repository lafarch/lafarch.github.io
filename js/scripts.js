// ===== CONFIGURACIÓN =====
const GITHUB_USERNAME = 'lafarch';
const PROJECTS_TO_EXCLUDE = ['lafarch', 'lafarch.github.io'];
const MAX_PROJECTS = 12;

// Variables globales
let allProjects = [];
let currentFilter = 'all';
let portfolioData = null;

// ===== CARGAR DATOS DEL JSON =====
async function loadPortfolioData() {
    try {
        const response = await fetch('data.json');
        portfolioData = await response.json();
        
        loadAbout();
        loadExperience();
        loadEducation();
        loadSkills();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

// ===== CARGAR ABOUT =====
function loadAbout() {
    const aboutContent = document.getElementById('about-content');
    aboutContent.innerHTML = `<p>${portfolioData.about.description}</p>`;
}

// ===== CARGAR EXPERIENCE =====
function loadExperience() {
    const timeline = document.getElementById('experience-timeline');
    timeline.innerHTML = '';
    
    portfolioData.experience.forEach(exp => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-date">${exp.date}</div>
            <div class="timeline-content">
                <h3>${exp.company}</h3>
                <h4>${exp.position}</h4>
                <p>${exp.description}</p>
            </div>
        `;
        timeline.appendChild(item);
    });
}

// ===== CARGAR EDUCATION =====
function loadEducation() {
    const grid = document.getElementById('education-grid');
    grid.innerHTML = '';
    
    portfolioData.education.forEach(edu => {
        const card = document.createElement('div');
        card.className = 'education-card';
        card.innerHTML = `
            <h3>${edu.institution}</h3>
            <span class="education-date">${edu.date}</span>
            ${edu.current ? '<span class="current-badge">Current</span>' : ''}
            <h4>${edu.degree}</h4>
            <p>${edu.description}</p>
        `;
        grid.appendChild(card);
    });
}

// ===== CARGAR SKILLS =====
function loadSkills() {
    const container = document.getElementById('skills-grid');
    container.innerHTML = '';
    
    // Agrupar por categoría
    const categories = {};
    portfolioData.skills.forEach(skill => {
        if (!categories[skill.category]) {
            categories[skill.category] = [];
        }
        categories[skill.category].push(skill);
    });
    
    // Crear secciones por categoría
    Object.entries(categories).forEach(([category, skills]) => {
        const section = document.createElement('div');
        section.className = 'skill-category';
        
        const title = document.createElement('h3');
        title.className = 'skill-category-title';
        title.textContent = category;
        section.appendChild(title);
        
        const grid = document.createElement('div');
        grid.className = 'skills-grid';
        
        skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = `skill-tag skill-${skill.level}`;
            tag.textContent = skill.name;
            tag.title = `${skill.level} level`;
            grid.appendChild(tag);
        });
        
        section.appendChild(grid);
        container.appendChild(section);
    });
}

// ===== GITHUB API - CARGAR PROYECTOS =====
async function loadGitHubProjects() {
    const loadingEl = document.getElementById('projects-loading');
    const projectsGrid = document.getElementById('projects-grid');
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=50`);
        
        if (!response.ok) {
            throw new Error('Error al cargar proyectos');
        }
        
        const repos = await response.json();
        
        // Filtrar repositorios
        allProjects = repos
            .filter(repo => !repo.fork && !PROJECTS_TO_EXCLUDE.includes(repo.name))
            .sort((a, b) => {
                // Priorizar proyectos pinneados
                const aPinned = portfolioData.pinnedProjects.includes(a.name);
                const bPinned = portfolioData.pinnedProjects.includes(b.name);
                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;
                return new Date(b.updated_at) - new Date(a.updated_at);
            })
            .slice(0, MAX_PROJECTS);
        
        loadingEl.style.display = 'none';
        
        if (allProjects.length === 0) {
            projectsGrid.innerHTML = '<p class="no-projects">No projects found</p>';
            return;
        }
        
        // Crear filtros de lenguaje
        createLanguageFilters();
        
        // Crear gráfica de lenguajes
        createLanguageChart();
        
        // Mostrar proyectos
        displayProjects(allProjects);
        
    } catch (error) {
        console.error('Error loading GitHub projects:', error);
        loadingEl.innerHTML = '<p class="error">Unable to load projects. Please visit my <a href="https://github.com/lafarch" target="_blank">GitHub</a> directly.</p>';
    }
}

// ===== CREAR FILTROS DE LENGUAJE =====
function createLanguageFilters() {
    const filterContainer = document.getElementById('language-filter');
    const languages = new Set();
    
    allProjects.forEach(repo => {
        if (repo.language) {
            languages.add(repo.language);
        }
    });
    
    const sortedLanguages = Array.from(languages).sort();
    
    sortedLanguages.forEach(lang => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = lang;
        btn.dataset.language = lang;
        btn.addEventListener('click', () => filterProjects(lang));
        filterContainer.appendChild(btn);
    });
}

// ===== FILTRAR PROYECTOS =====
function filterProjects(language) {
    currentFilter = language;
    
    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.language === language) {
            btn.classList.add('active');
        }
    });
    
    // Filtrar proyectos
    const filtered = language === 'all' 
        ? allProjects 
        : allProjects.filter(repo => repo.language === language);
    
    displayProjects(filtered);
}

// ===== MOSTRAR PROYECTOS =====
function displayProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';
    
    projects.forEach(repo => {
        const card = createProjectCard(repo);
        projectsGrid.appendChild(card);
    });
    
    // Re-observar para animaciones
    setTimeout(observeElements, 100);
}

// ===== CREAR CARD DE PROYECTO =====
function createProjectCard(repo) {
    const card = document.createElement('div');
    const isPinned = portfolioData.pinnedProjects.includes(repo.name);
    card.className = `project-card ${isPinned ? 'pinned' : ''}`;
    
    card.innerHTML = `
        ${isPinned ? '<div class="pinned-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
        <div class="project-header">
            <h3>${repo.name}</h3>
            ${repo.language ? `<span class="project-language">${repo.language}</span>` : ''}
        </div>
        <p class="project-description">
            ${repo.description || 'No description available'}
        </p>
        <div class="project-stats">
            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
            <span><i class="fas fa-clock"></i> Updated ${getTimeAgo(repo.updated_at)}</span>
        </div>
        <div class="project-links">
            <a href="${repo.html_url}" target="_blank" class="project-link">
                <i class="fab fa-github"></i> View Code
            </a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
        </div>
    `;
    
    return card;
}

// ===== GRÁFICA DE LENGUAJES =====
function createLanguageChart() {
    const languageCount = {};
    
    allProjects.forEach(repo => {
        if (repo.language) {
            languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
    });
    
    const sortedLanguages = Object.entries(languageCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '';
    
    const total = sortedLanguages.reduce((sum, [, count]) => sum + count, 0);
    
    sortedLanguages.forEach(([language, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.innerHTML = `
            <div class="chart-label">
                <span>${language}</span>
                <span>${count} repos (${percentage}%)</span>
            </div>
            <div class="chart-progress">
                <div class="chart-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        chartContainer.appendChild(bar);
    });
}

// ===== UTILIDADES =====
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'just now';
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolioData();
    loadGitHubProjects();
});

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
        }
    });
});

// ===== NAVBAR ON SCROLL =====
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// ===== SCROLL DOWN BUTTON =====
document.querySelector('.scroll-down')?.addEventListener('click', () => {
    document.querySelector('#about').scrollIntoView({
        behavior: 'smooth'
    });
});

// ===== FORM SUBMISSION =====
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        const button = contactForm.querySelector('button[type="submit"]');
        button.textContent = 'Sending...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'Send Message';
            button.disabled = false;
        }, 3000);
    });
}

// ===== ANIMACIONES ON SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

function observeElements() {
    document.querySelectorAll('.timeline-item, .education-card, .project-card, .skill-tag').forEach(el => {
        if (!el.classList.contains('observed')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            el.classList.add('observed');
            observer.observe(el);
        }
    });
}

observeElements();
setTimeout(observeElements, 2000);

// ===== CURRENT YEAR =====
const yearSpan = document.getElementById('current-year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}