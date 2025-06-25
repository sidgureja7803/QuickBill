const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// These routes are for admin functionalities that can be added later
// For now, we'll just return a message

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin functionality not implemented yet'
  });
});

module.exports = router; 