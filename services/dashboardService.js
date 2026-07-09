const db = require('../config/db');

async function getStats() {

    const [[properties]] = await db.execute(
        'SELECT COUNT(*) as total FROM properties WHERE active = true'
    );

    const [[waterBills]] = await db.execute(
        "SELECT COUNT(*) as total FROM bills WHERE billType='Water'"
    );

    const [[trashBills]] = await db.execute(
        "SELECT COUNT(*) as total FROM bills WHERE billType='Trash'"
    );

    const [[unpaidBills]] = await db.execute(
        "SELECT COUNT(*) as total FROM bills WHERE status='Pending'"
    );

    const [[paidToday]] = await db.execute(`
        SELECT COALESCE(SUM(amount),0) as total
        FROM bills
        WHERE status='Paid'
        AND DATE(paymentDate) = CURDATE()
    `);

    const [[monthlyCollection]] = await db.execute(`
        SELECT COALESCE(SUM(amount),0) as total
        FROM bills
        WHERE status='Paid'
        AND MONTH(paymentDate) = MONTH(CURDATE())
        AND YEAR(paymentDate) = YEAR(CURDATE())
    `);

    // const [[recentPayments]] = await db.execute(`
    //     SELECT b.billNumber, b.amount, b.paymentDate, p.propertyCode, p.occupant
    //     FROM bills b
    //     JOIN properties p ON p.id = b.propertyId
    //     WHERE b.status='Paid'
    //     ORDER BY b.paymentDate DESC
    //     LIMIT 5
    // `);

    return {
        properties: properties.total,
        waterBills: waterBills.total,
        trashBills: trashBills.total,
        unpaidBills: unpaidBills.total,
        paidToday: paidToday.total,
        monthlyCollection: monthlyCollection.total,
        // recentPayments
    };
}

module.exports = {
    getStats
};