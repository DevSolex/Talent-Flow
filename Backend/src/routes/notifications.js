const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const { verifyToken, verifyRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mentor approval
router.post('/approve/:userId', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Notification.create({ recipient: user._id, type: 'mentor_approved', message: 'Your Mentor account has been approved! You can now log in.' });
    await Notification.updateMany({ type: 'mentor_request', 'meta.applicantId': user._id }, { read: true });
    res.json({ message: `${user.name} approved as Mentor` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reject/:userId', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Notification.create({ recipient: user._id, type: 'mentor_rejected', message: 'Your Mentor account request was not approved. Please contact support.' });
    await Notification.updateMany({ type: 'mentor_request', 'meta.applicantId': user._id }, { read: true });
    await User.findByIdAndDelete(user._id);
    res.json({ message: `${user.name} rejected and removed` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Course approval
router.post('/approve-course/:courseId', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.courseId, { status: 'published' }, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Notification.create({ recipient: course.mentor, type: 'course_approved', message: `Your course "${course.title}" has been approved and is now live!` });
    await Notification.updateMany({ type: 'course_request', 'meta.courseId': course._id }, { read: true });
    res.json({ message: `Course "${course.title}" approved` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reject-course/:courseId', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Notification.create({ recipient: course.mentor, type: 'course_rejected', message: `Your course "${course.title}" was not approved. Please review and resubmit.` });
    await Notification.updateMany({ type: 'course_request', 'meta.courseId': course._id }, { read: true });
    await Course.findByIdAndDelete(course._id);
    res.json({ message: `Course "${course.title}" rejected` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
