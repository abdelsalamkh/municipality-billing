const billService = require('../services/billService');

const propertyService = require('../services/propertyService');


// List
exports.list = async (req, res) => {

    const filters = {
        occupant: req.query.occupant || '',
        neighborhood: req.query.neighborhood || ''
    };

    const bills = await billService.getAll(filters);

    const neighborhoods =
        await propertyService.getNeighborhoods();

    res.render('bills/list', {

        user: req.session.user,

        bills,

        filters,

        neighborhoods

    });

};

// Create page
exports.createPage = (req, res) => {

    res.render('bills/create', {
        user: req.session.user,
        propertyId: req.params.propertyId,
        type: req.params.type
    });
};

// Create
exports.create = async (req, res) => {

    await billService.create(req.body, req.session.user.id);

    res.redirect('/bills');
};

// Pay bill
exports.pay = async (req, res) => {

    await billService.pay(req.params.id, req.session.user.id);

    res.redirect('/bills');
};

/**
 * Display the monthly bill generation page
 */
exports.generatePage = (req, res) => {

    const today = new Date();

    res.render('bills/generate', {
        user: req.session.user,
        currentYear: today.getFullYear(),
        currentMonth: today.getMonth() + 1,
        result: null
    });

};

exports.generate = async (req, res) => {

    try {

        const {
            year,
            month,
            generateWater,
            generateTrash
        } = req.body;

        if (!generateWater && !generateTrash) {

            return res.render('bills/generate', {
                user: req.session.user,
                currentYear: year,
                currentMonth: month,
                result: {
                    success: false,
                    message: "يرجى اختيار نوع فاتورة واحد على الأقل."
                }
            });

        }

        const result = await billService.generate({
            year: Number(year),
            month: Number(month),
            generateWater: !!generateWater,
            generateTrash: !!generateTrash,
            userId: req.session.user.id
        });

        res.render('bills/generate', {
            user: req.session.user,
            currentYear: year,
            currentMonth: month,
            result
        });

    } catch (err) {

        console.error(err);

        res.render('bills/generate', {
            user: req.session.user,
            currentYear: req.body.year,
            currentMonth: req.body.month,
            result: {
                success: false,
                message: "حدث خطأ أثناء إنشاء الفواتير."
            }
        });

    }

};

exports.verifyPage = (req, res) => {

    res.render('public/verifyBill', {
        bill: null,
        error: null
    });

};

exports.verify = async (req, res) => {

    const bill = await billService.getByCode(req.body.billCode);

    if (!bill) {

        return res.render('public/verifyBill', {
            bill: null,
            error: 'لم يتم العثور على فاتورة بهذا الرمز.'
        });

    }

    res.render('public/verifyBill', {
        bill,
        error: null
    });

};

exports.receipt = async (req, res) => {

    const bill = await billService.getReceipt(req.params.id);

    if (!bill) {
        return res.status(404).send("الفاتورة غير موجودة");
    }

    res.render('bills/receipt', {
        bill
    });

};