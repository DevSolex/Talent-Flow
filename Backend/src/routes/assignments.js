const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Progress = require('../models/Progress');
const { verifyToken, verifyRole } = require('../middleware/auth.middleware');

// GET /api/assignments/course/:courseId — list assignments for a course
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/assignments/:id — get single assignment
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course', 'title');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/assignments — create assignment (mentor/admin)
router.post('/', verifyToken, verifyRole(['Mentor', 'Admin']), async (req, res) => {
  try {
    const assignment = new Assignment({ ...req.body });
    const saved = await assignment.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/assignments/:id — update assignment (mentor/admin)
router.put('/:id', verifyToken, verifyRole(['Mentor', 'Admin']), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/assignments/:id — delete assignment (admin)
router.delete('/:id', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/assignments/:id/submit — intern submits an assignment
router.post('/:id/submit', verifyToken, verifyRole(['Intern']), async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer is required before submitting' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const progress = await Progress.findOneAndUpdate(
      { student: req.user._id, assignment: req.params.id },
      {
        student: req.user._id,
        assignment: req.params.id,
        answer: answer.trim(),
        status: 'submitted',
        submissionDate: Date.now(),
        maxScore: assignment.maxScore,
        completionPercentage: 100,
      },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/assignments/:id/grade — mentor/admin grades a submission
router.post('/:id/grade', verifyToken, verifyRole(['Mentor', 'Admin']), async (req, res) => {
  try {
    const { studentId, score, feedback } = req.body;
    const progress = await Progress.findOneAndUpdate(
      { student: studentId, assignment: req.params.id },
      { status: 'graded', score, feedback, gradedDate: Date.now() },
      { new: true, runValidators: true }
    );
    if (!progress) return res.status(404).json({ message: 'Submission not found' });
    res.json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
