const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Mentorship = require('../models/Mentorship');
const { authMiddleware, adminMiddleware, alumniMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all mentorship opportunities
// @route   GET /api/mentorship
// @access  Private
router.get('/', [
  authMiddleware,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['open', 'closed', 'completed']).withMessage('Invalid status'),
  query('category').optional().isIn(['career', 'academic', 'technical', 'entrepreneurship', 'personal', 'other']).withMessage('Invalid category'),
  query('field').optional().trim()
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
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.field) {
      filter.field = { $regex: req.query.field, $options: 'i' };
    }

    const mentorships = await Mentorship.find(filter)
      .populate('mentor', 'name email currentPosition company fieldOfStudy')
      .populate('currentMentees', 'name email')
      .populate('applications.student', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Mentorship.countDocuments(filter);

    res.json({
      success: true,
      count: mentorships.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: mentorships
    });
  } catch (error) {
    console.error('Get mentorships error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mentorship opportunities'
    });
  }
});

// @desc    Get single mentorship opportunity
// @route   GET /api/mentorship/:id
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id)
      .populate('mentor', 'name email currentPosition company fieldOfStudy bio linkedinProfile')
      .populate('currentMentees', 'name email department')
      .populate('applications.student', 'name email department');

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship opportunity not found'
      });
    }

    res.json({
      success: true,
      data: mentorship
    });
  } catch (error) {
    console.error('Get single mentorship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mentorship opportunity'
    });
  }
});

// @desc    Create new mentorship opportunity
// @route   POST /api/mentorship
// @access  Private (Alumni or Admin)
router.post('/', [
  authMiddleware,
  alumniMiddleware,
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['career', 'academic', 'technical', 'entrepreneurship', 'personal', 'other']).withMessage('Invalid category'),
  body('field').trim().notEmpty().withMessage('Field is required'),
  body('duration').isInt({ min: 1, max: 24 }).withMessage('Duration must be between 1 and 24 months'),
  body('maxMentees').optional().isInt({ min: 1, max: 10 }).withMessage('Max mentees must be between 1 and 10'),
  body('requirements').optional().trim().isLength({ max: 500 }).withMessage('Requirements cannot exceed 500 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('location').optional().trim(),
  body('isOnline').optional().isBoolean().withMessage('isOnline must be a boolean'),
  body('meetingFrequency').optional().isIn(['weekly', 'bi-weekly', 'monthly', 'as-needed']).withMessage('Invalid meeting frequency')
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

    const mentorshipData = {
      ...req.body,
      mentor: req.user._id,
      currentMentees: [],
      applications: []
    };

    const mentorship = await Mentorship.create(mentorshipData);

    const populatedMentorship = await Mentorship.findById(mentorship._id)
      .populate('mentor', 'name email currentPosition company fieldOfStudy');

    res.status(201).json({
      success: true,
      message: 'Mentorship opportunity created successfully',
      data: populatedMentorship
    });
  } catch (error) {
    console.error('Create mentorship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating mentorship opportunity'
    });
  }
});

// @desc    Update mentorship opportunity
// @route   PUT /api/mentorship/:id
// @access  Private (Mentor or Admin)
router.put('/:id', [
  authMiddleware,
  body('title').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['career', 'academic', 'technical', 'entrepreneurship', 'personal', 'other']).withMessage('Invalid category'),
  body('field').optional().trim(),
  body('duration').optional().isInt({ min: 1, max: 24 }).withMessage('Duration must be between 1 and 24 months'),
  body('maxMentees').optional().isInt({ min: 1, max: 10 }).withMessage('Max mentees must be between 1 and 10'),
  body('status').optional().isIn(['open', 'closed', 'completed']).withMessage('Invalid status'),
  body('requirements').optional().trim().isLength({ max: 500 }).withMessage('Requirements cannot exceed 500 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('location').optional().trim(),
  body('isOnline').optional().isBoolean().withMessage('isOnline must be a boolean'),
  body('meetingFrequency').optional().isIn(['weekly', 'bi-weekly', 'monthly', 'as-needed']).withMessage('Invalid meeting frequency')
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

    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship opportunity not found'
      });
    }

    // Only admin or mentor can update
    if (req.user.role !== 'admin' && mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this mentorship opportunity'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'field', 'duration', 'maxMentees',
      'status', 'requirements', 'skills', 'location', 'isOnline', 'meetingFrequency',
      'startDate', 'endDate'
    ];
    const updates = {};

    // Only allow updates for fields that are provided and allowed
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedMentorship = await Mentorship.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('mentor', 'name email currentPosition company fieldOfStudy')
     .populate('currentMentees', 'name email')
     .populate('applications.student', 'name email department');

    res.json({
      success: true,
      message: 'Mentorship opportunity updated successfully',
      data: updatedMentorship
    });
  } catch (error) {
    console.error('Update mentorship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating mentorship opportunity'
    });
  }
});

// @desc    Delete mentorship opportunity
// @route   DELETE /api/mentorship/:id
// @access  Private (Mentor or Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship opportunity not found'
      });
    }

    // Only admin or mentor can delete
    if (req.user.role !== 'admin' && mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this mentorship opportunity'
      });
    }

    await Mentorship.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Mentorship opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Delete mentorship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting mentorship opportunity'
    });
  }
});

// @desc    Apply for mentorship
// @route   POST /api/mentorship/:id/apply
// @access  Private (Students only)
router.post('/:id/apply', [
  authMiddleware,
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
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

    const userRole = req.user.role === 'student' ? 'currentStudent' : req.user.role;
    if (userRole !== 'currentStudent') {
      return res.status(403).json({
        success: false,
        message: 'Only current students can apply for mentorship'
      });
    }

    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship opportunity not found'
      });
    }

    if (mentorship.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Mentorship opportunity is not open for applications'
      });
    }

    if (mentorship.hasStudentApplied(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this mentorship opportunity'
      });
    }

    mentorship.addApplication(req.user._id, req.body.message || '');
    await mentorship.save();

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply for mentorship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting application'
    });
  }
});

// @desc    Get applications for mentorship
// @route   GET /api/mentorship/:id/applications
// @access  Private (Mentor or Admin)
router.get('/:id/applications', authMiddleware, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id)
      .populate('applications.student', 'name email department bio');

    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship opportunity not found'
      });
    }

    // Only admin or mentor can view applications
    if (req.user.role !== 'admin' && mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications'
      });
    }

    res.json({
      success: true,
      data: mentorship.applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
});

// @desc    Approve application
// @route   PUT /api/mentorship/:id/applications/:applicationId/approve
// @access  Private (Mentor or Admin)
router.put('/:id/applications/:applicationId/approve', authMiddleware, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship opportunity not found'
      });
    }

    // Only admin or mentor can approve applications
    if (req.user.role !== 'admin' && mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve applications'
      });
    }

    const success = mentorship.approveApplication(req.params.applicationId);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Application not found or already processed'
      });
    }

    await mentorship.save();

    res.json({
      success: true,
      message: 'Application approved successfully'
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving application'
    });
  }
});

// @desc    Reject application
// @route   PUT /api/mentorship/:id/applications/:applicationId/reject
// @access  Private (Mentor or Admin)
router.put('/:id/applications/:applicationId/reject', authMiddleware, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship opportunity not found'
      });
    }

    // Only admin or mentor can reject applications
    if (req.user.role !== 'admin' && mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject applications'
      });
    }

    const success = mentorship.rejectApplication(req.params.applicationId);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Application not found or already processed'
      });
    }

    await mentorship.save();

    res.json({
      success: true,
      message: 'Application rejected successfully'
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting application'
    });
  }
});

module.exports = router;
