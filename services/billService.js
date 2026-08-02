const db = require('../config/db');

// Get all bills
async function getAll(filters = {}) {

    let sql = `

        SELECT

            bills.*,

            properties.propertyCode,

            properties.occupant,

            properties.neighborhood

        FROM bills

        JOIN properties
            ON bills.propertyId = properties.id

        WHERE 1 = 1

    `;

    const params = [];

    if (filters.occupant) {

        sql += ` AND properties.occupant LIKE ?`;

        params.push(`%${filters.occupant}%`);

    }

    if (filters.neighborhood) {

        sql += ` AND properties.neighborhood = ?`;

        params.push(filters.neighborhood);

    }

    if (filters.status === 'Paid') {

        sql += ` AND bills.status = 'Paid'`;

    }

    if (filters.status === 'Pending') {

        sql += ` AND bills.status = 'Pending'`;

    }

    sql += `

        ORDER BY

            bills.year DESC,

            bills.month DESC,

            bills.paymentDate DESC,

            bills.billNumber DESC

    `;

    const [rows] = await db.execute(sql, params);

    console.log(rows);

    return rows;

}

async function getBillsByPropertyId(id) {
    const [bills] = await db.execute(`
        SELECT * FROM bills
        WHERE propertyId = ?
        ORDER BY year DESC, month DESC
    `, [id]);

    return bills;
}

// Create bill
async function create(data, userId) {

    const billCode = generateBillCode();

    const sql = `
        INSERT INTO bills (
            billNumber,
            billCode,
            propertyId,
            billType,
            year,
            month,
            amount,
            status,
            receivedByUserId
        )
        VALUES (?,?,?,?,?,?,?, 'Pending', ?)
    `;

   const [result] =  await db.execute(sql, [
        billCode,
        billCode,
        data.propertyId,
        data.billType,
        data.year,
        data.month,
        data.amount,
        userId
    ]);

    const billNumber = `${String(result.insertId).padStart(6, '0')}`;

await db.execute(
    `UPDATE bills
     SET billNumber = ?
     WHERE id = ?`,
    [billNumber, result.insertId]
);
}

// Pay bill
async function pay(id, userId) {
    await db.execute(`
        UPDATE bills
        SET status = 'Paid',
            paymentDate = NOW(),
            receivedByUserId = ?
        WHERE id = ?
    `, [userId, id]);
}


async function generate({
    year,
    month,
    generateWater,
    generateTrash,
    userId
}) {

    const result = {
        success: true,
        waterCreated: 0,
        trashCreated: 0,
        skippedExemption: 0,
        skippedNoWater: 0,
        skippedNoTrash: 0,
        duplicateBills: 0
    };

    const [properties] = await db.execute(
        "SELECT * FROM properties WHERE active = 1"
    );

    for (const property of properties) {

        // Skip exempt properties
        if (property.hasExemption) {
            result.skippedExemption++;
            continue;
        }

        // Water bills
        if (generateWater) {

            if (!property.hasWater) {
                result.skippedNoWater++;
            } else {

                const created = await createBill(
                    property,
                    'Water',
                    15,
                    year,
                    month,
                    userId
                );

                if (created)
                    result.waterCreated++;
                else
                    result.duplicateBills++;

            }

        }

        // Trash bills
        if (generateTrash) {

            if (!property.hasTrash) {
                result.skippedNoTrash++;
            } else {

                const created = await createBill(
                    property,
                    'Trash',
                    getTrashPrice(property.category),
                    year,
                    month,
                    userId
                );

                if (created)
                    result.trashCreated++;
                else
                    result.duplicateBills++;

            }

        }

    }

    result.message = "تم إنشاء الفواتير بنجاح.";

    return result;

}

