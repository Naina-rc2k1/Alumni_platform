const express = require('express');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Current student entrypoint (for dashboards / role protection)
// @route   GET /api/student
// @access  Private (currentStudent only)
router.get('/', authMiddleware, authorizeRoles('currentStudent'), async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student data',
    });
  }
});

module.exports = router;

