const Notification = require('@models/notification');

/**
 * @typedef {import('@models/notification').INotification} INotification
 */

class NotificationRepository {
  /* -------------------------------- Retrieval ------------------------------- */

  /**
   * Find a notification by user and review
   *
   * @param {String} userId
   * @param {String} reviewId
   * @returns {Promise<INotification|null>}
   */
  static async findByUserAndReview(userId, reviewId) {
    return await Notification.findOne({
      user: userId,
      review: reviewId,
    });
  }

  /**
   * Find a notification by ID
   *
   * @param {String} notificationId
   * @returns {Promise<INotification|null>}
   */
  static async findById(notificationId) {
    return await Notification.findById(notificationId);
  }

  /**
   * Find all notifications for a user
   *
   * @param {String} userId
   * @returns {Promise<Array<INotification>>}
   */
  static async findByUserId(userId) {
    return await Notification.find({ user: userId })
      .populate('review')
      .sort({ createdAt: -1 });
  }

  /* -------------------------------- Creation -------------------------------- */

  /**
   * Create a new notification
   *
   * @param {Object} notificationData
   * @returns {Promise<INotification>}
   */
  static async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  /* --------------------------------- Removal -------------------------------- */

  /**
   * Delete a notification by ID
   *
   * @param {String} notificationId
   * @returns {Promise<INotification|null>}
   */
  static async deleteById(notificationId) {
    return await Notification.findByIdAndDelete(notificationId);
  }
}

module.exports = NotificationRepository;
