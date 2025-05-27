const express = require("express");
const app = express.Router();

const adminRoutes = require('./adminRouter');
const adminDashboardRoutes = require('./adminDashboardRouter');
const adminCommunityRoutes = require('./adminCommunityRouter');
const adminComMemberRoutes = require('./adminComMemberRouter');
const adminComPostRoutes = require('./adminComPostRouter');
const adminPostReports = require('./adminPostReportsRouter');
const adminApplication = require('./adminComApplicationRouter')

app.use('/user-management', adminRoutes);
app.use('/dashboard', adminDashboardRoutes);
app.use('/community-management', adminCommunityRoutes, adminComMemberRoutes, adminComPostRoutes, adminPostReports, adminApplication);


module.exports = app;