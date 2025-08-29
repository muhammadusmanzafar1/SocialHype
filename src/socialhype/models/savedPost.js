import mongoose from "mongoose";

const savedPostSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }, // Ref to the User model
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  }, // Ref to the Post model
  // taggedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ref to the tagged User
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SavedPost", savedPostSchema);
