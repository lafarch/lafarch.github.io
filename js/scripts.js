// ===== GITHUB API - CARGAR PROYECTOS DINÁMICAMENTE =====
const GITHUB_USERNAME = 'lafarch';
const PROJECTS_TO_EXCLUDE = ['lafarch', 'lafarch.github.io']; // Repos que no quieres mostrar
const MAX_PROJECTS = 6; // Máximo número de proyectos a mostrar

async function loadGitHubProjects() {
    const loadingEl = document.getElementById('projects-loading');
    const projectsGrid = document.getElementById('projects-grid');
    
    try {
        // Llamar a la API de GitHub
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`);
        
        if (!response.ok) {
            throw new Error('Error al cargar proyectos');
        }
        
        const repos = await response.json();
        
        // Filtrar y ordenar repositorios
        const filteredRepos = repos
            .filter(repo => !repo.fork && !PROJECTS_TO_EXCLUDE.includes(repo.name))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, MAX_PROJECTS);
        
        // Ocultar loading
        loadingEl.style.display = 'none';
        
        // Mostrar proyectos
        if (filteredRepos.length === 0) {
            projectsGrid.innerHTML = '<p class="no-projects">No projects found</p>';
            return;
        }
        
        filteredRepos.forEach(repo => {
            const projectCard = createProjectCard(repo);
            projectsGrid.appendChild(projectCard);
        });
        
    } catch (error) {
        console.error('Error loading GitHub projects:', error);
        loadingEl.innerHTML = '<p class="error">Unable to load projects. Please visit my <a href="https://github.com/lafarch" target="_blank">GitHub</a> directly.</p>';
    }
}

function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Determinar el lenguaje principal
    const language = repo.language || 'Code';
    
    // Crear el contenido del card
    card.innerHTML = `
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
            ${repo.language ? `<span><i class="fas fa-circle"></i> ${repo.language}</span>` : ''}
        </div>
        <div class="project-links">
            <a href="${repo.html_url}" target="_blank" class="project-link">
                <i class="fab fa-github"></i> View on GitHub
            </a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
        </div>
    `;
    
    return card;
}

// Cargar proyectos cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
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

// ===== NAVBAR BACKGROUND ON SCROLL =====
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

// ===== FORM SUBMISSION FEEDBACK =====
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

// ===== FADE-IN ANIMATION ON SCROLL =====
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

// Observe elements after projects are loaded
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

// Initial observation
observeElements();

// Re-observe after projects load
setTimeout(observeElements, 2000);

// ===== CURRENT YEAR IN FOOTER =====
const yearSpan = document.getElementById('current-year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}