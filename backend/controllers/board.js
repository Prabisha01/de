const asyncHandler = require("../middleware/async");
const Board = require("../models/board");
const User = require("../models/user");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");


exports.uploadImageToBoard = async (req, res) => {
  try {
    console.log("📸 Image Upload Request Received", req.files);

   
    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { boardId } = req.params;
    const imageFile = req.files.image;

    console.log(" File Found:", imageFile.name, "| Temp Path:", imageFile.path);

 
    const uploadedImage = await cloudinary.uploader.upload(imageFile.path, {
      folder: "board_images",
      use_filename: true,
      unique_filename: false,
    });

    console.log(" Image Uploaded to Cloudinary:", uploadedImage.secure_url);

  
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ success: false, message: "Board not found" });
    }

    board.elements.push({ type: "image", content: uploadedImage.secure_url });
    await board.save();

   
    if (fs.existsSync(imageFile.path)) {
      fs.unlinkSync(imageFile.path);
    }

    res.status(200).json({ success: true, url: uploadedImage.secure_url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, message: "Image upload failed", error: error.message });
  }
};




// @desc    Update Board Content
// @route   PUT /api/v1/boards/:boardId
// @access  Private
exports.updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.boardId);
  if (!board) {
    return res.status(404).json({ success: false, message: "Board not found" });
  }

  // Ensure only the owner can update the board
  if (board.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "Not authorized to update this board" });
  }

  board.content = req.body.content || board.content;
  const updatedBoard = await board.save();

  res.status(200).json({ success: true, data: updatedBoard });
});

// @desc    Get all boards
// @route   GET /api/v1/boards
// @access  Private
// controllers/board.js
exports.getBoards = asyncHandler(async (req, res) => {
  try {
    
    const userId = req.user._id;

   
    const boards = await Board.find({ user: userId }).populate("user"); // Filter by user ID

    res.status(200).json({ success: true, data: boards });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

exports.getBoardImages = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ success: false, message: "Board not found" });
    }

    const images = board.elements
      .filter((element) => element.type === "image")
      .map((element) => element.content); 

    res.status(200).json({ success: true, images });
  } catch (error) {
    console.error(" Failed to retrieve images:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve images" });
  }
};

// @desc    Get single board
// @route   GET /api/v1/boards/:boardId
// @access  Private
// exports.getBoard = async (req, res, next) => {
//   try {
//     const board = await Board.findById(req.params.id);

//     if (!board) {
//       return res.status(404).json({ message: "Board not found" });
//     }

//     // Ensure the board belongs to the logged-in user
//     if (board.user.toString() !== req.user.boardId) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to access this board" });
//     }

//     res.status(200).json({ success: true, data: board });
//   } catch (err) {
//     console.error("Error fetching board:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error fetching board", error: error });
//   }
// };

// @desc    Get single board (SIMPLIFIED for DIAGNOSTIC TESTING)
// @route   GET /api/v1/boards/:boardId
// @access  Private
exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate("user")
      .lean();

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Ensure elements array exists
    board.elements = board.elements || [];

    res.status(200).json({
      success: true,
      data: board,
    });
  } catch (err) {
    console.error("Error fetching board:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getBoardsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching boards for user:", userId);

    const boards = await Board.find({ user: userId }); // Find boards but don't need to return all data in this case if only count is needed
    const boardCount = boards.length; // Calculate the count

    res.status(200).json({
      success: true,
      count: boardCount, // Just return the count
      // data: boards.map(...) -  No longer needed if we just want the count
    });
  } catch (error) {
    console.error("Error fetching board count:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch board count" });
  }
};

