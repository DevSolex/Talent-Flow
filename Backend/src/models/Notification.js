const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['mentor_request', 'mentor_approved', 'mentor_rejected'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { applicantId, applicantName }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
