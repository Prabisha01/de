const Note = require("../models/note");

// @desc    Create a new note
// @route   POST /api/v1/note/create
// @access  Private
exports.createNote = async (req, res) => {
  try {
    const { boardId, content, type, position, size } = req.body;

    if (!boardId || !content) {
      return res
        .status(400)
        .json({ message: "Board ID and content are required" });
    }

    const note = await Note.create({ boardId, content, type, position, size });

    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all notes for a board
// @route   GET /api/v1/note/board/:boardId
// @access  Private
exports.getNotesByBoard = async (req, res) => {
  try {
    const notes = await Note.find({ boardId: req.params.boardId });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update a note
// @route   PUT /api/v1/note/update/:noteId
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.noteId,
      req.body,
      { new: true }
    );

    if (!updatedNote) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res.status(200).json({ success: true, note: updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a note
// @route   DELETE /api/v1/note/delete/:noteId
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.noteId);

    if (!deletedNote) {
      return res
        .status(404)
        .json({ success: false, message: "Note not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