// @desc    Create new board
// @route   POST /api/v1/boards
// @access  Private
exports.createBoard = asyncHandler(async (req, res) => {
  try {
    const { boardName } = req.body;

    if (!boardName) {
      return res.status(400).json({
        success: false,
        message: "Board name is required",
      });
    }

    // Get user ID from authenticated user
    const userId = req.user.id;

    const board = await Board.create({
      boardName,
      user: userId, // Use the authenticated user's ID
      elements: [],
    });

    await User.findByIdAndUpdate(
      userId,
      {
        $push: { boards: board._id }, // Add the new board's _id to the user's boards array
      },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      data: board,
    });
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get single board
// @route   GET /api/v1/boards/users/:userId
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    // Toggle favorite status
    board.isFavorite = !board.isFavorite;
    await board.save();

    res.status(200).json({
      success: true,
      data: board,
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Update board (including adding/updating elements)
// @route   PUT /api/v1/boards/:id
// @access  Private

exports.updateBoard = async (req, res) => {
  try {
    console.log("🔍 PUT Request for Board ID:", req.params.boardId);
    console.log("🔍 Request Body:", req.body);

    // Validate Board ID Format
    if (!req.params.boardId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(" Invalid Board ID Format:", req.params.boardId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid board ID format" });
    }

    // Find Board
    const board = await Board.findById(req.params.boardId);
    console.log(" Board from Database:", board);

    if (!board) {
      console.error(" Board not found in Database:", req.params.boardId);
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });
    }

    // Ensure only the owner can update the board
    console.log(
      "  Checking board ownership: ",
      board.user.toString(),
      " VS ",
      req.user.id
    );
    if (board.user.toString() !== req.user.id.toString()) {
      console.error(" Unauthorized: User does not own this board");
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this board",
        });
    }

    // Update Board Content
    board.content = req.body.content || board.content;

    // Optional: If elements are also updated, update them
    if (req.body.elements) {
      board.elements = req.body.elements;
    }

    const updatedBoard = await board.save();
    console.log(" Board successfully updated:", updatedBoard);

    res.status(200).json({ success: true, data: updatedBoard });
  } catch (err) {
    console.error("  Update Board Error:", err);
    res.status(500).json({ success: false, message: "Error updating board" });
  }
};

// @desc    Delete board
// @route   DELETE /api/v1/boards/:id
// @access  Private
exports.deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.id);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

