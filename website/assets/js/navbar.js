// Navbar functionality
class Navbar {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollEffect();
        this.setupThemeToggle();
        this.setupProjectsButton();
        this.setupHubButton();
    }

    setupScrollEffect() {
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 0) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        const themeIcon = themeToggle.querySelector('i');
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-moon';
        }

        themeToggle.addEventListener('click', () => {
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
    }

    setupProjectsButton() {
        const projectsBtn = document.getElementById('projectsBtn');
        if (projectsBtn) {
            projectsBtn.addEventListener('click', () => {
                window.open('projects.html', '_blank');
            });
        }
    }

    setupHubButton() {
        const hubBtn = document.getElementById('hubBtn');
        if (hubBtn) {
            hubBtn.addEventListener('click', () => {
                const newWindow = window.open('hub.html', '_blank');
                if (!newWindow) {
                    window.location.href = 'hub.html';
                }
            });
        }
    }
}

// Initialize navbar
document.addEventListener('DOMContentLoaded', () => {
    new Navbar();
});