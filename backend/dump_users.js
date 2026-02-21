const pool = require('./config/db');
const fs = require('fs');

async function dumpUsers() {
    try {
        const [rows] = await pool.execute('SELECT * FROM users');
        fs.writeFileSync('users_dump.json', JSON.stringify(rows, null, 2));
        console.log('Dumped users to users_dump.json');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

dumpUsers();
