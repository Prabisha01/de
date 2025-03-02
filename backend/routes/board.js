const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/uploads");

const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  toggleFavorite,
  getBoardsByUser,
  searchBoards,
  createElement,
  uploadFile,
  processPdf,
  exportBoard,
  uploadImageToBoard,
  getBoardImages 
} = require("../controllers/board");

router.get("/getAllBoards", protect, getBoards);
router.get("/:boardId", protect, getBoard);
router.post("/createBoard", protect, createBoard);
router.put("/:boardId", protect, updateBoard);
router.post("/:boardId/upload", uploadImageToBoard);
router.get("/users/:userId", protect, getBoardsByUser);
router.delete("/:id", protect, deleteBoard);
router.get("/search", protect, searchBoards);
router.patch("/toggleFavorite/:boardId", protect, toggleFavorite);
router.post("/:boardId/elements", protect, createElement);
router.post("/:boardId/upload", protect, uploadFile);
router.post("/:boardId/pdf", protect, processPdf);
router.get("/:boardId/export", protect, exportBoard);
router.get("/:boardId/images", getBoardImages );


module.exports = router;
