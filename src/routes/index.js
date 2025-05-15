const express = require("express");
const app = express.Router();

const admin = require('../admin/routes/index');
const user = require('../socialhype/routes/index')
const auth = require('../auth/routes/authRoute');

app.use('/admin', admin);
app.use('/user', user);
app.use('/auth', auth);

module.exports = app;