const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const cloudinaryService = require('../../services/cloudinary.service');
const { protect } = require('../../middleware/auth');

// @route   POST /api/uploads/image
// @desc    Upload an image to Cloudinary
// @access  Private/Admin
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const folder = req.body.folder || 'portfolio/general';
    
    const result = await cloudinaryService.uploadImage(req.file.buffer, folder);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// @route   DELETE /api/uploads/image
// @desc    Delete an image from Cloudinary
// @access  Private/Admin
router.delete('/image', protect, async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ message: 'No publicId provided' });
    }

    await cloudinaryService.deleteImage(publicId);
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error during delete' });
  }
});

module.exports = router;
