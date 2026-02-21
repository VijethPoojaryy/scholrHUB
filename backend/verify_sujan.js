const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function verifySujan() {
    const usn = 'sujan';
    const password = '123456';
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE usn = ?', [usn]);
        if (rows.length === 0) {
            console.log('User sujan not found.');
            return;
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password '123456' match for sujan: ${isMatch}`);

        // Let's also check if there's any other faculty
        const [faculty] = await pool.execute('SELECT * FROM users WHERE role = "Faculty"');
        console.log('Other Faculty:', faculty.map(f => f.usn));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

verifySujan();
