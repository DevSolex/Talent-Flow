const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { verifyToken, verifyRole } = require('../middleware/auth.middleware');

router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course', 'title');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, verifyRole(['Mentor', 'Admin']), async (req, res) => {
  try {
    const assignment = new Assignment({ ...req.body });
    const saved = await assignment.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', verifyToken, verifyRole(['Mentor', 'Admin']), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET submissions for an assignment (mentor/admin)
router.get('/:id/submissions', verifyToken, verifyRole(['Mentor', 'Admin']), async (req, res) => {
  try {
    const submissions = await Progress.find({ assignment: req.params.id, status: { $in: ['submitted', 'graded'] } })
      .populate('student', 'name email');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/submit', verifyToken, verifyRole(['Intern']), async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer is required before submitting' });
    }

    // Block resubmission
    const existing = await Progress.findOne({ student: req.user._id, assignment: req.params.id });
    if (existing && ['submitted', 'graded'].includes(existing.status)) {
      return res.status(400).json({ message: 'You have already submitted this assignment.' });
    }

    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const progress = await Progress.findOneAndUpdate(
      { student: req.user._id, assignment: req.params.id },
      { student: req.user._id, assignment: req.params.id, answer: answer.trim(),
        status: 'submitted', submissionDate: Date.now(), maxScore: assignment.maxScore, completionPercentage: 100 },
      { new: true, upsert: true, runValidators: true }
    );

    // Notify the course mentor
    if (assignment.course?.mentor) {
      await Notification.create({
        recipient: assignment.course.mentor,
        type: 'assignment_submitted',
        message: `${req.user.name} submitted an answer for "${assignment.title}" in ${assignment.course.title}.`,
        meta: { assignmentId: assignment._id, assignmentTitle: assignment.title, studentId: req.user._id, studentName: req.user.name, progressId: progress._id },
      });
    }

    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/grade', verifyToken, verifyRole(['Mentor', 'Admin']), async (req, res) => {
  try {
    const { studentId, score, feedback } = req.body;
    const progress = await Progress.findOneAndUpdate(
      { student: studentId, assignment: req.params.id },
      { status: 'graded', score, feedback, gradedDate: Date.now() },
      { new: true, runValidators: true }
    );
    if (!progress) return res.status(404).json({ message: 'Submission not found' });

    const assignment = await Assignment.findById(req.params.id);

    // Notify the intern
    await Notification.create({
      recipient: studentId,
      type: 'assignment_graded',
      message: `Your submission for "${assignment?.title}" has been graded. Score: ${score}/${assignment?.maxScore}.${feedback ? ' Feedback: ' + feedback : ''}`,
      meta: { assignmentId: req.params.id, score, maxScore: assignment?.maxScore, feedback },
    });

    res.json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
