const mongoose = require("mongoose");
const { Schema } = mongoose;

const entitySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    type: {
        type: String,
        enum: ["mobile", "web"],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    country: {
        type: String,
        required: true,
    },
});

const Entity = mongoose.model("appVisit", entitySchema);
module.exports = Entity;