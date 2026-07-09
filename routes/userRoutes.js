const express = require('express');

const router = express.Router();

const controller =
require('../controllers/userController');

const { requireLogin } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');



router.get(
    '/users',
    requireLogin,
    requireAdmin,
    controller.list
);

router.get(
    '/users/create',
    requireLogin,
    requireAdmin,
    controller.createPage
);

router.post(
    '/users/create',
    requireLogin,
    requireAdmin, 
    controller.create
);

router.get(
    '/users/edit/:id',
    requireLogin,
    requireAdmin,
    controller.editPage
);

router.post(
    '/users/edit/:id',
    requireLogin,
    requireAdmin,
    controller.update
);

router.post(
    '/users/deactivate/:id',
    requireLogin,
    requireAdmin,
    controller.deactivate
);

router.post(
    '/users/activate/:id',
    requireLogin,
    requireAdmin,
    controller.activate
);

module.exports=router;