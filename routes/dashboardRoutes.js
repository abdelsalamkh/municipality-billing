const express = require('express');
const router = express.Router();

const controller = require('../controllers/dashboardController');
const { requireLogin } = require('../middleware/auth');

router.get('/dashboard', requireLogin, controller.index);

module.exports = router;