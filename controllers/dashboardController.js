const dashboardService = require('../services/dashboardService');

exports.index = async (req, res) => {

    const stats = await dashboardService.getStats();
    console.log(stats)

    res.render('dashboard/index', {
        user: req.session.user,
        stats
    });
};