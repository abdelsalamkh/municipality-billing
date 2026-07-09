const db = require('../config/db');
const bcrypt = require('bcrypt');

async function getAll() {

    const [rows] = await db.execute(`
        SELECT *
        FROM users
        WHERE active = 1
        ORDER BY name
    `);

    return rows;
}

async function getById(id) {

    const [rows] = await db.execute(
        "SELECT * FROM users WHERE id=?",
        [id]
    );

    return rows[0];
}

async function create(data) {

    const [existing] = await db.execute(

        `SELECT id
         FROM users
         WHERE username = ?`,

        [
            data.username,
        ]

    );

    if (existing.length > 0) {

        throw new Error("اسم المستخدم مستخدم بالفعل.");

    }

    const password = await bcrypt.hash(data.password, 10);

    await db.execute(

        `INSERT INTO users
        (
            name,
            username,
            password,
            role
        )
        VALUES(?,?,?,?)`,

        [
            data.name,
            data.username,
            password,
            'cashier'
        ]

    );

}

async function update(id, data) {

    const [existing] = await db.execute(

        `SELECT id
         FROM users
         WHERE username = ?
         AND id <> ?`,

        [
            data.username,
            id
        ]

    );

    if (existing.length > 0) {

        throw new Error("اسم المستخدم مستخدم بالفعل.");

    }

    await db.execute(

        `UPDATE users
         SET
            name = ?,
            username = ?
         WHERE id = ?`,

        [
            data.name,
            data.username,
            id
        ]

    );

}

async function updatePassword(id,password){

    const hash = await bcrypt.hash(password,10);

    await db.execute(

        "UPDATE users SET password=? WHERE id=?",

        [
            hash,
            id
        ]

    );

}

async function deactivate(id) {

    await db.execute(
        "UPDATE users SET active = 0 WHERE id = ?",
        [id]
    );

}

async function activate(id) {

    await db.execute(
        "UPDATE users SET active = 1 WHERE id = ?",
        [id]
    );

}

module.exports = {
    getAll,
    getById,
    create,
    update,
    updatePassword,
    deactivate,
    activate
};