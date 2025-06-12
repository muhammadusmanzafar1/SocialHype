const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  media: {
    type: [String],
    default: [],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isHypeChallenge: {
    type: Boolean,
    default: false
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HypeChallenge',
  },
  votes: {
    type: Number,
    default: 0
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  comments: {
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  taggedPeople: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  sharedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  shareCount: {
    type: Number,
    default: 0,
  },
  interests: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Public', 'Friends', 'Private', 'Restricted', 'disabled'],
    default: 'Public',
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  exclusive: {
    type: Boolean,
    default: false,
  },
  reports: [
    {
      report: { type: mongoose.Schema.Types.ObjectId, ref: 'PostReport' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Entity = mongoose.model('Post', PostSchema);
module.exports = Entity;