const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const JWT_SECRET = process.env.JWT_SECRET || 'devnex_secure_key_2024';

// Security middleware
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// Database setup
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'King12@4',
    database: process.env.DB_NAME || 'devnex_solutions',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
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
        
        await db.execute(`
            CREATE TABLE IF NOT EXISTS feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                service VARCHAR(100) NOT NULL,
                rating INT NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // User preferences table for theme and settings
        await db.execute(`
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                preference_key VARCHAR(100) NOT NULL,
                preference_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_pref (user_id, preference_key)
            )
        `);
        
        // Admin sessions table for authentication
        await db.execute(`
            CREATE TABLE IF NOT EXISTS admin_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_token VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(100) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);



        // Insert default data if tables are empty
        const [projectRows] = await db.execute('SELECT COUNT(*) as count FROM projects');
        if (projectRows[0].count === 0) {
            const defaultProjects = [
                { title: 'Latest Project', description: 'Web Development', status: 'latest' },
                { title: 'In Progress', description: 'Python Development', status: 'progress' }
            ];
            
            for (const project of defaultProjects) {
                await db.execute('INSERT INTO projects (title, description, status) VALUES (?, ?, ?)', 
                    [project.title, project.description, project.status]);
            }
        }
        
        // Insert sample project request for testing
        const [requestRows] = await db.execute('SELECT COUNT(*) as count FROM project_requests');
        if (requestRows[0].count === 0) {
            await db.execute(
                `INSERT INTO project_requests 
                 (client_name, client_email, client_phone, company, project_type, 
                  project_title, project_description, budget, timeline, additional_info, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['Test Client', 'test@example.com', '1234567890', 'Test Company', 'Web Development', 
                 'Sample Project', 'This is a test project request', '$1000-$5000', '2-4 weeks', 'Additional info here', 'pending']
            );
        }
        

        
        console.log('✅ Database tables created successfully');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
    }
}

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash('King12@4', 10);
    
    if (username === 'Devnexes' && await bcrypt.compare(password, hashedPassword)) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        req.token = token;
        next();
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
};

// Secure admin middleware for API routes
const secureAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            // Fallback to old base64 method for compatibility
            const decoded = Buffer.from(token, 'base64').toString();
            if (decoded === 'Devnexes:King12@4') {
                next();
            } else {
                res.status(401).json({ success: false, message: 'Invalid token' });
            }
        }
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized access' });
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

app.get('/hub.html', (req, res) => {
    res.sendFile(__dirname + '/hub.html');
});





// Admin login
app.post('/api/admin/login', adminAuth, (req, res) => {
    res.json({ success: true, message: 'Login successful', token: req.token });
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
app.post('/api/projects', secureAdmin, async (req, res) => {
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
app.put('/api/projects/:id', secureAdmin, async (req, res) => {
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
app.delete('/api/projects/:id', secureAdmin, async (req, res) => {
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

// Get all project requests (admin only)
app.get('/api/project-requests', secureAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM project_requests ORDER BY created_at DESC');
        res.json({ requests: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project request (admin only)
app.put('/api/project-requests/:id', secureAdmin, async (req, res) => {
    const { id } = req.params;
    const { project_title, status } = req.body;
    
    try {
        if (project_title) {
            await db.execute(
                'UPDATE project_requests SET project_title = ? WHERE id = ?',
                [project_title, id]
            );
        }
        if (status) {
            await db.execute(
                'UPDATE project_requests SET status = ? WHERE id = ?',
                [status, id]
            );
        }
        res.json({ 
            success: true, 
            message: 'Request updated successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project request status (admin only)
app.put('/api/project-requests/:id/status', secureAdmin, async (req, res) => {
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

// Delete project request (admin only)
app.delete('/api/project-requests/:id', secureAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log('Deleting request ID:', id);
        const [result] = await db.execute('DELETE FROM project_requests WHERE id = ?', [id]);
        console.log('Delete result:', result);
        
        if (result.affectedRows > 0) {
            res.json({ 
                success: true, 
                message: 'Project request deleted successfully' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Project request not found' 
            });
        }
    } catch (error) {
        console.error('Delete error:', error);
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

// Feedback API endpoints
app.get('/api/feedback', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM feedback ORDER BY created_at DESC');
        res.json({ success: true, feedback: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/feedback', async (req, res) => {
    const { name, email, service, rating, text } = req.body;
    
    if (!name || !email || !service || !rating || !text) {
        return res.status(400).json({ success: false, error: 'All fields required' });
    }
    
    try {
        const [result] = await db.execute(
            'INSERT INTO feedback (name, email, service, rating, text) VALUES (?, ?, ?, ?, ?)',
            [name, email, service, rating, text]
        );
        res.json({ 
            success: true, 
            id: result.insertId,
            message: 'Feedback submitted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/feedback/:id', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    
    try {
        await db.execute(
            'UPDATE feedback SET text = ? WHERE id = ?',
            [text, id]
        );
        res.json({ 
            success: true, 
            message: 'Feedback updated successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/feedback/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await db.execute('DELETE FROM feedback WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            res.json({ 
                success: true, 
                message: 'Feedback deleted successfully' 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Feedback not found' 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



// User Preferences API
app.get('/api/preferences/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const [rows] = await db.execute(
            'SELECT preference_key, preference_value FROM user_preferences WHERE user_id = ?',
            [userId]
        );
        
        const preferences = {};
        rows.forEach(row => {
            preferences[row.preference_key] = row.preference_value;
        });
        
        res.json({ success: true, preferences });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/preferences/:userId', async (req, res) => {
    const { userId } = req.params;
    const { key, value } = req.body;
    
    try {
        await db.execute(
            `INSERT INTO user_preferences (user_id, preference_key, preference_value) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE preference_value = VALUES(preference_value)`,
            [userId, key, value]
        );
        
        res.json({ success: true, message: 'Preference saved' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin Session Management
app.post('/api/admin/session', async (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'raham' && password === 'King12@4') {
        const sessionToken = Buffer.from(`${username}:${password}:${Date.now()}`).toString('base64');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        try {
            // Clean expired sessions
            await db.execute('DELETE FROM admin_sessions WHERE expires_at < NOW()');
            
            // Create new session
            await db.execute(
                'INSERT INTO admin_sessions (session_token, username, expires_at) VALUES (?, ?, ?)',
                [sessionToken, username, expiresAt]
            );
            
            res.json({ 
                success: true, 
                sessionToken,
                expiresAt,
                message: 'Session created successfully' 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/api/admin/session/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        const [rows] = await db.execute(
            'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
            [token]
        );
        
        if (rows.length > 0) {
            res.json({ success: true, valid: true, session: rows[0] });
        } else {
            res.json({ success: true, valid: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/admin/session/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        await db.execute('DELETE FROM admin_sessions WHERE session_token = ?', [token]);
        res.json({ success: true, message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'DevNexes Solutions API is running!' });
});

// Start server
async function startServer() {
    await initDatabase();
    
    // HTTP server
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 DevNexes Solutions server running on port ${PORT}`);
        console.log(`🔐 Admin panel: /admin`);
        console.log(`💬 Comments: /hub.html`);
        console.log(`📊 API endpoints ready!`);
    });
    
    // HTTPS server (if certificates exist)
    try {
        const httpsOptions = {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.cert')
        };
        
        https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
            console.log(`🔒 HTTPS server running on https://localhost:${HTTPS_PORT}`);
            console.log(`🔐 Admin panel: https://localhost:${HTTPS_PORT}/admin`);
            console.log(`💬 Comments: https://localhost:${HTTPS_PORT}/hub.html`);
            console.log(`📊 Secure API endpoints ready!`);
        });
    } catch (error) {
        console.log(`⚠️  HTTPS not available (certificates not found)`);
        console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
        console.log(`💬 Comments: http://localhost:${PORT}/hub.html`);
        console.log(`📊 API endpoints ready!`);
    }
}

startServer().catch(console.error);