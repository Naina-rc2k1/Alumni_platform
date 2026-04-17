const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { authMiddleware, adminMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all alumni
// @route   GET /api/alumni
// @access  Private
router.get('/', [
  authMiddleware,
  authorizeRoles('alumni'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('graduationYear').optional().isInt({ min: 1950, max: new Date().getFullYear() }).withMessage('Invalid graduation year'),
  query('fieldOfStudy').optional().trim(),
  query('location').optional().trim(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { role: 'alumni', isActive: true, isVerified: true };
    
    if (req.query.graduationYear) {
      filter.graduationYear = req.query.graduationYear;
    }
    
    if (req.query.fieldOfStudy) {
      filter.fieldOfStudy = { $regex: req.query.fieldOfStudy, $options: 'i' };
    }
    
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { fieldOfStudy: searchRegex },
        { currentPosition: searchRegex },
        { company: searchRegex }
      ];
    }

    const alumni = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: alumni.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: alumni
    });
  } catch (error) {
    console.error('Get alumni error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alumni'
    });
  }
});

// @desc    Search alumni
// @route   GET /api/alumni/search
// @access  Private
router.get('/search', [
  authMiddleware,
  authorizeRoles('alumni'),
  query('q').notEmpty().withMessage('Search query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const searchQuery = req.query.q;
    const searchRegex = { $regex: searchQuery, $options: 'i' };

    const alumni = await User.find({
      role: 'alumni',
      isActive: true,
      isVerified: true,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { fieldOfStudy: searchRegex },
        { currentPosition: searchRegex },
        { company: searchRegex },
        { location: searchRegex }
      ]
    })
    .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken')
    .limit(50);

    res.json({
      success: true,
      count: alumni.length,
      data: alumni
    });
  } catch (error) {
    console.error('Search alumni error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching alumni'
    });
  }
});

// @desc    Get single alumni
// @route   GET /api/alumni/:id
// @access  Private
router.get('/:id', [authMiddleware, authorizeRoles('alumni')], async (req, res) => {
  try {
    const alumni = await User.findOne({
      _id: req.params.id,
      role: 'alumni',
      isActive: true,
      isVerified: true,
    }).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    res.json({
      success: true,
      data: alumni
    });
  } catch (error) {
    console.error('Get single alumni error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alumni'
    });
  }
});

// @desc    Create new alumni (Admin only)
// @route   POST /api/alumni
// @access  Private (Admin)
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('graduationYear').optional().isInt({ min: 1950, max: new Date().getFullYear() }).withMessage('Invalid graduation year'),
  body('fieldOfStudy').optional().trim(),
  body('currentPosition').optional().trim(),
  body('company').optional().trim(),
  body('phone').optional().trim(),
  body('location').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, graduationYear, fieldOfStudy, currentPosition, company, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const alumni = await User.create({
      name,
      email,
      password,
      role: 'alumni',
      graduationYear,
      fieldOfStudy,
      currentPosition,
      company,
      phone,
      location
    });

    res.status(201).json({
      success: true,
      message: 'Alumni created successfully',
      data: alumni.getPublicProfile()
    });
  } catch (error) {
    console.error('Create alumni error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating alumni'
    });
  }
});

// @desc    Update alumni (Admin or Alumni themselves)
// @route   PUT /api/alumni/:id
// @access  Private
router.put('/:id', [
  authMiddleware,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('graduationYear').optional().isInt({ min: 1950, max: new Date().getFullYear() }).withMessage('Invalid graduation year'),
  body('fieldOfStudy').optional().trim(),
  body('currentPosition').optional().trim(),
  body('company').optional().trim(),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('linkedinProfile').optional().isURL().withMessage('Please provide a valid LinkedIn URL'),
  body('githubProfile').optional().isURL().withMessage('Please provide a valid GitHub URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user can update this alumni
    const alumni = await User.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    // Only admin or the alumni themselves can update
    if (req.user.role !== 'admin' && alumni._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this alumni'
      });
    }

    const allowedUpdates = [
      'name', 'graduationYear', 'fieldOfStudy', 'currentPosition', 
      'company', 'phone', 'location', 'bio', 'linkedinProfile', 'githubProfile'
    ];
    const updates = {};

    // Only allow updates for fields that are provided and allowed
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedAlumni = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    res.json({
      success: true,
      message: 'Alumni updated successfully',
      data: updatedAlumni
    });
  } catch (error) {
    console.error('Update alumni error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating alumni'
    });
  }
});

// @desc    Delete alumni (Admin only)
// @route   DELETE /api/alumni/:id
// @access  Private (Admin)
router.delete('/:id', [
  authMiddleware,
  adminMiddleware
], async (req, res) => {
  try {
    const alumni = await User.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    // Soft delete by deactivating
    alumni.isActive = false;
    await alumni.save();

    res.json({
      success: true,
      message: 'Alumni deactivated successfully'
    });
  } catch (error) {
    console.error('Delete alumni error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting alumni'
    });
  }
});

// @desc    Get alumni statistics
// @route   GET /api/alumni/stats/overview
// @access  Private (Admin)
router.get('/stats/overview', [
  authMiddleware,
  adminMiddleware
], async (req, res) => {
  try {
    const totalAlumni = await User.countDocuments({ role: 'alumni', isActive: true });
    const recentAlumni = await User.countDocuments({ 
      role: 'alumni', 
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Get graduation year distribution
    const graduationYears = await User.aggregate([
      { $match: { role: 'alumni', isActive: true, graduationYear: { $exists: true } } },
      { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Get field of study distribution
    const fieldsOfStudy = await User.aggregate([
      { $match: { role: 'alumni', isActive: true, fieldOfStudy: { $exists: true, $ne: '' } } },
      { $group: { _id: '$fieldOfStudy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalAlumni,
        recentAlumni,
        graduationYears,
        fieldsOfStudy
      }
    });
  } catch (error) {
    console.error('Get alumni stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alumni statistics'
    });
  }
});

module.exports = router;
