const db = require('../config/db');

// Get all active properties
async function getAll(filters) {

    let sql = `
        SELECT * FROM properties
        WHERE active = true
    `;

    const params = [];

    if (filters.occupant) {
        sql += ` AND occupant LIKE ?`;
        params.push(`%${filters.occupant}%`);
    }

    if (filters.neighborhood) {
        sql += ` AND neighborhood = ?`;
        params.push(filters.neighborhood);
    }

    sql += ` ORDER BY id DESC`;

    const [rows] = await db.execute(sql, params);

    return rows;
}
// Get by id
async function getById(id) {
    const [rows] = await db.execute(
        'SELECT * FROM properties WHERE id = ?',
        [id]
    );
    return rows[0];
}

// Create property
async function create(data) {

    const [countRows] = await db.execute(
        'SELECT COUNT(*) as count FROM properties'
    );

    const count = countRows[0].count + 1;

    const propertyCode = `MH-${String(count).padStart(6, '0')}`;

    const sql = `
        INSERT INTO properties (
            propertyCode,
            owner,
            ownerPhone,
            occupant,
            occupantPhone,
            description,
            floor,
            category,
            neighborhood,
            hasWater,
            hasTrash,
            active
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,true)
    `;

    const values = [
        propertyCode,
        data.owner,
        data.ownerPhone,
        data.occupant,
        data.occupantPhone,
        data.description,
        data.floor,
        data.category,
        data.neighborhood,
        data.hasWater ? 1 : 0,
        data.hasTrash ? 1 : 0
    ];

    await db.execute(sql, values);
}

// Soft delete
async function remove(id) {
    await db.execute(
        'UPDATE properties SET active = false WHERE id = ?',
        [id]
    );
}

async function update(id, data) {

    const sql = `
        UPDATE properties
        SET
            owner = ?,
            ownerPhone = ?,
            occupant = ?,
            occupantPhone = ?,
            description = ?,
            floor = ?,
            propertyType = ?,
            category = ?,
            neighborhood = ?,
            hasWater = ?,
            hasTrash = ?,
            hasExemption = ?
        WHERE id = ?
    `;

    await db.execute(sql, [
        data.owner,
        data.ownerPhone,
        data.occupant,
        data.occupantPhone,
        data.description,
        data.floor,
        data.propertyType,
        data.category,
        data.neighborhood,
        data.hasWater ? 1 : 0,
        data.hasTrash ? 1 : 0,
        data.hasExemption ? 1 : 0,
        id
    ]);
}

async function getNeighborhoods() {

    const [rows] = await db.execute(

        `SELECT DISTINCT neighborhood
         FROM properties
         ORDER BY neighborhood`

    );

    return rows.map(r => r.neighborhood);

}

async function getByNeighborhood(neighborhood) {

    const [rows] = await db.execute(

        `SELECT *
         FROM properties
         WHERE neighborhood = ?
         ORDER BY propertyCode`,

        [neighborhood]

    );

    return rows;

}

module.exports = {
    getAll,
    getById,
    create,
    remove,
    update,
    getNeighborhoods,
    getByNeighborhood
};