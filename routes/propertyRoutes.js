const express = require('express');
const router = express.Router();

const controller = require('../controllers/propertyController');
const { requireLogin } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');

const upload = require('../middleware/upload');


router.get('/properties', requireLogin, controller.list);
router.get('/properties/create',requireAdmin, requireLogin, controller.createPage);
router.post('/properties/create',requireAdmin, requireLogin, controller.create);
router.get(
    '/properties/import',
    requireLogin,
    requireAdmin,
    controller.importPage
);
router.post(
    '/properties/import',
    requireLogin,
    requireAdmin,
    upload.single('excel'),
    controller.importExcel
);

router.get(
    '/properties/export',
    requireLogin,
    requireAdmin,
    controller.exportExcel
);

router.get('/properties/:id', requireLogin, controller.details);

router.post('/properties/delete/:id',requireAdmin, requireLogin, controller.delete);
router.get('/properties/edit/:id',requireAdmin,  requireLogin, controller.editPage);
router.post('/properties/edit/:id',requireAdmin, requireLogin, controller.update);






module.exports = router;