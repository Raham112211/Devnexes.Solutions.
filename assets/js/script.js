// Projects Button Functionality
const projectsBtn = document.getElementById('projectsBtn');

// Open projects page in new tab
if (projectsBtn) {
    projectsBtn.addEventListener('click', () => {
        console.log('Projects button clicked!');
        window.open('projects.html', '_blank');
    });
} else {
    console.error('Projects button not found!');
}

// Hub Button Functionality - Simple and Direct
const hubBtn = document.getElementById('hubBtn');

if (hubBtn) {
    hubBtn.addEventListener('click', function() {
        console.log('Hub button clicked!');
        
        // Direct method - most reliable
        const newWindow = window.open('hub.html', '_blank');
        
        // Check if popup was blocked
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            console.log('Popup blocked, opening in same tab');
            window.location.href = 'hub.html';
        }
    });
} else {
    console.error('Hub button not found!');
}



// Load projects from database API
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        const projects = data.projects || [];
        
        updateProjectCount(projects.length);
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        updateProjectCount(0);
        displayProjects([]);
    }
}

// Update project count with animation
function updateProjectCount(count) {
    const projectCountElement = document.getElementById('projectCount');
    if (projectCountElement) {
        projectCountElement.textContent = count || 0;
    }
}

// Display admin created projects
function displayProjects(projects) {
    const container = document.getElementById('projectsList');
    
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="no-projects">
                <i class="fas fa-folder-open"></i>
                <p>No Projects Available</p>
            </div>
        `;
        return;
    }
    
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Auto-categorize old projects and sort by date
    const allProjects = projects.map(project => {
        const projectDate = new Date(project.createdAt || Date.now());
        if (projectDate < oneMonthAgo && project.status !== 'old') {
            project.status = 'old';
        }
        return project;
    }).sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
    
    const projectsHtml = allProjects.map(project => {
        const createdDate = project.createdAt ? 
            new Date(project.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            }) : 'Today';
        
        // Only show file download for 'latest' projects with files
        const hasFiles = project.files && JSON.parse(project.files || '[]').length > 0;
        const openFolderBtn = project.status === 'latest' && hasFiles ? 
            `<button class="open-folder-btn" onclick="openProjectFolder('${project.id}'); event.stopPropagation();">📁 Open Files</button>` : '';
        
        return `
            <div class="project-item" onclick="handleProjectClick()">
                <div class="project-status ${project.status}"></div>
                <div class="project-info">
                    <span class="project-name">${project.title || project.name}</span>
                    <span class="project-tech">${project.technology || project.tech}</span>
                    <span class="project-date">${createdDate}</span>
                    ${openFolderBtn}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = projectsHtml;
}

// Auto refresh projects from database
setInterval(loadProjects, 5000);

// Expose clear function globally for manual use
window.clearHistory = clearBrowserHistory;

// Reload when page gets focus (switching from admin panel)
window.addEventListener('focus', function() {
    loadProjects();
});

// Auto refresh every 2 seconds to sync with admin changes
setInterval(loadProjects, 2000);

// Spider Web Animation
class SpiderWeb {
    constructor() {
        this.canvas = document.getElementById('spiderWeb');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.mouse = { x: 0, y: 0 };
        this.maxDistance = 160;
        this.init();
    }

    init() {
        this.resize();
        this.createPoints();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createPoints() {
        this.points = [];
        const numPoints = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < numPoints; i++) {
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update points
        this.points.forEach(point => {
            point.x += point.vx;
            point.y += point.vy;
            
            if (point.x < 0 || point.x > this.canvas.width) point.vx *= -1;
            if (point.y < 0 || point.y > this.canvas.height) point.vy *= -1;
        });
        
        // Draw connections
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const dx = this.points[i].x - this.points[j].x;
                const dy = this.points[i].y - this.points[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.maxDistance) {
                    const opacity = (1 - distance / this.maxDistance) * 0.15;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.points[i].x, this.points[i].y);
                    this.ctx.lineTo(this.points[j].x, this.points[j].y);
                    this.ctx.stroke();
                }
            }
            
            // Connect to mouse
            const dx = this.points[i].x - this.mouse.x;
            const dy = this.points[i].y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.maxDistance) {
                const opacity = (1 - distance / this.maxDistance) * 0.3;
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(this.points[i].x, this.points[i].y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();
            }
        }
        
        // Draw points
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}



// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 0) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });
    
    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
        });
    });
}





// Open project folder function for projects page
async function openProjectFolder(projectId) {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        const project = data.projects.find(p => p.id == projectId);
        
        if (project && project.files) {
            const files = JSON.parse(project.files || '[]');
            if (files.length > 0) {
                let folderContent = `Project: ${project.title}\n\nFiles:\n`;
                files.forEach(file => {
                    folderContent += `- ${file.name}\n`;
                });
                alert(folderContent);
            } else {
                alert('No files found in this project');
            }
        } else {
            alert('Project not found');
        }
    } catch (error) {
        alert('Error loading project files');
    }
}

// Clear browser history function (no localStorage dependency)
function clearBrowserHistory() {
    try {
        sessionStorage.clear();
        
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, window.location.pathname);
        }
        
        if ('caches' in window) {
            caches.keys().then(function(names) {
                names.forEach(function(name) {
                    caches.delete(name);
                });
            });
        }
        
        console.log('Browser history and cache cleared successfully!');
        
    } catch (error) {
        console.error('Error clearing browser history:', error);
    }
}

// Auto-clear history on page load (optional)
function autoCleanup() {
    // Clear only session data, keep localStorage for projects
    sessionStorage.clear();
    
    // Clear any temporary data
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
    }
}

// Animated Counter Function
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing application...');
    
    // Auto cleanup on load
    autoCleanup();
    
    loadProjects();
    
    // Load projects from database
    loadProjects();
    
    // Add navbar active state handling
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === '#home') {
            link.classList.add('active');
        }
    });
    
    // Initialize spider web animation
    new SpiderWeb();
    
    console.log('Application initialized successfully!');
});

// Clear history when page is about to unload
window.addEventListener('beforeunload', function() {
    autoCleanup();
});

// Keyboard shortcut to manually clear history (Ctrl+Shift+Delete)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        clearBrowserHistory();
        alert('Browser history cleared!');
    }
});
// Modern Interface Interactive Functionality

// Animated Counter for Stats
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Service Cards Interactive Functionality
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card-modern');
    const detailContents = document.querySelectorAll('.detail-content');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all cards
            serviceCards.forEach(c => c.classList.remove('active'));
            detailContents.forEach(d => d.classList.remove('active'));
            
            // Add active class to clicked card
            card.classList.add('active');
            
            // Show corresponding detail content
            const service = card.getAttribute('data-service');
            const detailContent = document.querySelector(`[data-detail="${service}"]`);
            if (detailContent) {
                detailContent.classList.add('active');
            }
        });
    });
}

// Portfolio Filter Functionality
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card-modern');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Scroll Animations with AOS-like functionality
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.getAttribute('data-aos');
                const delay = element.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    element.classList.add('aos-animate');
                }, delay);
                
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease-out';
        observer.observe(element);
    });
}

// Parallax Effect for Background Elements
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.stats-bg-animation, .services-bg-pattern, .portfolio-bg-grid');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Smooth Scroll for Navigation Links
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Interactive Hover Effects
function initHoverEffects() {
    // Profile card hover effect
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        profileCard.addEventListener('mouseenter', () => {
            profileCard.style.transform = 'scale(1.02) rotate(1deg)';
        });
        
        profileCard.addEventListener('mouseleave', () => {
            profileCard.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // Service cards hover sound effect (optional)
    const serviceCards = document.querySelectorAll('.service-card-modern');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add subtle vibration effect on mobile
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
    });
}

// Dynamic Background Particles
function createFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
    `;
    
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 215, 0, 0.3);
            border-radius: 50%;
            animation: floatParticle ${10 + Math.random() * 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: 100%;
            animation-delay: ${Math.random() * 5}s;
        `;
        
        particleContainer.appendChild(particle);
    }
}

// Add CSS for floating particles
function addParticleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.3;
            }
            90% {
                opacity: 0.3;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .aos-animate {
            animation: fadeInUp 0.6s ease-out !important;
        }
    `;
    document.head.appendChild(style);
}

// Loading Animation
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">
                <span class="logo-main">DevNexes</span>
                <span class="logo-sub">Solutions</span>
            </div>
            <div class="loader-progress">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
    
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease-out;
    `;
    
    document.body.appendChild(loader);
    
    // Simulate loading progress
    const progressBar = loader.querySelector('.progress-bar');
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(loader);
                }, 500);
            }, 500);
        }
        
        progressBar.style.width = progress + '%';
    }, 100);
}

