const pool = require('./config/db');

async function checkUser() {
    const usn = 'sujan';
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE usn = ?', [usn]);
        if (rows.length > 0) {
            console.log('User found:', {
                id: rows[0].id,
                usn: rows[0].usn,
                role: rows[0].role,
                name: rows[0].name
            });
        } else {
            console.log('User NOT found in database.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkUser();
