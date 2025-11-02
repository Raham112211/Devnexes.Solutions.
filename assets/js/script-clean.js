// Clean Working Script - No Errors

// Theme Toggle - Database Storage
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        const userId = 'user_' + (navigator.userAgent.hashCode ? navigator.userAgent.hashCode() : 'default');
        const icon = themeToggle.querySelector('i');
        
        // Load theme from database
        loadThemeFromDatabase(userId, icon);
        
        // Click handler - save to database
        themeToggle.onclick = async function() {
            const isDark = document.documentElement.hasAttribute('data-theme');
            
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
}

// Theme helper functions
async function loadThemeFromDatabase(userId, icon) {
    try {
        const response = await fetch(`/api/preferences/${userId}`);
        const data = await response.json();
        const savedTheme = data.preferences?.theme || 'light';
        
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-moon';
        } else {
            document.documentElement.removeAttribute('data-theme');
            icon.className = 'fas fa-sun';
        }
    } catch (error) {
        document.documentElement.removeAttribute('data-theme');
        icon.className = 'fas fa-sun';
    }
}

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

// Add hashCode function
if (!String.prototype.hashCode) {
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
}

// Navbar Scroll Effect
function initNavbarScroll() {
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Projects Button
function initProjectsButton() {
    const projectsBtn = document.querySelector('.projects-btn');
    if (projectsBtn) {
        projectsBtn.onclick = function() {
            window.open('projects.html', '_blank');
        };
    }
}

// Hub Button
function initHubButton() {
    const hubBtn = document.querySelector('.hub-btn');
    if (hubBtn) {
        hubBtn.onclick = function() {
            const newWindow = window.open('hub.html', '_blank');
            if (!newWindow) {
                window.location.href = 'hub.html';
            }
        };
    }
}

// Initialize Everything
window.addEventListener('load', function() {
    try {
        initThemeToggle();
        initNavbarScroll();
        initProjectsButton();
        initHubButton();
        console.log('✅ All navbar functions loaded successfully');
    } catch (error) {
        console.error('❌ Error loading navbar:', error);
    }
});