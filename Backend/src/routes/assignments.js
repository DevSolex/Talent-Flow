const express = require('express');
const router = express.Router();

// @route   GET /api/assignments
// @desc    Get all assignments
router.get('/', (req, res) => {
  res.json({ message: 'GET all assignments - endpoint working!' });
});

// @route   GET /api/assignments/:courseId
// @desc    Get assignments by course ID
router.get('/course/:courseId', (req, res) => {
  res.json({
    message: 'GET assignments by course - endpoint working!',
    courseId: req.params.courseId,
  });
});

// @route   POST /api/assignments
// @desc    Create new assignment
router.post('/', (req, res) => {
  res.json({ message: 'POST create assignment - endpoint working!' });
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
router.put('/:id', (req, res) => {
  res.json({
    message: 'PUT update assignment - endpoint working!',
    assignmentId: req.params.id,
  });
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
router.delete('/:id', (req, res) => {
  res.json({
    message: 'DELETE assignment - endpoint working!',
    assignmentId: req.params.id,
  });
});

module.exports = router;
