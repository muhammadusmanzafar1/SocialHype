const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userDevice: { type: String, required: true },
    activityType: {
      type: String,
      enum: [
        'LOGIN', 'LOGOUT',
        'UPDATED_NAME', 'UPDATED_PASSWORD',
        'COMMENTED', 'LIKED',
        'POSTED_POLL', 'POSTED_POST',
        'STARTED_LIVE', 'POSTED_STORY',
        'ADDED_PAYMENT_METHOD', 'ADDED_PAYOUT_METHOD'
      ],
      required: true
    },
    activityDetails: { type: String },
    timestamp: { type: Date, default: Date.now }
  });
  

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;