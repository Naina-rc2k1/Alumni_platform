const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  organizer: {
    type: String,
    required: [true, 'Event organizer is required'],
    trim: true
  },
  organizerEmail: {
    type: String,
    required: [true, 'Organizer email is required'],
    lowercase: true
  },
  maxAttendees: {
    type: Number,
    default: 100,
    min: [1, 'Max attendees must be at least 1']
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  eventType: {
    type: String,
    enum: ['networking', 'reunion', 'workshop', 'seminar', 'social', 'other'],
    default: 'networking'
  },
  category: {
    type: String,
    enum: ['alumni', 'student', 'mixed', 'public'],
    default: 'mixed'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: {
    type: String,
    maxlength: [500, 'Requirements cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date();
});

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function() {
  return this.date < new Date();
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.registeredUsers.length;
});

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.registeredUsers.includes(userId);
};

// Method to register user
eventSchema.methods.registerUser = function(userId) {
  if (!this.registeredUsers.includes(userId)) {
    this.registeredUsers.push(userId);
    return true;
  }
  return false;
};

// Method to unregister user
eventSchema.methods.unregisterUser = function(userId) {
  const index = this.registeredUsers.indexOf(userId);
  if (index > -1) {
    this.registeredUsers.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = mongoose.model('Event', eventSchema);
