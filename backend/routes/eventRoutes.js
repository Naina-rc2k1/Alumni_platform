const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Event = require('../models/Event');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all events
// @route   GET /api/events
// @access  Private
router.get('/', [
  authMiddleware,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']).withMessage('Invalid status'),
  query('eventType').optional().isIn(['networking', 'reunion', 'workshop', 'seminar', 'social', 'other']).withMessage('Invalid event type'),
  query('category').optional().isIn(['alumni', 'student', 'mixed', 'public']).withMessage('Invalid category')
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
    
    if (req.query.eventType) {
      filter.eventType = req.query.eventType;
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .populate('registeredUsers', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching events'
    });
  }
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredUsers', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get single event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching event'
    });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
router.post('/', [
  authMiddleware,
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('organizer').trim().notEmpty().withMessage('Organizer is required'),
  body('organizerEmail').isEmail().normalizeEmail().withMessage('Please provide a valid organizer email'),
  body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be a positive integer'),
  body('eventType').optional().isIn(['networking', 'reunion', 'workshop', 'seminar', 'social', 'other']).withMessage('Invalid event type'),
  body('category').optional().isIn(['alumni', 'student', 'mixed', 'public']).withMessage('Invalid category'),
  body('isOnline').optional().isBoolean().withMessage('isOnline must be a boolean'),
  body('meetingLink').optional().isURL().withMessage('Please provide a valid meeting link')
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

    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      registeredUsers: []
    };

    const event = await Event.create(eventData);

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating event'
    });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin or Event Creator)
router.put('/:id', [
  authMiddleware,
  body('title').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
  body('location').optional().trim(),
  body('organizer').optional().trim(),
  body('organizerEmail').optional().isEmail().normalizeEmail().withMessage('Please provide a valid organizer email'),
  body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be a positive integer'),
  body('eventType').optional().isIn(['networking', 'reunion', 'workshop', 'seminar', 'social', 'other']).withMessage('Invalid event type'),
  body('category').optional().isIn(['alumni', 'student', 'mixed', 'public']).withMessage('Invalid category'),
  body('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']).withMessage('Invalid status'),
  body('isOnline').optional().isBoolean().withMessage('isOnline must be a boolean'),
  body('meetingLink').optional().isURL().withMessage('Please provide a valid meeting link')
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

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only admin or event creator can update
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'date', 'location', 'organizer', 'organizerEmail',
      'maxAttendees', 'eventType', 'category', 'status', 'isOnline', 'meetingLink',
      'requirements', 'tags'
    ];
    const updates = {};

    // Only allow updates for fields that are provided and allowed
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('registeredUsers', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating event'
    });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin or Event Creator)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only admin or event creator can delete
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for registration'
      });
    }

    if (event.date < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event has already passed'
      });
    }

    if (event.registeredUsers.length >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    if (event.isUserRegistered(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    event.registerUser(req.user._id);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for the event'
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error registering for event'
    });
  }
});

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
router.delete('/:id/register', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isUserRegistered(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

    event.unregisterUser(req.user._id);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error unregistering from event'
    });
  }
});

module.exports = router;
