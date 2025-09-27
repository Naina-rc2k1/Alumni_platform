const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin)
router.get('/', [
  authMiddleware,
  adminMiddleware,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('department').optional().trim(),
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
    const filter = { role: 'student', isActive: true };
    
    if (req.query.department) {
      filter.department = { $regex: req.query.department, $options: 'i' };
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex },
        { department: searchRegex }
      ];
    }

    const students = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching students'
    });
  }
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private (Admin or Student themselves)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
      isActive: true
    }).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Only admin or the student themselves can view
    if (req.user.role !== 'admin' && student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this student'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get single student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student'
    });
  }
});

// @desc    Create new student (Admin only)
// @route   POST /api/students
// @access  Private (Admin)
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
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

    const { name, email, password, studentId, department, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if student ID already exists
    const existingStudentId = await User.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      studentId,
      department,
      phone,
      location
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student.getPublicProfile()
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating student'
    });
  }
});

// @desc    Update student (Admin or Student themselves)
// @route   PUT /api/students/:id
// @access  Private
router.put('/:id', [
  authMiddleware,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('studentId').optional().trim(),
  body('department').optional().trim(),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
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

    // Check if user can update this student
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Only admin or the student themselves can update
    if (req.user.role !== 'admin' && student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this student'
      });
    }

    const allowedUpdates = ['name', 'studentId', 'department', 'phone', 'location', 'bio'];
    const updates = {};

    // Only allow updates for fields that are provided and allowed
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Check for duplicate student ID if updating
    if (updates.studentId && updates.studentId !== student.studentId) {
      const existingStudentId = await User.findOne({ 
        studentId: updates.studentId,
        _id: { $ne: req.params.id }
      });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already exists'
        });
      }
    }

    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating student'
    });
  }
});

// @desc    Delete student (Admin only)
// @route   DELETE /api/students/:id
// @access  Private (Admin)
router.delete('/:id', [
  authMiddleware,
  adminMiddleware
], async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Soft delete by deactivating
    student.isActive = false;
    await student.save();

    res.json({
      success: true,
      message: 'Student deactivated successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting student'
    });
  }
});

// @desc    Get student statistics
// @route   GET /api/students/stats/overview
// @access  Private (Admin)
router.get('/stats/overview', [
  authMiddleware,
  adminMiddleware
], async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const recentStudents = await User.countDocuments({ 
      role: 'student', 
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Get department distribution
    const departments = await User.aggregate([
      { $match: { role: 'student', isActive: true, department: { $exists: true, $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        recentStudents,
        departments
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student statistics'
    });
  }
});

module.exports = router;
