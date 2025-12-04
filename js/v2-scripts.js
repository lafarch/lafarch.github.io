/**
 * v2-scripts.js
 * Refactorizado para mejorar rendimiento, legibilidad y mantenimiento.
 */

// ===== CONFIGURATION =====
const CONFIG = {
    username: 'lafarch',
    exclude: ['lafarch', 'lafarch.github.io'],
    maxHomeProjects: 8,
    cacheKey: 'github_projects_cache',
    cacheDuration: 1000 * 60 * 60 // 1 hora
};

// ===== UTILITIES =====

/**
 * Obtiene los repositorios, usando caché para evitar límites de API.
 */
async function fetchRepositories() {
    // 1. Intentar obtener de caché
    const cachedData = sessionStorage.getItem(CONFIG.cacheKey);
    if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CONFIG.cacheDuration) {
            console.log('📦 Loaded projects from cache');
            return data;
        }
    }

    // 2. Si no hay caché, llamar a la API
    try {
        const response = await fetch(
            `https://api.github.com/users/${CONFIG.username}/repos?sort=updated&per_page=50`
        );
        
        if (!response.ok) throw new Error('Failed to fetch from GitHub');
        
        const repos = await response.json();
        
        // Filtrar y limpiar datos
        const cleanRepos = repos
            .filter(repo => !repo.fork && !CONFIG.exclude.includes(repo.name))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Guardar en caché
        sessionStorage.setItem(CONFIG.cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: cleanRepos
        }));

        return cleanRepos;

    } catch (error) {
        console.error('🚨 Error fetching repos:', error);
        return [];
    }
}

/**
 * Genera el HTML de una tarjeta de proyecto.
 * @param {Object} repo - Objeto del repositorio
 * @returns {string} HTML string
 */
function generateCardHTML(repo) {
    const name = repo.name.replace(/-/g, ' ');
    // Truncar descripción si es muy larga
    const desc = repo.description 
        ? (repo.description.length > 85 ? repo.description.substring(0, 85) + '...' : repo.description)
        : 'A data science project exploring computational methods.';
    
    const language = repo.language || 'Code';
    const stars = repo.stargazers_count;

    return `
        <a href="${repo.html_url}" target="_blank" class="work-card fade-in-card" aria-label="View project ${name}">
            <div class="work-header">
                <span class="work-lang">${language}</span>
                <span class="work-stars">★ ${stars}</span>
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

// ===== PAGE SPECIFIC FUNCTIONS =====

/**
 * Lógica para la página de Inicio (Marquee/Carrusel)
 */
async function initHomeMarquee() {
    const track = document.getElementById('projects-track');
    const loadingEl = document.getElementById('projects-loading');
    
    if (!track) return; // No estamos en la home

    const projects = await fetchRepositories();
    
    if (loadingEl) loadingEl.style.display = 'none';

    if (projects.length === 0 && loadingEl) {
        loadingEl.innerHTML = '<p>No projects found available.</p>';
        loadingEl.style.display = 'block';
        return;
    }

    // Tomamos solo los más recientes para el home
    const featuredProjects = projects.slice(0, CONFIG.maxHomeProjects);
    
    // Generamos HTML
    const cardsHTML = featuredProjects.map(generateCardHTML).join('');
    
    // Duplicamos para el efecto de scroll infinito
    track.innerHTML = cardsHTML + cardsHTML;
}

/**
 * Lógica para la página de Proyectos (Grid completo)
 */
async function initProjectsGrid() {
    // CORRECCIÓN: Usar el ID correcto que está en tu HTML (projects-masonry)
    const grid = document.getElementById('projects-masonry'); 
    const loadingEl = document.getElementById('projects-loading');
    
    if (!grid) return; // No estamos en la página de proyectos

    const projects = await fetchRepositories();
    
    if (loadingEl) loadingEl.style.display = 'none';

    if (projects.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);">No projects found on GitHub.</p>';
        return;
    }

    // Renderizar todos los proyectos
    grid.innerHTML = projects.map(generateCardHTML).join('');
}

// ===== UI ANIMATIONS & NAVIGATION =====

function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));
}

function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Solo ejecutar si hay secciones con ID para rastrear
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
            // Check estricto para evitar matches parciales erróneos
            const href = link.getAttribute('href');
            if (href && (href === current || href.includes(`#${current}`))) {
                link.classList.add('active');
            }
        });
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // 1. UI Generales
    initScrollObserver();
    initActiveNavigation();
    
    // Date copyright
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. Determinar qué cargar según la página
    // Intentamos ejecutar ambas, las funciones tienen "Guard Clauses" (if !element return)
    initHomeMarquee();
    initProjectsGrid();
});