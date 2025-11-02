// Simple Admin Panel JavaScript

// Simple login functionality - Fixed
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username === 'raham' && password === 'King12@4') {
                sessionStorage.setItem('adminAuth', 'authenticated');
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('adminChoice').style.display = 'block';
            } else {
                const errorDiv = document.getElementById('loginError');
                if (errorDiv) {
                    errorDiv.style.display = 'block';
                }
            }
        });
    }
});

// Password toggle function
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput && toggleIcon) {
        try {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                toggleIcon.className = 'fas fa-eye';
            }
        } catch (error) {
            console.log('Toggle password error:', error);
        }
    }
}

// Secure logout functionality - Fixed
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('adminAuth');
                document.getElementById('loginForm').style.display = 'flex';
                document.getElementById('adminChoice').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'none';
                const usernameField = document.getElementById('username');
                const passwordField = document.getElementById('password');
                if (usernameField) usernameField.value = '';
                if (passwordField) passwordField.value = '';
            }
        });
    }
});

// Add second logout button handler
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn2 = document.getElementById('logoutBtn2');
    if (logoutBtn2) {
        logoutBtn2.addEventListener('click', function() {
            document.getElementById('loginForm').style.display = 'flex';
            document.getElementById('adminChoice').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'none';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        });
    }
});

// File upload variables
let selectedFiles = [];

// Toggle file upload section
function toggleFileUpload() {
    const status = document.getElementById('projectStatus').value;
    const fileSection = document.getElementById('fileUploadSection');
    
    if (status === 'latest') {
        fileSection.style.display = 'block';
    } else {
        fileSection.style.display = 'none';
        selectedFiles = [];
        document.getElementById('selectedItems').innerHTML = '';
    }
}

// Image upload handling
const imageInput = document.getElementById('projectImage');
if (imageInput) {
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.innerHTML = `
                        <div class="image-uploaded">
                            <img src="${e.target.result}" alt="Project Image" />
                            <div class="image-overlay">
                                <button type="button" class="change-image" onclick="document.getElementById('projectImage').click()">
                                    <i class="fas fa-edit"></i> Change
                                </button>
                                <button type="button" class="remove-image" onclick="removeImage()">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    `;
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Remove image function
function removeImage() {
    document.getElementById('projectImage').value = '';
    document.getElementById('imagePreview').innerHTML = `
        <div class="upload-placeholder">
            <i class="fas fa-camera"></i>
            <h5>Add Project Image</h5>
            <p>Click to browse or drag & drop</p>
            <span class="supported-formats">JPG, PNG, GIF up to 5MB</span>
        </div>
    `;
}

// File selection
function selectFiles() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    selectedFiles = [...selectedFiles, ...files];
    displaySelectedFiles();
});

// Drag and drop
const uploadArea = document.getElementById('uploadArea');

uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    selectedFiles = [...selectedFiles, ...files];
    displaySelectedFiles();
});

// Display selected files
function displaySelectedFiles() {
    const selectedItems = document.getElementById('selectedItems');
    
    selectedItems.innerHTML = selectedFiles.map((file, index) => `
        <div class="selected-file">
            <i class="fas fa-file"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button type="button" class="remove-file" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove file
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displaySelectedFiles();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// This will be handled by the inline script in admin.html

// Load projects - Fixed
function loadProjects() {
    fetch('/api/projects')
    .then(response => response.json())
    .then(data => {
        const projects = data.projects || [];
        const container = document.getElementById('projectsContainer');
        if (!container) return;
        
        if (projects.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-light);">No projects found</div>';
            return;
        }
        
        const projectsHtml = projects.map(project => `
            <div class="data-row">
                <div class="row-header">
                    <div class="row-title">${project.title}</div>
                    <div class="row-status status-${project.status}">${project.status}</div>
                </div>
                <div style="color: var(--text-light); margin-bottom: 1rem;">${project.description}</div>
                <div class="row-actions">
                    <button onclick="editProject(${project.id})" class="action-btn btn-primary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteProject(${project.id})" class="action-btn btn-danger">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = projectsHtml;
    })
    .catch(error => {
        console.error('Error loading projects:', error);
    });
}

// Clear all projects function - Fixed
function clearAllProjects() {
    if (confirm('Are you sure you want to delete ALL projects? This cannot be undone!')) {
        showLoading('Clearing all projects...');
        
        fetch('/api/projects')
        .then(response => response.json())
        .then(data => {
            const projects = data.projects || [];
            const deletePromises = projects.map(project => 
                fetch(`/api/projects/${project.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${btoa('raham:King12@4')}`
                    }
                })
            );
            
            return Promise.all(deletePromises);
        })
        .then(() => {
            hideLoading();
            loadProjects();
            updateDashboardStats();
            alert('✅ All projects cleared!');
        })
        .catch(error => {
            hideLoading();
            alert('❌ Error clearing projects!');
        });
    }
}



// Delete project - Fixed
function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        showLoading('Deleting project...');
        
        fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${btoa('raham:King12@4')}`
            }
        })
        .then(response => response.json())
        .then(result => {
            hideLoading();
            
            if (result.success) {
                loadProjects();
                updateDashboardStats();
                alert('✅ Project deleted successfully!');
            } else {
                alert('❌ Error deleting project: ' + result.message);
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            alert('❌ Error deleting project!');
        });
    }
}

// Edit project - Fixed
function editProject(id) {
    fetch('/api/projects')
    .then(response => response.json())
    .then(data => {
        const project = data.projects.find(p => p.id == id);
        
        if (project) {
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectDesc').value = project.description;
            document.getElementById('projectStatus').value = project.status;
            
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
    })
    .catch(error => {
        alert('❌ Error loading project!');
    });
}

// Add updateDashboardStats function - Fixed
function updateDashboardStats() {
    fetch('/api/projects')
    .then(response => response.json())
    .then(projectsData => {
        const projects = projectsData.projects || [];
        
        // Only update elements if they exist
        const totalEl = document.getElementById('totalProjects');
        const activeEl = document.getElementById('activeProjects');
        const pendingEl = document.getElementById('pendingRequests');
        const reviewsEl = document.getElementById('totalReviews');
        
        if (totalEl) totalEl.textContent = projects.length;
        if (activeEl) activeEl.textContent = projects.filter(p => p.status === 'progress').length;
        if (pendingEl) pendingEl.textContent = '0';
        if (reviewsEl) reviewsEl.textContent = '0';
    })
    .catch(error => {
        console.error('Error updating stats:', error);
    });
}

// Loading wheel functions
function showLoading(message = 'Processing...') {
    const loader = document.createElement('div');
    loader.id = 'loadingWheel';
    loader.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <div style="color: #333; font-weight: 600;">${message}</div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loadingWheel');
    if (loader) loader.remove();
}