const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Mentorship title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Mentorship description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mentor is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['career', 'academic', 'technical', 'entrepreneurship', 'personal', 'other']
  },
  field: {
    type: String,
    required: [true, 'Field is required'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 month'],
    max: [24, 'Duration cannot exceed 24 months']
  },
  maxMentees: {
    type: Number,
    default: 1,
    min: [1, 'Max mentees must be at least 1'],
    max: [10, 'Max mentees cannot exceed 10']
  },
  currentMentees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  applications: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      maxlength: [500, 'Application message cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    }
  }],
  requirements: {
    type: String,
    maxlength: [500, 'Requirements cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  meetingFrequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly', 'as-needed'],
    default: 'weekly'
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'completed'],
    default: 'open'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
mentorshipSchema.index({ mentor: 1 });
mentorshipSchema.index({ category: 1 });
mentorshipSchema.index({ field: 1 });
mentorshipSchema.index({ status: 1 });
mentorshipSchema.index({ 'applications.student': 1 });

// Virtual for checking if mentorship is available
mentorshipSchema.virtual('isAvailable').get(function() {
  return this.status === 'open' && this.currentMentees.length < this.maxMentees;
});

// Virtual for application count
mentorshipSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Method to check if student has applied
mentorshipSchema.methods.hasStudentApplied = function(studentId) {
  return this.applications.some(app => app.student.toString() === studentId.toString());
};

// Method to add application
mentorshipSchema.methods.addApplication = function(studentId, message = '') {
  if (!this.hasStudentApplied(studentId)) {
    this.applications.push({
      student: studentId,
      message: message,
      status: 'pending'
    });
    return true;
  }
  return false;
};

// Method to approve application
mentorshipSchema.methods.approveApplication = function(applicationId) {
  const application = this.applications.id(applicationId);
  if (application && application.status === 'pending') {
    application.status = 'approved';
    application.reviewedAt = new Date();
    
    // Add to current mentees if not at capacity
    if (this.currentMentees.length < this.maxMentees) {
      this.currentMentees.push(application.student);
    }
    
    return true;
  }
  return false;
};

// Method to reject application
mentorshipSchema.methods.rejectApplication = function(applicationId) {
  const application = this.applications.id(applicationId);
  if (application && application.status === 'pending') {
    application.status = 'rejected';
    application.reviewedAt = new Date();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Mentorship', mentorshipSchema);
