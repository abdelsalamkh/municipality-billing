const express = require('express');
const router = express.Router();

const controller = require('../controllers/billController');
const { requireLogin } = require('../middleware/auth');

router.get('/bills', requireLogin, controller.list);

router.get('/bills/report', requireLogin, controller.financialReport);

router.get('/verify-bill', controller.verifyPage);

router.post('/verify-bill', controller.verify);

router.get('/bills/create/:propertyId/:type', requireLogin, controller.createPage);

router.post('/bills/create', requireLogin, controller.create);

router.post('/bills/pay/:id', requireLogin, controller.pay);

router.get('/bills/generate', requireLogin, controller.generatePage);

router.post('/bills/generate', requireLogin, controller.generate);

router.get(
    '/bills/receipt/:id',
    requireLogin,
    controller.receipt
);

module.exports = router;