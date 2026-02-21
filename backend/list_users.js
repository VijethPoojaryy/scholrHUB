const pool = require('./config/db');

async function listUsers() {
    try {
        const [rows] = await pool.execute('SELECT * FROM users');
        console.log('--- START USER LIST ---');
        rows.forEach(u => {
            console.log(`ID: ${u.id} | USN: ${u.usn} | Role: ${u.role} | Name: ${u.name}`);
        });
        console.log('--- END USER LIST ---');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

listUsers();
