const dashboardService = require('../services/dashboardService');

exports.index = async (req, res) => {

    const stats = await dashboardService.getStats();

    res.render('dashboard/index', {
        user: req.session.user,
        stats
    });
};