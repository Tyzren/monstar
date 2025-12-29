const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @typedef {Object} INotification
 * @property {import('mongoose').Types.ObjectId} _id - Notification ID
 * @property {Object} data - Notification data payload
 * @property {string} navigateTo - URL to navigate to when clicked
 * @property {Date} timestamp - When notification was created
 * @property {boolean} isRead - Whether notification has been read
 * @property {import('mongoose').Types.ObjectId} review - Review ID reference
 * @property {import('mongoose').Types.ObjectId} user - User ID reference (recipient)
 */

const notificationSchema = new Schema({
  data: { type: Object, required: true },
  navigateTo: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
