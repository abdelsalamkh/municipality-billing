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

async function getDailyCollection() {

    const [rows] = await db.execute(`
        SELECT
            DATE(paymentDate) day,
            billType,
            SUM(amount) amount
        FROM bills
        WHERE status='Paid'
        GROUP BY DATE(paymentDate), billType
        ORDER BY day
    `);

    const map = {};

    rows.forEach(r => {

        const day = r.day.toISOString().split('T')[0];

        if (!map[day]) {

            map[day] = {
                water: 0,
                trash: 0
            };

        }

        if (r.billType === 'Water')
            map[day].water = Number(r.amount);

        if (r.billType === 'Trash')
            map[day].trash = Number(r.amount);

    });

    return {

        labels: Object.keys(map),

        water: Object.values(map).map(x => x.water),

        trash: Object.values(map).map(x => x.trash)

    };

};

async function getMonthlyCollection ()  {

    const [rows] = await db.execute(`
        SELECT
            YEAR(paymentDate) y,
            MONTH(paymentDate) m,
            billType,
            SUM(amount) amount
        FROM bills
        WHERE status='Paid'
        GROUP BY
            YEAR(paymentDate),
            MONTH(paymentDate),
            billType
        ORDER BY
            y,m
    `);

    const months = {};

    rows.forEach(r => {

        const label = `${r.y}-${String(r.m).padStart(2,'0')}`;

        if (!months[label]) {

            months[label] = {
                water: 0,
                trash: 0
            };

        }

        if (r.billType === 'Water')
            months[label].water = Number(r.amount);

        if (r.billType === 'Trash')
            months[label].trash = Number(r.amount);

    });

    return {

        labels: Object.keys(months),

        water: Object.values(months).map(x => x.water),

        trash: Object.values(months).map(x => x.trash)

    };

};

async function getWaterPie () {

    const [rows] = await db.execute(`
        SELECT
            status,
            COUNT(*) total
        FROM bills
        WHERE billType='Water'
        GROUP BY status
    `);

    let paid = 0;
    let pending = 0;

    rows.forEach(r => {

        if (r.status === 'Paid')
            paid = r.total;

        else
            pending = r.total;

    });

    return {

        paid,

        pending

    };

};

async function getTrashPie() {

    const [rows] = await db.execute(`
        SELECT
            status,
            COUNT(*) total
        FROM bills
        WHERE billType='Trash'
        GROUP BY status
    `);

    let paid = 0;
    let pending = 0;

    rows.forEach(r => {

        if (r.status === 'Paid')
            paid = r.total;

        else
            pending = r.total;

    });

    return {

        paid,

        pending

    };

};

module.exports = {
    getStats, getDailyCollection, getMonthlyCollection, getWaterPie, getTrashPie
};