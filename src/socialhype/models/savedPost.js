const mongoose = require('mongoose');

const savedPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ref to the User model
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Ref to the Post model
  taggedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ref to the tagged User
});

const Entity = mongoose.model('SavedPost', savedPostSchema);
module.exports = Entity;
