const mongoose = require("mongoose");
const { Schema } = mongoose;

const activityLogSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        activityType: {
            type: String,
            enum: ["login", "logout", "post", "comment", "like"],
            required: true,
        },
        deviceInfo: {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;