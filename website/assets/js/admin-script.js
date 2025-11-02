// Simple Admin Panel JavaScript

// Login functionality
document.getElementById('adminLogin').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'raham' && password === 'devnex2024') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminChoice').style.display = 'flex';
    } else {
        alert('Invalid credentials!');
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', logout);

function logout() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminChoice').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// File upload variables
let selectedFiles = [];

// Toggle file upload section
function toggleFileUpload() {
    const status = document.getElementById('projectStatus').value;
    const imageSection = document.getElementById('imageUploadSection');
    const fileSection = document.getElementById('fileUploadSection');
    
    if (status) {
        // Show image upload for all statuses
        imageSection.style.display = 'block';
        
        // Show file upload only for latest
        if (status === 'latest') {
            fileSection.style.display = 'block';
        } else {
            fileSection.style.display = 'none';
            selectedFiles = [];
            document.getElementById('selectedItems').innerHTML = '';
        }
    } else {
        imageSection.style.display = 'none';
        fileSection.style.display = 'none';
        selectedFiles = [];
        document.getElementById('selectedItems').innerHTML = '';
    }
}

// Image upload handling
document.getElementById('projectImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
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
        };
        reader.readAsDataURL(file);
    }
});

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

// Add/Edit project form
document.getElementById('addProjectForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('projectTitle').value;
    const description = document.getElementById('projectDesc').value;
    const status = document.getElementById('projectStatus').value;
    const imageFile = document.getElementById('projectImage').files[0];
    const editId = document.getElementById('submitBtn').getAttribute('data-edit-id');
    
    let imageData = null;
    if (imageFile) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    }
    
    const projectData = {
        title,
        description,
        status,
        image: imageData,
        files: status === 'latest' ? selectedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
        })) : []
    };
    
    // Keep existing image if editing and no new image
    if (editId && !imageFile) {
        const existingImg = document.querySelector('#imagePreview img');
        if (existingImg) {
            projectData.image = existingImg.src;
        }
    }
    
    try {
        const url = editId ? `http://localhost:3000/api/projects/${editId}` : 'http://localhost:3000/api/projects';
        const method = editId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reset form
            document.getElementById('addProjectForm').reset();
            selectedFiles = [];
            document.getElementById('selectedItems').innerHTML = '';
            document.getElementById('imageUploadSection').style.display = 'none';
            document.getElementById('fileUploadSection').style.display = 'none';
            document.getElementById('imagePreview').innerHTML = `
                <div class="upload-placeholder">
                    <i class="fas fa-camera"></i>
                    <h5>Add Project Image</h5>
                    <p>Click to browse or drag & drop</p>
                    <span class="supported-formats">JPG, PNG, GIF up to 5MB</span>
                </div>
            `;
            document.getElementById('submitBtn').textContent = 'Add Project';
            document.getElementById('submitBtn').removeAttribute('data-edit-id');
            
            // Reload projects
            loadProjects();
            
            const isEdit = editId ? true : false;
            alert(isEdit ? 'Project updated successfully!' : 'Project added successfully!');
        } else {
            console.error('Server response:', result);
            alert('Error adding project: ' + (result.message || result.error));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding project: ' + error.message);
    }
});

// Load projects
async function loadProjects() {
    console.log('Loading projects...');
    
    try {
        const response = await fetch('http://localhost:3000/api/projects');
        const data = await response.json();
        const projects = data.projects || [];
        
        console.log('Projects from server:', projects);
        
        const container = document.getElementById('projectsContainer');
        
        if (!container) {
            console.error('Projects container not found!');
            return;
        }
        
        if (projects.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: #666; margin-bottom: 20px;">No projects yet. Add your first project above.</p>
            `;
            return;
        }
        
        container.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-title">${project.title}</div>
                    <div class="project-status ${project.status}">${project.status}</div>
                </div>
                <div class="project-desc">${project.description}</div>
                <div class="project-meta">
                    <span>${new Date(project.created_at).toLocaleDateString()}</span>
                    <span>ID: ${project.id}</span>
                </div>
                <div class="project-actions">
                    <button class="edit-btn" onclick="editProject(${project.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteProject(${project.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('Projects loaded successfully');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Clear all projects function
function clearAllProjects() {
    if (confirm('Are you sure you want to delete ALL projects? This cannot be undone!')) {
        localStorage.removeItem('projects');
        localStorage.removeItem('adminProjects');
        localStorage.removeItem('devnex_projects');
        loadProjects();
        alert('All projects cleared!');
    }
}



// Delete project
async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                loadProjects();
                alert('Project deleted successfully!');
            } else {
                alert('Error deleting project: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting project!');
        }
    }
}

// Edit project
async function editProject(id) {
    try {
        const response = await fetch('http://localhost:3000/api/projects');
        const data = await response.json();
        const project = data.projects.find(p => p.id == id);
        
        if (project) {
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectDesc').value = project.description;
            document.getElementById('projectStatus').value = project.status;
            
            // Show image section for all projects
            document.getElementById('imageUploadSection').style.display = 'block';
            if (project.image) {
                document.getElementById('imagePreview').innerHTML = `<img src="${project.image}" alt="Project Image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px;">`;
            }
            
            // Show file section only for latest
            if (project.status === 'latest') {
                document.getElementById('fileUploadSection').style.display = 'block';
            }
            
            document.getElementById('submitBtn').textContent = 'Update Project';
            document.getElementById('submitBtn').setAttribute('data-edit-id', id);
        }
    } catch (error) {
        alert('Error loading project!');
    }
}