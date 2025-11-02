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



// Load projects from localStorage (sync with admin)
function loadProjects() {
    // Get projects from admin panel
    const adminProjects = JSON.parse(localStorage.getItem('adminProjects') || '[]');
    const localProjects = JSON.parse(localStorage.getItem('devnex_projects') || '[]');
    
    // Merge admin projects with local projects
    const allProjects = [...adminProjects, ...localProjects];
    
    // Remove duplicates based on ID
    const uniqueProjects = allProjects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
    );
    
    displayProjects(uniqueProjects);
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
        
        const hasFiles = project.files && project.files.length > 0;
        const openFolderBtn = project.status === 'latest' && hasFiles ? 
            `<button class="open-folder-btn" onclick="openProjectFolder('${project.id}'); event.stopPropagation();">Open Folder</button>` : '';
        
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

// Listen for localStorage changes and page focus
window.addEventListener('storage', function(e) {
    if (e.key === 'projects' || e.key === 'adminProjects' || e.key === 'devnex_projects') {
        loadProjects();
    }
});

// Expose clear function globally for manual use
window.clearHistory = clearBrowserHistory;

// Reload when page gets focus (switching from admin panel)
window.addEventListener('focus', function() {
    loadProjects();
});

// Auto refresh every 5 seconds to sync with admin changes
setInterval(() => {
    loadProjects();
    loadPortfolioProjects();
}, 5000);

// Spider Web Animation
class SpiderWeb {
    constructor() {
        this.canvas = document.getElementById('spiderWeb');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.mouse = { x: 0, y: 0 };
        this.maxDistance = 120;
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
        const numPoints = Math.floor((this.canvas.width * this.canvas.height) / 25000);
        
        for (let i = 0; i < numPoints; i++) {
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4
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
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const dx = this.points[i].x - this.points[j].x;
                const dy = this.points[i].y - this.points[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.maxDistance) {
                    const opacity = (1 - distance / this.maxDistance) * 0.25;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
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
                const opacity = (1 - distance / this.maxDistance) * 0.4;
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(this.points[i].x, this.points[i].y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();
            }
        }
        
        // Draw points
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    }
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.className = 'fas fa-moon';
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
function openProjectFolder(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id == projectId);
    
    if (project && project.files && project.files.length > 0) {
        let folderContent = `Project: ${project.title || project.name}\n\nFiles:\n`;
        project.files.forEach(file => {
            folderContent += `- ${file.name}\n`;
        });
        alert(folderContent);
    } else {
        alert('No files found in this project');
    }
}

// Clear browser history function
function clearBrowserHistory() {
    try {
        // Clear session storage
        sessionStorage.clear();
        
        // Clear local storage (optional - comment out if you want to keep projects)
        // localStorage.clear();
        
        // Replace current history state
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, window.location.pathname);
        }
        
        // Clear browser cache (limited - requires user permission)
        if ('caches' in window) {
            caches.keys().then(function(names) {
                names.forEach(function(name) {
                    caches.delete(name);
                });
            });
        }
        
        console.log('Browser history and cache cleared successfully!');
        
        // Optional: Reload page to ensure clean state
        // window.location.reload();
        
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

// Load portfolio projects for homepage
function loadPortfolioProjects() {
    // Skip loading - portfolio section removed
    return;
}

// Display portfolio projects on homepage
function displayPortfolioProjects(projects) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    const loadingMessage = document.getElementById('portfolioLoading');
    const noProjectsMessage = document.getElementById('noProjectsMessage');
    const projectCountElement = document.getElementById('projectCount');
    
    if (!portfolioGrid) return;
    
    loadingMessage.style.display = 'none';
    
    // Update project count in stats
    if (projectCountElement) {
        projectCountElement.textContent = '15+';
    }
    
    // Filter only completed projects (latest status)
    const completedProjects = projects.filter(project => 
        project.status === 'latest' || project.status === 'completed'
    ).slice(0, 6); // Show max 6 projects
    
    if (completedProjects.length === 0) {
        noProjectsMessage.style.display = 'block';
        return;
    }
    
    const projectsHtml = completedProjects.map(project => {
        // Parse tech stack from description or use default
        const techStack = extractTechStack(project.description) || ['Web Dev', 'Modern', 'Responsive'];
        
        return `
            <div class="portfolio-item">
                <div class="portfolio-image" style="${project.image ? `background-image: url(${project.image}); background-size: cover; background-position: center;` : ''}">
                    <div class="portfolio-overlay">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="tech-stack">
                            ${techStack.map(tech => `<span>${tech}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    portfolioGrid.innerHTML = projectsHtml;
}

// Extract tech stack from project description
function extractTechStack(description) {
    const techKeywords = {
        'python': 'Python',
        'javascript': 'JavaScript',
        'react': 'React',
        'node': 'Node.js',
        'django': 'Django',
        'flask': 'Flask',
        'ai': 'AI',
        'ml': 'ML',
        'machine learning': 'ML',
        'artificial intelligence': 'AI',
        'web': 'Web Dev',
        'mobile': 'Mobile',
        'api': 'API',
        'database': 'Database',
        'automation': 'Automation'
    };
    
    if (!description) return null;
    
    const foundTech = [];
    const lowerDesc = description.toLowerCase();
    
    Object.keys(techKeywords).forEach(keyword => {
        if (lowerDesc.includes(keyword) && foundTech.length < 3) {
            const tech = techKeywords[keyword];
            if (!foundTech.includes(tech)) {
                foundTech.push(tech);
            }
        }
    });
    
    return foundTech.length > 0 ? foundTech : null;
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing application...');
    
    // Auto cleanup on load
    autoCleanup();
    
    loadProjects();
    // Portfolio projects removed
    
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