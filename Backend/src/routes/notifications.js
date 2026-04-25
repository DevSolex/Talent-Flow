const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { verifyToken, verifyRole } = require('../middleware/auth.middleware');

// GET /api/notifications — get notifications for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/:id/read — mark as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/notifications/approve/:userId — admin approves mentor
router.post('/approve/:userId', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Notification.create({
      recipient: user._id,
      type: 'mentor_approved',
      message: 'Your Mentor account has been approved! You can now log in.',
    });

    // Mark the original request notification as read for all admins
    await Notification.updateMany(
      { type: 'mentor_request', 'meta.applicantId': user._id },
      { read: true }
    );

    res.json({ message: `${user.name} approved as Mentor` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/notifications/reject/:userId — admin rejects mentor
router.post('/reject/:userId', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Notification.create({
      recipient: user._id,
      type: 'mentor_rejected',
      message: 'Your Mentor account request was not approved. Please contact support for more information.',
    });

    await Notification.updateMany(
      { type: 'mentor_request', 'meta.applicantId': user._id },
      { read: true }
    );

    await User.findByIdAndDelete(user._id);

    res.json({ message: `${user.name} rejected and removed` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
