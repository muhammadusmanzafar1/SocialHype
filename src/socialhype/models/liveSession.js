const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  hostUserId: { type: String, required: true },
  isLive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  viewers: [{ type: Number, default: 0 }],
  chatMessages: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      message: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  streamId: { type: String },
});

const Live = mongoose.model('LiveSession', liveSessionSchema);
module.exports = Live;
