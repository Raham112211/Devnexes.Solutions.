const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    try {
        // First connect without database to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'King12@4'
        });

        // Create database
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'devnex_solutions'}`);
        console.log('✅ Database created successfully');

        // Close connection
        await connection.end();

        // Now connect to the database
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'King12@4',
            database: process.env.DB_NAME || 'devnex_solutions'
        });

        // Create tables
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

        // Insert default projects
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM projects');
        if (rows[0].count === 0) {
            await db.execute('INSERT INTO projects (title, description, status) VALUES (?, ?, ?)', 
                ['Latest Project', 'Web Development', 'latest']);
            await db.execute('INSERT INTO projects (title, description, status) VALUES (?, ?, ?)', 
                ['In Progress', 'Python Development', 'progress']);
            await db.execute('INSERT INTO projects (title, description, status) VALUES (?, ?, ?)', 
                ['Upcoming', 'AI Integration', 'upcoming']);
        }

        console.log('✅ All tables created successfully');
        console.log('✅ Default projects inserted');
        
        await db.end();
        console.log('🎉 Database setup complete!');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();