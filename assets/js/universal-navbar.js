// Universal Navbar JavaScript - Same functionality as main site
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality - Database Storage
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const userId = 'user_' + (navigator.userAgent.hashCode ? navigator.userAgent.hashCode() : 'default');
        
        // Load theme from database
        loadThemeFromDatabase(userId, themeToggle);

        themeToggle.addEventListener('click', async function(e) {
            e.preventDefault();
            const isDark = document.documentElement.hasAttribute('data-theme');
            
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                this.querySelector('i').className = 'fas fa-sun';
                await saveThemeToDatabase(userId, 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                this.querySelector('i').className = 'fas fa-moon';
                await saveThemeToDatabase(userId, 'dark');
            }
        });
    }
    
    // Theme helper functions
    async function loadThemeFromDatabase(userId, themeToggle) {
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
            document.documentElement.removeAttribute('data-theme');
            themeToggle.querySelector('i').className = 'fas fa-sun';
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
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});