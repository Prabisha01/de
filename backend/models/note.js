const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  position: {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 },
  },
  size: {
    width: { type: Number, default: 200 },
    height: { type: Number, default: 100 },
  },
  type: {
    type: String,
    enum: ["text", "image", "doodle"],
    default: "text",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Note", NoteSchema);
