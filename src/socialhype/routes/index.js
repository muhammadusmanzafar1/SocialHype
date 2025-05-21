const express = require("express");
const app = express.Router();
const { validate } = require('../../../middlewares/auth.js')

app.use("/profile", require("./userProfileRoute.js"));
app.use("/post", require("./userPostRoute.js"));

module.exports = app;