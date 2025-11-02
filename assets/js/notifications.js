// Enhanced Notification System
class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', options = {}) {
        const {
            title = this.getDefaultTitle(type),
            duration = 5000,
            persistent = false,
            sound = false,
            actions = []
        } = options;

        const notification = this.createNotification(message, type, title, persistent, sound, actions);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Play sound if enabled
        if (sound) {
            this.playNotificationSound(type);
        }

        // Auto remove after duration
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    createNotification(message, type, title, persistent, sound, actions) {
        const notification = document.createElement('div');
        notification.className = `notification ${type} ${sound ? 'with-sound' : ''}`;

        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="notification-header">
                <div style="display: flex; align-items: center;">
                    <div class="notification-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${title}</div>
                        <div class="notification-message">${message}</div>
                    </div>
                </div>
                ${!persistent ? '<button class="notification-close"><i class="fas fa-times"></i></button>' : ''}
            </div>
            ${!persistent ? '<div class="notification-progress"></div>' : ''}
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.remove(notification);
            });
        }

        // Add click to dismiss
        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-close') && !persistent) {
                this.remove(notification);
            }
        });

        return notification;
    }

    remove(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.add('removing');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            loading: 'fas fa-spinner'
        };
        return icons[type] || icons.info;
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'Success!',
            error: 'Error!',
            warning: 'Warning!',
            info: 'Information',
            loading: 'Loading...'
        };
        return titles[type] || 'Notification';
    }

    playNotificationSound(type) {
        // Create audio context for notification sounds
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different notification types
            const frequencies = {
                success: 800,
                error: 400,
                warning: 600,
                info: 500
            };

            oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    loading(message, options = {}) {
        return this.show(message, 'loading', { ...options, persistent: true });
    }

    // Clear all notifications
    clearAll() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }

    // Update existing notification
    update(notification, message, type) {
        if (!notification) return;
        
        const messageEl = notification.querySelector('.notification-message');
        const iconEl = notification.querySelector('.notification-icon i');
        
        if (messageEl) messageEl.textContent = message;
        if (iconEl) iconEl.className = this.getIcon(type);
        
        notification.className = `notification ${type}`;
    }
}

// Create global notification manager
window.notifications = new NotificationManager();

// Global notification functions for backward compatibility
window.showNotification = (message, type = 'info', options = {}) => {
    return window.notifications.show(message, type, options);
};

window.showSuccess = (message, options = {}) => {
    return window.notifications.success(message, options);
};

window.showError = (message, options = {}) => {
    return window.notifications.error(message, options);
};

window.showWarning = (message, options = {}) => {
    return window.notifications.warning(message, options);
};

window.showInfo = (message, options = {}) => {
    return window.notifications.info(message, options);
};

window.showLoading = (message, options = {}) => {
    return window.notifications.loading(message, options);
};