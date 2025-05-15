const express = require("express");
const app = express.Router();

const adminRoutes = require('./adminRouter');
const adminDashboardRoutes = require('./adminDashboardRouter');

app.use('/user-management', adminRoutes);
app.use('/dashboard', adminDashboardRoutes);

module.exports = app;