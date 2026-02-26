const NotificationRepository = require('@repositories/notification.repository');
const UnitRepository = require('@repositories/unit.repository');
const UserRepository = require('@repositories/user.repository');
const { Error404NotFound } = require('@utilities/errors');

/**
 * @typedef {import('@models/review').IReview} IReview
 * @typedef {import('@models/user').IUser} IUser
 */

class NotificationService {
  /**
   * Delete a notification
   *
   * @param {import('mongoose').ObjectId|String} authorId
   * @param {import('mongoose').ObjectId|String} reviewId
   */
  static delete = async (authorId, reviewId) => {
    const notification = await NotificationRepository.findByUserAndReview(
      authorId,
      reviewId
    );
    if (!notification) throw new Error404NotFound('Notification not found');
    await Promise.all([
      NotificationRepository.deleteById(notification._id),
      UserRepository.removeNotification(authorId, notification._id),
    ]);
  };

  /**
   * Create a "someone liked your review" notification
   *
   * @param {IUser} liker
   * @param {IReview} review
   */
  static createLike = async (liker, review) => {
    if (liker._id.toString() === review.author._id.toString()) return;

    const unit = await UnitRepository.findById(review.unit);
    if (!unit)
      throw new Error404NotFound(
        'The unit that this review was written for does not exist'
      );

    const newNotification = await NotificationRepository.create({
      data: {
        message: `${liker.username} liked your review on ${unit.unitCode.toUpperCase()}`,
        user: { username: liker.username, profileImg: liker.profileImg },
      },
      navigateTo: `/unit/${unit.unitCode}`,
      review: review._id,
      user: review.author,
    });
    await UserRepository.addNotification(review.author, newNotification._id);
    return newNotification;
  };
}

module.exports = NotificationService;
