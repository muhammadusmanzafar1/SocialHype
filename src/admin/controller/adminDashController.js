const dashboardService = require('../services/dashboardService');

exports.getMetrics = async (req, res) => {
    const metrics = await dashboardService.getMetrics(req.query);
    return metrics;
}

exports.getUserStatics = async (req, res) => {
    const { range = 'day' } = query;
    const now = new Date();
    const data = await dashboardService.getGroupedUserStats(range, now);
    const trend = await dashboardService.getUserChangeStats(range, now);
  
    return {
      data,
      change: trend,
    };
}

exports.getTrafficByUser = async (req, res) => {
    const data = await dashboardService.getTrafficByUser();
    return data;
}

exports.getTopCountries = async (req, res) => {
    const data = await dashboardService.getTopCountries();
    return data;
}