const db = require('../config/db');

async function findByUsername(username) {
    const [rows] = await db.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );

    return rows.length ? rows[0] : null;
}

module.exports = {
    findByUsername
};