// Add loader styles
function addLoaderStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .loader-content {
            text-align: center;
        }
        
        .loader-logo {
            font-family: 'Poppins', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 2rem;
        }
        
        .loader-logo .logo-main {
            color: var(--primary-color);
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }
        
        .loader-logo .logo-sub {
            color: #ffffff;
            margin-left: 0.5rem;
        }
        
        .loader-progress {
            width: 300px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin: 0 auto;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), #FFE55C);
            border-radius: 2px;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
    `;
    document.head.appendChild(style);
}

// Initialize all modern interface functionality
function initModernInterface() {
    // Show loading animation
    showLoadingAnimation();
    addLoaderStyles();
    
    // Initialize all interactive features
    setTimeout(() => {
        animateStats();
        initServiceCards();
        initPortfolioFilters();
        initScrollAnimations();
        initParallaxEffects();
        initSmoothScroll();
        initHoverEffects();
        createFloatingParticles();
        addParticleStyles();
    }, 1000);
}

// Enhanced Spider Web with Modern Effects
class ModernSpiderWeb extends SpiderWeb {
    constructor() {
        super();
        this.colors = [
            'rgba(255, 215, 0, 0.6)',
            'rgba(255, 235, 153, 0.4)',
            'rgba(255, 220, 0, 0.5)'
        ];
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update points with enhanced movement
        this.points.forEach(point => {
            point.x += point.vx;
            point.y += point.vy;
            
            // Add slight attraction to mouse
            const dx = this.mouse.x - point.x;
            const dy = this.mouse.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                point.vx += dx * 0.00001;
                point.vy += dy * 0.00001;
            }
            
            if (point.x < 0 || point.x > this.canvas.width) point.vx *= -1;
            if (point.y < 0 || point.y > this.canvas.height) point.vy *= -1;
        });
        
        // Draw enhanced connections
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const dx = this.points[i].x - this.points[j].x;
                const dy = this.points[i].y - this.points[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.maxDistance) {
                    const opacity = (1 - distance / this.maxDistance) * 0.6;
                    const colorIndex = Math.floor(Math.random() * this.colors.length);
                    this.ctx.strokeStyle = this.colors[colorIndex].replace('0.6', opacity.toString()).replace('0.4', opacity.toString()).replace('0.5', opacity.toString());
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();\n                    this.ctx.moveTo(this.points[i].x, this.points[i].y);
                    this.ctx.lineTo(this.points[j].x, this.points[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        // Draw glowing points
        this.points.forEach(point => {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing modern interface...');
    
    // Initialize modern interface
    initModernInterface();
    
    // Initialize enhanced spider web
    if (document.getElementById('spiderWeb')) {
        new ModernSpiderWeb();
    }
    
    console.log('Modern interface initialized successfully!');
});

// Navbar scroll effect - Simple like projects site
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Theme Toggle - Database Storage
window.addEventListener('load', async function() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        const userId = 'user_' + (navigator.userAgent.hashCode ? navigator.userAgent.hashCode() : 'default');
        
        // Load theme from database
        try {
            const response = await fetch(`/api/preferences/${userId}`);
            const data = await response.json();
            const savedTheme = data.preferences?.theme || 'light';
            
            if (savedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.querySelector('i').className = 'fas fa-moon';
            } else {
                document.documentElement.removeAttribute('data-theme');
                themeToggle.querySelector('i').className = 'fas fa-sun';
            }
        } catch (error) {
            // Default to light theme if database fails
            document.documentElement.removeAttribute('data-theme');
            themeToggle.querySelector('i').className = 'fas fa-sun';
        }
        
        // Click handler - save to database
        themeToggle.onclick = async function() {
            const isDark = document.documentElement.hasAttribute('data-theme');
            const icon = this.querySelector('i');
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                icon.className = 'fas fa-sun';
                await saveThemeToDatabase(userId, 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                icon.className = 'fas fa-moon';
                await saveThemeToDatabase(userId, 'dark');
            }
        };
    }
});

// Save theme to database
async function saveThemeToDatabase(userId, theme) {
    try {
        await fetch(`/api/preferences/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'theme', value: theme })
        });
    } catch (error) {
        console.log('Failed to save theme preference');
    }
}

// Add hashCode function for user identification
String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString();
};