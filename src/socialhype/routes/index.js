const express = require("express");
const app = express.Router();
const { validate } = require('../../../middlewares/auth')

app.use("/", validate, require("./userProfileRoute.js"));

module.exports = app;