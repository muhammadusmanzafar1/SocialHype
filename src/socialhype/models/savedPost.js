import mongoose from 'mongoose';

const savedPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ref to the User model
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Ref to the Post model
  taggedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ref to the tagged User
});

export default mongoose.model('SavedPost', savedPostSchema);
