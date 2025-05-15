const express = require("express");
const app = express.Router();
const { validate } = require('../../../middlewares/auth.js')

app.use("/profile", validate, require("./userProfileRoute.js"));
app.use("/post", validate, require("./userPostRoute.js"));

module.exports = app;