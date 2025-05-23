const express = require("express");
const app = express.Router();

const adminRoutes = require('./adminRouter');
const adminDashboardRoutes = require('./adminDashboardRouter');
const adminCommunityRoutes = require('./adminCommunityRouter');
const adminComMemberRoutes = require('./adminComMemberRouter');

app.use('/user-management', adminRoutes);
app.use('/dashboard', adminDashboardRoutes);
app.use('/community-management', adminCommunityRoutes, adminComMemberRoutes);


module.exports = app;