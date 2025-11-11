const express = require('express')
const router = express.Router()
const gsnHandler = require('../controllers/gsnmain.controller')
const auth = require('../Middleware/authMiddleware')
const { validate, entrySchema } = require('../Middleware/validation.middleware')
const crypto = require('crypto');
const path = require('path')
const fs = require('fs')
const multer = require('multer')

// Ensure base directories exist
const billDir = path.join(__dirname, '../gsnfiles')
const photoDir = path.join(__dirname, '../gsnPhotos') // New directory for photos
fs.mkdirSync(billDir, { recursive: true })
fs.mkdirSync(photoDir, { recursive: true })

// Storage engine using function to determine destination
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


// Configure multer to handle multiple fields
const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter, // Apply the filter
    limits: { fileSize: 1024 * 1024 * 5 } // Optional: Limit file size (e.g., 5MB)
})

// Update route to use upload.fields()
router.post('/', auth.authMiddleware,validate(entrySchema), upload.fields([
    { name: 'file', maxCount: 1 }, 
    { name: 'photo', maxCount: 1 }
]), gsnHandler.uploaddata)
router.delete('/delete-by-party/:partyName', auth.authMiddleware, gsnHandler.deleteByParty);
router.put('/update-by-party/:partyName', auth.authMiddleware, gsnHandler.updateByParty);

module.exports = router