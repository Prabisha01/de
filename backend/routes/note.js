const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  createNote,
  getNotesByBoard,
  updateNote,
  deleteNote,
} = require("../controllers/note");

router.post("/create", protect, createNote);
router.get("/board/:boardId", protect, getNotesByBoard);
router.put("/update/:noteId", protect, updateNote);
router.delete("/delete/:noteId", protect, deleteNote);

module.exports = router;
