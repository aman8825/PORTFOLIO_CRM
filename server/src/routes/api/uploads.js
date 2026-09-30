const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const cloudinaryService = require('../../services/cloudinary.service');
const { protect } = require('../../middleware/auth');
const Media = require('../../models/Media');

// @route   GET /api/uploads
// @desc    Get all uploaded media
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

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
    
    // Save to database
    const media = await Media.create({
      filename: req.file.originalname,
      url: result.url,
      publicId: result.publicId,
      format: result.format || 'unknown',
      size: req.file.size,
      folder: folder,
      uploadedBy: req.admin._id
    });
    
    res.status(200).json({ ...result, mediaId: media._id });
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
    
    // Delete from database
    await Media.findOneAndDelete({ publicId });
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error during delete' });
  }
});

module.exports = router;
