const multer = require("multer");
const path = require("path");

const maxSize = 2 * 1024 * 1024; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); 
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `IMG-${Date.now()}${ext}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("File format not supported."), false);
  }
  cb(null, true);
};


const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxSize },
});

module.exports = upload; 
