const express = require("express");
const app = express.Router();
const { validate } = require('../../../middlewares/auth.js')

app.use("/userProfile", validate, require("./userProfileRoute.js"));
app.use("/post", validate, require("./userPostRoute.js"));
app.use("/comment", validate, require("./PostCommentRouter.js"));
app.use("/community", validate, require("./UserCommunityRouter.js"), require("./communityMember.js"));
app.use("/challenge", validate, require("./hypeChallengeRouter.js"));
app.use("/notification", validate, require("./notificationRouter.js"));
app.use('/follower', validate, require('./followerRoute.js'));
app.use("/story", validate, require("./storyRouter.js"));
app.use("/poll", validate, require("./pollRouter.js"));

module.exports = app;