async function createBill(
    property,
    billType,
    amount,
    year,
    month,
    userId
) {

    const [existing] = await db.execute(
        `SELECT id
         FROM bills
         WHERE propertyId = ?
         AND billType = ?
         AND year = ?
         AND month = ?`,
        [
            property.id,
            billType,
            year,
            month
        ]
    );

    if (existing.length > 0)
        return false;

    const billNumber = await generateBillNumber();
    const billCode = generateBillCode();

    await db.execute(
        `INSERT INTO bills
        (
            billNumber,
            billCode,
            propertyId,
            billType,
            year,
            month,
            amount,
            status
                    )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [
            billNumber,
            billCode,
            property.id,
            billType,
            year,
            month,
            amount
        ]
    );

    return true;

}

async function generateBillNumber() {

    const [rows] = await db.execute(
        'SELECT IFNULL(MAX(id), 0) AS maxId FROM bills'
    );
    
    const nextId = rows[0].maxId + 1;
    
    const billNumber = `${String(nextId).padStart(6, '0')}`;

    return String(billNumber).padStart(8, '0');

}

function generateBillCode() {

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "MH-";

    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;

}

function getTrashPrice(category){

    switch(category){

        case 'A':
            return 20;

        case 'B':
            return 15;

        case 'C':
            return 10;

        default:
            return 5;

    }

}


async function getByCode(code){

    const [rows] = await db.execute(

        `SELECT
    bills.*,
    properties.propertyCode,
    properties.owner,
    properties.neighborhood,
    properties.occupant,
    users.name AS receivedByName
FROM bills
JOIN properties
    ON properties.id = bills.propertyId
LEFT JOIN users
    ON users.id = bills.receivedByUserId
WHERE bills.billCode = ?`,

        [code]

    );

    return rows[0];

}

async function getReceipt(id) {

    const [rows] = await db.execute(

        `SELECT

            b.*,

            p.propertyCode,
            p.owner,
            p.occupant,
            p.neighborhood,

            u.name AS receivedBy

        FROM bills b

        JOIN properties p
            ON p.id = b.propertyId

        LEFT JOIN users u
            ON u.id = b.receivedByUserId

        WHERE b.id = ?`,

        [id]

    );

    return rows[0];

}




async function financialReport(filters = {}) {

    let sql = `
        SELECT
            b.id,
            b.billType,
            b.amount,
            b.paymentDate,
            p.occupant,
            p.neighborhood,
            u.name AS receivedBy
        FROM bills b
        INNER JOIN properties p
            ON p.id = b.propertyId
        LEFT JOIN users u
            ON u.id = b.receivedByUserId
        WHERE b.status = 'Paid'
    `;

    const params = [];

    if (filters.from) {
        sql += ` AND DATE(b.paymentDate) >= ?`;
        params.push(filters.from);
    }

    if (filters.to) {
        sql += ` AND DATE(b.paymentDate) <= ?`;
        params.push(filters.to);
    }

    if (filters.billType) {
        sql += ` AND b.billType = ?`;
        params.push(filters.billType);
    }

    if (filters.neighborhood) {
        sql += ` AND p.neighborhood = ?`;
        params.push(filters.neighborhood);
    }

    sql += `
        ORDER BY
            b.paymentDate DESC,
            p.occupant
    `;

    const [rows] = await db.execute(sql, params);

    return rows;

}

async function financialTotals(filters = {}) {

    let sql = `
        SELECT
            b.billType,
            SUM(b.amount) AS total
        FROM bills b
        INNER JOIN properties p
            ON p.id = b.propertyId
        WHERE b.status = 'Paid'
    `;

    const params = [];

    if (filters.from) {
        sql += ` AND DATE(b.paymentDate) >= ?`;
        params.push(filters.from);
    }

    if (filters.to) {
        sql += ` AND DATE(b.paymentDate) <= ?`;
        params.push(filters.to);
    }

    if (filters.billType) {
        sql += ` AND b.billType = ?`;
        params.push(filters.billType);
    }

    if (filters.neighborhood) {
        sql += ` AND p.neighborhood = ?`;
        params.push(filters.neighborhood);
    }

    sql += `
        GROUP BY b.billType
    `;

    const [rows] = await db.execute(sql, params);

    let water = 0;
    let trash = 0;

    rows.forEach(r => {

        if (r.billType === 'Water')
            water = Number(r.total);

        if (r.billType === 'Trash')
            trash = Number(r.total);

    });

    return {

        water,

        trash,

        total: water + trash

    };

}



module.exports = {
    getAll,
    create,
    pay, getBillsByPropertyId, generate, getByCode, getReceipt,
    financialReport,

    financialTotals
};