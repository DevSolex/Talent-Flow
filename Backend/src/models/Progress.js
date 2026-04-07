const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'submitted', 'graded'],
    default: 'not_started'
  },
  score: {
    type: Number,
    min: 0,
    default: null
  },
  maxScore: {
    type: Number,
    required: true
  },
  submissionDate: {
    type: Date,
    default: null
  },
  gradedDate: {
    type: Date,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  startedAt: {
    type: Date,
    default: null
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
});

// Compound index to ensure one progress record per student per assignment
progressSchema.index({ student: 1, assignment: 1 }, { unique: true });

// Update lastAccessedAt on save
progressSchema.pre('save', function(next) {
  this.lastAccessedAt = Date.now();
  next();
});

module.exports = mongoose.model('Progress', progressSchema);
