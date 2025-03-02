const mongoose = require("mongoose");

const BoardSchema = new mongoose.Schema({
  boardName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  elements: [
    {
      type: {
        type: String,
        enum: ["text", "image"],
        required: true,
      },
      content: {
        type: String, // Stores text or image URL
        required: true,
      },
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Board", BoardSchema);
