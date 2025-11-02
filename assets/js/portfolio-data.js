// Portfolio Real-time Data Integration
document.addEventListener('DOMContentLoaded', function() {
    loadRealTimeData();
    initTechShowcase();
    setInterval(loadRealTimeData, 10000); // Update every 10 seconds
});

// Load real-time data from database API
async function loadRealTimeData() {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        const projects = data.projects || [];
        
        console.log('Loading data from database - Projects:', projects.length);
        
        // Update developer stats
        updateDeveloperStats(projects);
        
        // Update live stats
        updateLiveStats();
    } catch (error) {
        console.error('Error loading projects:', error);
        updateDeveloperStats([]);
        updateLiveStats();
    }
}

// Initialize tech showcase interactions
function initTechShowcase() {
    const techCategories = document.querySelectorAll('.tech-category');
    
    techCategories.forEach(category => {
        category.addEventListener('click', function() {
            // Remove active class from all categories
            techCategories.forEach(cat => cat.classList.remove('active'));
            
            // Add active class to clicked category
            this.classList.add('active');
            
            // Add pulse animation to tech items
            const techItems = this.querySelectorAll('.tech-item');
            techItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'techPulse 0.5s ease';
                    setTimeout(() => {
                        item.style.animation = '';
                    }, 500);
                }, index * 100);
            });
        });
    });
}

// Update live stats with dynamic data
function updateLiveStats() {
    // Simulate real-time updates
    const baseStats = {
        linesOfCode: 50000,
        hoursWorked: 2500,
        coffeeConsumed: 1200
    };
    
    // Add some randomness to make it feel live
    const variance = Math.floor(Math.random() * 100);
    
    animateCounter(document.getElementById('linesOfCode'), baseStats.linesOfCode + variance, 2000, '+');
    animateCounter(document.getElementById('hoursWorked'), baseStats.hoursWorked + Math.floor(variance/2), 2000, '+');
    animateCounter(document.getElementById('coffeeConsumed'), baseStats.coffeeConsumed + Math.floor(variance/3), 2000, '+');
}

// Update developer stats with real data
function updateDeveloperStats(projects) {
    // Count projects same as main site
    const totalProjects = projects.length;
    
    // Update projects completed stat
    const projectsCompletedElement = document.getElementById('projectsCompleted');
    if (projectsCompletedElement) {
        // Show total projects count (same as main site)
        animateCounter(projectsCompletedElement, totalProjects);
    }
    
    console.log('Portfolio - Total projects found:', totalProjects);
}





// Animate counter with smooth transition
function animateCounter(element, target, duration = 1000, suffix = '') {
    if (!element) return;
    
    const start = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            element.textContent = formatNumber(target) + suffix;
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current)) + suffix;
        }
    }, 16);
}

// Format numbers with commas and suffixes
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
}

// Auto refresh data every 10 seconds
setInterval(loadRealTimeData, 10000);

// Add tech showcase animations
function addTechAnimations() {
    const techCategories = document.querySelectorAll('.tech-category');
    const statBoxes = document.querySelectorAll('.stat-box');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    [...techCategories, ...statBoxes].forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
}

// Add CSS animation for tech pulse effect
function addTechPulseAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes techPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize animations after DOM load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addTechAnimations();
        addTechPulseAnimation();
    }, 1000);
});

// Refresh data when page gets focus
window.addEventListener('focus', function() {
    loadRealTimeData();
});