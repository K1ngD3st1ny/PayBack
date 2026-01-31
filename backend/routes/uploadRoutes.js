const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig');
const router = express.Router();

const upload = multer({ storage });

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Public (or Private depending on needs, currently open for simplicity in profile edit)
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({ url: req.file.path });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server upload error' });
    }
});

module.exports = router;
