const mongoose = require("mongoose");
const { Schema } = mongoose;

const entitySchema = new Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required: true,
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    platformShare: {
        type: Number,
        required: true,
    },
    creatorShare: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const Entity = mongoose.model("exclusiveContentPurchase", entitySchema);
module.exports = Entity;