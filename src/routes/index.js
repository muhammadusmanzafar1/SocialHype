const express = require("express");
const app = express.Router();
const { validate } = require('../../middlewares/auth')

app.use("/", validate, require("../../src/auth/routes/userProfileRoute"));