const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'King12@4',
            database: process.env.DB_NAME || 'devnex_solutions'
        });

        console.log('✅ Database connection successful!');
        
        // Check tables
        const [tables] = await db.execute('SHOW TABLES');
        console.log('\n📋 Tables in database:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });

        // Check projects count
        const [projects] = await db.execute('SELECT COUNT(*) as count FROM projects');
        console.log(`\n📊 Projects: ${projects[0].count}`);

        // Check reviews count
        const [reviews] = await db.execute('SELECT COUNT(*) as count FROM reviews');
        console.log(`💬 Reviews: ${reviews[0].count}`);

        await db.end();
        console.log('\n🎉 Database is working perfectly!');
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
        
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 Database does not exist. Run START.bat to create it.');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 MySQL is not running. Start XAMPP/WAMP first.');
        }
    }
}

checkDatabase();