const dashboardService = require('../services/dashboardService');

exports.index = async (req, res) => {

    const [
        stats,
        dailyChart,
        monthlyChart,
        waterPie,
        trashPie
    ] = await Promise.all([

        dashboardService.getStats(),
        dashboardService.getDailyCollection(),
        dashboardService.getMonthlyCollection(),
        dashboardService.getWaterPie(),
        dashboardService.getTrashPie()

    ]);

    res.render('dashboard/index', {
        user: req.session.user,
        stats,
        dailyChart,

            monthlyChart,

            waterPie,

            trashPie
    });
};