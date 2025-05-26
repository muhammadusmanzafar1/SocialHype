const express = require("express");
const app = express.Router();
const { validate } = require('../../../middlewares/auth.js')

app.use("/userProfile", validate, require("./userProfileRoute.js"));
app.use("/post", validate, require("./userPostRoute.js"));
app.use("/comment", validate, require("./PostCommentRouter.js"));
app.use("/community", validate, require("./UserCommunityRouter.js"));
app.use("/challenge", validate, require("./hypeChallengeRouter.js"));

module.exports = app;