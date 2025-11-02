const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

async function migrateData() {
    try {
        console.log('🔄 Starting data migration from SQLite to MySQL...');
        
        // Connect to MySQL
        const mysqlDb = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'King12@4',
            database: process.env.DB_NAME || 'devnex_solutions'
        });
        
        console.log('✅ Connected to MySQL');
        
        // Connect to SQLite
        const sqliteDb = new sqlite3.Database('./devnex_contacts.db');
        
        // Migrate Projects
        console.log('📊 Migrating projects...');
        sqliteDb.all('SELECT * FROM projects', async (err, projects) => {
            if (!err && projects.length > 0) {
                for (const project of projects) {
                    await mysqlDb.execute(
                        'INSERT IGNORE INTO projects (id, title, description, status, image, files, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [project.id, project.title, project.description, project.status, project.image, project.files, project.created_at]
                    );
                }
                console.log(`✅ Migrated ${projects.length} projects`);
            }
        });
        
        // Migrate Reviews/Comments
        console.log('💬 Migrating reviews/comments...');
        sqliteDb.all('SELECT * FROM reviews', async (err, reviews) => {
            if (!err && reviews.length > 0) {
                for (const review of reviews) {
                    await mysqlDb.execute(
                        'INSERT IGNORE INTO reviews (id, name, email, rating, review_text, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                        [review.id, review.name, review.email, review.rating, review.review_text, review.created_at]
                    );
                }
                console.log(`✅ Migrated ${reviews.length} reviews`);
            }
        });
        
        // Migrate Contacts
        console.log('📧 Migrating contacts...');
        sqliteDb.all('SELECT * FROM contacts', async (err, contacts) => {
            if (!err && contacts.length > 0) {
                for (const contact of contacts) {
                    await mysqlDb.execute(
                        'INSERT IGNORE INTO contacts (id, name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                        [contact.id, contact.name, contact.email, contact.subject, contact.message, contact.created_at]
                    );
                }
                console.log(`✅ Migrated ${contacts.length} contacts`);
            }
        });
        
        // Migrate Project Requests
        console.log('📋 Migrating project requests...');
        sqliteDb.all('SELECT * FROM project_requests', async (err, requests) => {
            if (!err && requests.length > 0) {
                for (const request of requests) {
                    await mysqlDb.execute(
                        'INSERT IGNORE INTO project_requests (id, client_name, client_email, client_phone, company, project_type, project_title, project_description, budget, timeline, additional_info, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [request.id, request.client_name, request.client_email, request.client_phone, request.company, request.project_type, request.project_title, request.project_description, request.budget, request.timeline, request.additional_info, request.status, request.created_at]
                    );
                }
                console.log(`✅ Migrated ${requests.length} project requests`);
            }
        });
        
        setTimeout(async () => {
            sqliteDb.close();
            await mysqlDb.end();
            console.log('🎉 Data migration completed successfully!');
        }, 2000);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    }
}

migrateData();