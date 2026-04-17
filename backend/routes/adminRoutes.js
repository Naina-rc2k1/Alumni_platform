const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const normalizeRole = (role) => {
  if (role === 'student') return 'currentStudent';
  return role;
};

// Apply auth + admin guard to all admin routes.
router.use(authMiddleware, authorizeRoles('admin'));

// @desc    Admin root endpoint (role-protection check)
// @route   GET /api/admin
// @access  Private (Admin)
router.get('/', async (req, res) => {
  res.json({ success: true, message: 'Admin access confirmed' });
});

// @desc    Get all users (optionally filter by role)
// @route   GET /api/admin/users?search=...&role=admin|alumni|student
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { search, role } = req.query;

    const filter = {};

    if (role) {
      const normalized = normalizeRole(role);
      // Accept both legacy "student" and canonical "currentStudent" in the DB.
      const roleCandidates = normalized === 'currentStudent' ? ['currentStudent', 'student'] : [normalized];
      filter.role = { $in: roleCandidates };
    }

    if (search) {
      const regex = { $regex: search, $options: 'i' }; // case-insensitive
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(filter).select('name email role createdAt');

    const data = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: normalizeRole(u.role) === 'currentStudent' ? 'student' : u.role,
      createdAt: u.createdAt,
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user._id.toString() === id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const deleted = await User.findByIdAndDelete(id).select('name email role createdAt');
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting user',
    });
  }
});

// @desc    Verify an alumni account as valid
// @route   PATCH /api/admin/alumni/:id/verify
// @access  Private (Admin)
router.patch(
  '/alumni/:id/verify',
  [
    body('verified').optional().isBoolean().withMessage('verified must be a boolean'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { verified } = req.body;
      const verifiedValue = verified === undefined ? true : verified;

      const alumni = await User.findById(req.params.id);
      if (!alumni) {
        return res.status(404).json({ success: false, message: 'Alumni not found' });
      }

      if (normalizeRole(alumni.role) !== 'alumni') {
        return res.status(400).json({ success: false, message: 'User is not an alumni' });
      }

      alumni.isVerified = verifiedValue;
      // Once admin verifies, treat it as an active account as well.
      if (verifiedValue) alumni.isActive = true;

      await alumni.save();

      res.json({
        success: true,
        message: verifiedValue ? 'Alumni verified successfully' : 'Alumni verification removed',
        user: alumni.getPublicProfile(),
      });
    } catch (error) {
      console.error('Admin verify alumni error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error verifying alumni',
      });
    }
  }
);

module.exports = router;

