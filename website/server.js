const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Database setup
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'King12@4',
    database: process.env.DB_NAME || 'devnex_solutions'
};

let db;

// Initialize database connection
async function initDatabase() {
    try {
        // First connect without database to create it
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        // Create database if it doesn't exist
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log('✅ Database created/verified');
        await tempConnection.end();
        
        // Now connect to the database
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database');
        await createTables();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('💡 Make sure MySQL is running and credentials are correct in .env file');
        process.exit(1);
    }
}

// Create tables
async function createTables() {
    try {

        await db.execute(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS project_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_name VARCHAR(255) NOT NULL,
                client_email VARCHAR(255) NOT NULL,
                client_phone VARCHAR(20),
                company VARCHAR(255),
                project_type VARCHAR(100) NOT NULL,
                project_title VARCHAR(255) NOT NULL,
                project_description TEXT NOT NULL,
                budget VARCHAR(50),
                timeline VARCHAR(50),
                additional_info TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(50) NOT NULL,
                image TEXT,
                files TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                rating INT DEFAULT 5,
                review_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert default projects if table is empty
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM projects');
        if (rows[0].count === 0) {
            const defaultProjects = [
                { title: 'Latest Project', description: 'Web Development', status: 'latest' },
                { title: 'In Progress', description: 'Python Development', status: 'progress' },
                { title: 'Upcoming', description: 'AI Integration', status: 'upcoming' }
            ];
            
            for (const project of defaultProjects) {
                await db.execute('INSERT INTO projects (title, description, status) VALUES (?, ?, ?)', 
                    [project.title, project.description, project.status]);
            }
        }
        
        console.log('✅ Database tables created successfully');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
    }
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

app.get('/start-project.html', (req, res) => {
    res.sendFile(__dirname + '/start-project.html');
});





// Admin login
app.post('/api/admin/login', adminAuth, (req, res) => {
    res.json({ success: true, message: 'Login successful' });
});

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
        res.json({ projects: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Add new project (admin only)
app.post('/api/projects', async (req, res) => {
    const { title, description, status, image, files } = req.body;
    
    try {
        const [result] = await db.execute(
            'INSERT INTO projects (title, description, status, image, files) VALUES (?, ?, ?, ?, ?)',
            [title, description, status, image, JSON.stringify(files || [])]
        );
        res.json({ 
            success: true, 
            id: result.insertId,
            message: 'Project added successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project (admin only)
app.put('/api/projects/:id', async (req, res) => {
    const { title, description, status, image, files } = req.body;
    const { id } = req.params;
    
    try {
        await db.execute(
            'UPDATE projects SET title = ?, description = ?, status = ?, image = ?, files = ? WHERE id = ?',
            [title, description, status, image, JSON.stringify(files || []), id]
        );
        res.json({ 
            success: true, 
            message: 'Project updated successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete project (admin only)
app.delete('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.execute('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ 
            success: true, 
            message: 'Project deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message, type } = req.body;
    
    try {
        await db.execute(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject || type, message]
        );
        
        res.json({ 
            success: true, 
            message: 'Message sent successfully!' 
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message.' 
        });
    }
});

// Project request submission
app.post('/api/project-request', async (req, res) => {
    const { 
        clientName, clientEmail, clientPhone, company, 
        projectType, projectTitle, projectDescription, 
        budget, timeline, additionalInfo 
    } = req.body;
    
    try {
        await db.execute(
            `INSERT INTO project_requests 
             (client_name, client_email, client_phone, company, project_type, 
              project_title, project_description, budget, timeline, additional_info) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [clientName, clientEmail, clientPhone, company, projectType, 
             projectTitle, projectDescription, budget, timeline, additionalInfo]
        );
        
        res.json({ 
            success: true, 
            message: 'Project request submitted successfully!' 
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit project request.' 
        });
    }
});

// Get all project requests
app.get('/api/project-requests', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM project_requests ORDER BY created_at DESC');
        res.json({ requests: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project request status
app.put('/api/project-requests/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        await db.execute(
            'UPDATE project_requests SET status = ? WHERE id = ?',
            [status, id]
        );
        res.json({ 
            success: true, 
            message: 'Status updated successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reviews API endpoints
app.get('/api/reviews', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM reviews ORDER BY created_at DESC');
        res.json({ reviews: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    const { name, email, rating, review_text } = req.body;
    
    try {
        const [result] = await db.execute(
            'INSERT INTO reviews (name, email, rating, review_text) VALUES (?, ?, ?, ?)',
            [name, email, rating, review_text]
        );
        res.json({ 
            success: true, 
            id: result.insertId,
            message: 'Review added successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'DevNexes Solutions API is running!' });
});

// Start server
async function startServer() {
    await initDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 DevNexes Solutions server running on http://localhost:${PORT}`);
        console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
        console.log(`💬 Comments: http://localhost:${PORT}/hub.html`);
        console.log(`📊 API endpoints ready!`);
    });
}

startServer().catch(console.error);