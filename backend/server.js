const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const multiparty = require('connect-multiparty')
const cloudinary = require('cloudinary');

// Load environment variables
dotenv.config({ path: "./config/config.env" });

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

cloudinary.config({
  cloud_name: process.env.ClOUD_NAME,
  api_key : process.env.API_KEY,
  api_secret: process.env.API_SECRET
})


// Enhanced CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Security middleware
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(multiparty())
// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const userRoutes = require("./routes/user");
const boardRoutes = require("./routes/board");
const noteRoutes = require("./routes/note");

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Mount routes (critical fix here)
app.use("/api/v1/users", userRoutes); // Subscription endpoint lives here
app.use("/api/v1/boards", boardRoutes);
app.use("/api/v1/notes", noteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `
  ██████╗  ██████╗ ████████╗███████╗
  ██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝
  ██████╔╝██║   ██║   ██║   █████╗  
  ██╔══██╗██║   ██║   ██║   ██╔══╝  
  ██║  ██║╚██████╔╝   ██║   ███████╗
  ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝  
  Mode: ${process.env.NODE_ENV.yellow}
  Port: ${PORT.cyan}`.bold
  );
});

// Handle unhandled rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
