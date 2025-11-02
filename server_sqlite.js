const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// Database setup
const dbPath = path.join(__dirname, 'database', 'devnex_solutions.db');
let db;

// Initialize database connection
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                reject(err);
            } else {
                console.log('✅ Connected to SQLite database');
                createTables().then(resolve).catch(reject);
            }
        });
    });
}

// Create tables
function createTables() {
    return new Promise((resolve, reject) => {
        const tables = [
            `CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL,
                image TEXT,
                files TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        let completed = 0;
        tables.forEach(sql => {
            db.run(sql, (err) => {
                if (err) {
                    console.error('❌ Error creating table:', err.message);
                    reject(err);
                } else {
                    completed++;
                    if (completed === tables.length) {
                        insertDefaultData().then(resolve).catch(reject);
                    }
                }
            });
        });
    });
}

// Insert default data
function insertDefaultData() {
    return new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
            if (!err && row.count === 0) {
                const defaultProjects = [
                    { title: 'DevNexes Website', description: 'Complete full-stack website with admin panel and project management system', status: 'latest' },
                    { title: 'AI Chat Bot', description: 'Python-based AI chatbot with natural language processing', status: 'progress' },
                    { title: 'E-commerce Platform', description: 'Modern e-commerce solution with payment integration', status: 'upcoming' }
                ];
                
                let inserted = 0;
                defaultProjects.forEach(project => {
                    db.run('INSERT INTO projects (title, description, status) VALUES (?, ?, ?)', 
                        [project.title, project.description, project.status], (err) => {
                            if (!err) {
                                inserted++;
                                if (inserted === defaultProjects.length) {
                                    insertDefaultComments().then(resolve);
                                }
                            }
                        });
                });
            } else {
                insertDefaultComments().then(resolve);
            }
        });
    });
}

// Insert default comments
function insertDefaultComments() {
    return new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM comments', (err, row) => {
            if (!err && row.count === 0) {
                db.run('INSERT INTO comments (name, message) VALUES (?, ?)', 
                    ['DevNexes Team', 'Welcome to our comments section! Feel free to share your thoughts.'], 
                    () => {
                        console.log('✅ Database tables created successfully');
                        resolve();
                    });
            } else {
                console.log('✅ Database tables created successfully');
                resolve();
            }
        });
    });
}

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const { username, password } = req.body;
    if (username === 'raham' && password === 'devnex2024') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/projects.html', (req, res) => {
    res.sendFile(__dirname + '/projects.html');
});

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

app.get('/admin.html', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

app.get('/hub.html', (req, res) => {
    res.sendFile(__dirname + '/hub.html');
});

// Admin login
app.post('/api/admin/login', adminAuth, (req, res) => {
    res.json({ success: true, message: 'Login successful' });
});

// Get all projects
app.get('/api/projects', (req, res) => {
    db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ projects: rows });
        }
    });
});

// Add new project
app.post('/api/projects', (req, res) => {
    const { title, description, status, image, files } = req.body;
    
    db.run('INSERT INTO projects (title, description, status, image, files) VALUES (?, ?, ?, ?, ?)',
        [title, description, status, image, JSON.stringify(files || [])], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ 
                    success: true, 
                    id: this.lastID,
                    message: 'Project added successfully' 
                });
            }
        });
});

// Update project
app.put('/api/projects/:id', (req, res) => {
    const { title, description, status, image, files } = req.body;
    const { id } = req.params;
    
    db.run('UPDATE projects SET title = ?, description = ?, status = ?, image = ?, files = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, status, image, JSON.stringify(files || []), id], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ 
                    success: true, 
                    message: 'Project updated successfully' 
                });
            }
        });
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ 
                success: true, 
                message: 'Project deleted successfully' 
            });
        }
    });
});

// Get all comments
app.get('/api/comments', (req, res) => {
    db.all('SELECT * FROM comments ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ comments: rows });
        }
    });
});

// Add new comment
app.post('/api/comments', (req, res) => {
    const { name, message } = req.body;
    
    if (!name || !message) {
        return res.status(400).json({ success: false, error: 'Name and message are required' });
    }
    
    db.run('INSERT INTO comments (name, message) VALUES (?, ?)',
        [name.trim(), message.trim()], 
        function(err) {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.json({ 
                    success: true, 
                    id: this.lastID,
                    message: 'Comment added successfully' 
                });
            }
        });
});

// Delete comment
app.delete('/api/comments/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            res.json({ 
                success: true, 
                message: 'Comment deleted successfully' 
            });
        }
    });
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message, type } = req.body;
    
    db.run('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [name, email, subject || type, message], 
        function(err) {
            if (err) {
                res.status(500).json({ 
                    success: false, 
                    message: 'Failed to send message.' 
                });
            } else {
                res.json({ 
                    success: true, 
                    message: 'Message sent successfully!' 
                });
            }
        });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'DevNexes Solutions API is running!' });
});

// Start server
async function startServer() {
    try {
        await initDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 DevNexes Solutions server running on http://localhost:${PORT}`);
            console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
            console.log(`💬 Comments: http://localhost:${PORT}/hub.html`);
            console.log(`📊 API endpoints ready!`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();