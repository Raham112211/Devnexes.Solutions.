// Advanced Portfolio Animations JavaScript

// Magnetic button effect
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .service-item, .tech-category');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.02)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0px, 0px) scale(1)';
        });
    });
}

// Smooth reveal animation
function initSmoothReveal() {
    const reveals = document.querySelectorAll('.tech-item, .skill-item');
    
    reveals.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });
}



// Initialize advanced animations
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initMagneticButtons();
        initSmoothReveal();
    }, 1000);
});