const express = require('express')
const router = express.Router()
const handler = require('../controllers/main.controller')
const auth = require('../Middleware/authMiddleware')
const { validate, entrySchema } = require('../Middleware/validation.middleware')
const crypto = require('crypto');

const path = require('path')
const fs = require('fs')
const multer = require('multer')

// Ensure base directories exist
const fileDir = path.join(__dirname, '../files')
const photoDir = path.join(__dirname, '../Entryphotos') // New directory for photos
fs.mkdirSync(fileDir, { recursive: true })
fs.mkdirSync(photoDir, { recursive: true })

// Storage engine using function to determine destination
const storage = multer.diskStorage({
  // ... destination ...
  filename: function (req, file, cb) {
    // Generate 16 random bytes
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        return cb(err);
      }
      // Get the file extension
      const extension = path.extname(file.originalname);
      // Create a random filename
      const randomName = buf.toString('hex') + extension;
      cb(null, randomName);
    });
  }
});

// File filter for images (optional but recommended)
const imageFileFilter = (req, file, cb) => {
    if (file.fieldname === "photo") {
        // 1. Check MIME Type
        const isMimeValid = file.mimetype.startsWith('image/');
        
        // 2. Check File Extension
        const allowedExtensions = /\.(jpg|jpeg|png|gif)$/i; // Use regex for case-insensitive check
        const isExtValid = allowedExtensions.test(file.originalname);

        if (isMimeValid && isExtValid) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF images are allowed.'), false);
        }
    } else {
        cb(null, true); // Accept other files (like the bill)
    }
};


// Error handling for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    console.error("Multer error:", err);
    return res.status(400).json({ 
      message: 'File upload error', 
      error: err.message 
    });
  }
  next();
};

// Configure multer to handle multiple fields
const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter, // Apply the filter
    limits: { fileSize: 1024 * 1024 * 5 } // Optional: Limit file size (e.g., 5MB)
})

// Update route to use upload.fields()
router.post('/', 
  auth.authMiddleware, 
   validate(entrySchema),
  function(req, res, next) {
    console.log("Upload request received");
    console.log("Request headers:", req.headers);
    next();
  },
  upload.fields([
    { name: 'file', maxCount: 1 }, 
    { name: 'photo', maxCount: 1 }
  ]),
  multerErrorHandler,
  function(req, res, next) {
    console.log("Files uploaded successfully");
    console.log("Request files:", req.files);
    next();
  },
  handler.uploaddata
)

module.exports = router