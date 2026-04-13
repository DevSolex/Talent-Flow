const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Assignment = require('../models/Assignment');

// @route   GET /api/progress/student/:studentId
// @desc    Get all progress for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const progress = await Progress.find({ student: req.params.studentId })
      .populate('assignment', 'title description course dueDate maxScore')
      .populate('assignment.course', 'title');

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress/assignment/:assignmentId
// @desc    Get all progress for a specific assignment
router.get('/assignment/:assignmentId', async (req, res) => {
  try {
    const progress = await Progress.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email')
      .populate('assignment', 'title description maxScore');

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress/student/:studentId/assignment/:assignmentId
// @desc    Get specific progress record for a student on an assignment
router.get('/student/:studentId/assignment/:assignmentId', async (req, res) => {
  try {
    const progress = await Progress.findOne({
      student: req.params.studentId,
      assignment: req.params.assignmentId,
    })
      .populate('assignment', 'title description course dueDate maxScore')
      .populate('assignment.course', 'title');

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/progress
// @desc    Create or update progress record
router.post('/', async (req, res) => {
  try {
    // Verify assignment exists
    const assignment = await Assignment.findById(req.body.assignment);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const progressData = {
      student: req.body.student,
      assignment: req.body.assignment,
      status: req.body.status || 'not_started',
      maxScore: req.body.maxScore || assignment.maxScore,
      score: req.body.score || null,
      feedback: req.body.feedback || '',
      completionPercentage: req.body.completionPercentage || 0,
      timeSpent: req.body.timeSpent || 0,
    };

    // Set dates based on status
    if (req.body.status === 'in_progress' && !req.body.startedAt) {
      progressData.startedAt = Date.now();
    }
    if (req.body.status === 'submitted') {
      progressData.submissionDate = Date.now();
    }
    if (req.body.status === 'graded' && req.body.score !== null) {
      progressData.gradedDate = Date.now();
    }

    // Create or update progress record
    const progress = await Progress.findOneAndUpdate(
      { student: req.body.student, assignment: req.body.assignment },
      progressData,
      { new: true, upsert: true, runValidators: true },
    )
      .populate('assignment', 'title description course maxScore')
      .populate('assignment.course', 'title');

    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/progress/:id
// @desc    Update progress record
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle status changes and set appropriate dates
    if (req.body.status === 'in_progress' && !req.body.startedAt) {
      updateData.startedAt = Date.now();
    }
    if (req.body.status === 'submitted') {
      updateData.submissionDate = Date.now();
    }
    if (req.body.status === 'graded' && req.body.score !== null) {
      updateData.gradedDate = Date.now();
    }

    const progress = await Progress.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('assignment', 'title description course maxScore')
      .populate('assignment.course', 'title');

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    res.json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/progress/:id
// @desc    Delete progress record
router.delete('/:id', async (req, res) => {
  try {
    const progress = await Progress.findByIdAndDelete(req.params.id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    res.json({ message: 'Progress record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