// @desc    Search boards by name
// @route   GET /api/v1/boards/search?name=query
// @access  Private
exports.searchBoards = asyncHandler(async (req, res) => {
  try {
    const boards = await Board.find({
      boardName: { $regex: req.query.name, $options: "i" },
    }).populate("user");

    res.status(200).json({
      success: true,
      data: boards,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Add an element to a board
// @route   POST /api/v1/boards/:boardId/elements
// @access  Private (Requires authentication)
exports.addElementToBoard = asyncHandler(async (req, res, next) => {
  const boardId = req.params.boardId; // Get boardId from URL parameters
  const { type, content, position, size } = req.body; // Element data from request body

  if (!boardId) {
    return next(
      new ErrorResponse(`Board ID is required`, 400) // Or use res.status(400).json(...)
    );
  }

  if (!type || !content) {
    // Basic validation for type and content
    return next(
      new ErrorResponse(`Element type and content are required`, 400)
    );
  }

  try {
    const board = await Board.findById(boardId);

    if (!board) {
      return next(
        new ErrorResponse(`Board not found with ID: ${boardId}`, 404)
      );
    }

    // Create a new element object
    const newElement = {
      type,
      content,
      position: position || { x: 0, y: 0 }, // Default position if not provided
      size: size || { width: 100, height: 100 }, // Default size if not provided
      // You can add more element properties here as needed
    };

    // Push the new element into the board's elements array
    board.elements.push(newElement);
    await board.save(); // Save the updated board

    res.status(201).json({
      success: true,
      data: board, // Or you can send back just the new element if you prefer
      message: "Element added to board successfully",
    });
  } catch (error) {
    console.error("Error adding element to board:", error);
    return next(new ErrorResponse("Server error adding element", 500)); // Handle server errors
  }
});

// @desc    Add or update an element on the board
// @route   PUT /api/v1/boards/:id/elements
// @access  Private
exports.updateElement = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const { element } = req.body;

    // Check if the element already exists
    const elementIndex = board.elements.findIndex(
      (el) => el._id === element._id
    );

    if (elementIndex !== -1) {
      // Update existing element
      board.elements[elementIndex] = element;
    } else {
      // Add new element
      board.elements.push(element);
    }

    await board.save();
    res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an element from the board
// @route   DELETE /api/v1/boards/:id/elements/:elementId
// @access  Private
exports.deleteElement = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Remove the element
    board.elements = board.elements.filter(
      (el) => el._id.toString() !== req.params.elementId
    );

    await board.save();
    res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new element on board
// @route   POST /api/v1/boards/:boardId/elements
// @access  Private
exports.createElement = asyncHandler(async (req, res, next) => {
  const boardId = req.params.boardId;
  const { type, content, position, style, size, src, shape, color } = req.body;

  if (!boardId) {
    return next(new ErrorResponse(`Board ID is required`, 400));
  }

  if (!type || !content) {
    return next(
      new ErrorResponse(`Element type and content are required`, 400)
    );
  }

  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return next(
        new ErrorResponse(`Board not found with ID: ${boardId}`, 404)
      );
    }

    const newElement = {
      type,
      content,
      position: position || { x: 0, y: 0 },
      style,
      size: size || { width: 100, height: 100 },
      src,
      shape,
      color,
    };

    board.elements.push(newElement);
    await board.save();

    res.status(201).json({
      success: true,
      data: newElement,
      message: "Element added to board successfully",
    });
  } catch (error) {
    console.error("Error adding element to board:", error);
    return next(new ErrorResponse("Server error adding element", 500));
  }
});

// @desc    Upload file (image, audio)
// @route   POST /api/v1/boards/:boardId/upload
// @access  Private
exports.uploadFile = asyncHandler(async (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  });
});

// @desc    Process PDF and add as element
// @route   POST /api/v1/boards/:boardId/pdf
// @access  Private
exports.processPdf = asyncHandler(async (req, res, next) => {
  upload.single("pdf")(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }

    const pdfPath = req.file.path;
    const converter = new pdf2pic({
      density: 100,
      format: "png",
      quality: 100,
    });

    try {
      const imageBuffer = await converter.convert(pdfPath, 1); // Convert first page
      const imageUrl = `/uploads/pdf-${Date.now()}.png`;
      fs.writeFileSync(
        path.join(__dirname, "../public", imageUrl),
        imageBuffer
      );

      const boardId = req.params.boardId;
      const board = await Board.findById(boardId);
      if (!board) {
        return next(
          new ErrorResponse(`Board not found with ID: ${boardId}`, 404)
        );
      }

      const newElement = {
        type: "image",
        src: imageUrl,
        position: { x: 0, y: 0 },
        size: { width: 500, height: 700 },
      };

      board.elements.push(newElement);
      await board.save();

      res.status(200).json({
        success: true,
        data: newElement,
        message: "PDF processed and added as element",
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      return next(new ErrorResponse("Server error processing PDF", 500));
    }
  });
});

// @desc    Export board as PDF
// @route   GET /api/v1/boards/:boardId/export
// @access  Private
exports.exportBoard = asyncHandler(async (req, res, next) => {
  const boardId = req.params.boardId;
  const board = await Board.findById(boardId);

  if (!board) {
    return next(new ErrorResponse(`Board not found with ID: ${boardId}`, 404));
  }

  const doc = new PDFDocument();
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfBuffer = Buffer.concat(buffers);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="board-${boardId}.pdf"`
    );
    res.send(pdfBuffer);
  });

  // Add board elements to PDF
  board.elements.forEach((element) => {
    if (element.type === "text") {
      doc.text(element.content, element.position.x, element.position.y);
    } else if (element.type === "image" && element.src) {
      const imagePath = path.join(__dirname, "../public", element.src);
      doc.image(imagePath, element.position.x, element.position.y, {
        width: element.size.width,
        height: element.size.height,
      });
    }
  });

  doc.end();
});
