const User = require('@models/user');

/**
 * @typedef {import('@models/user').IUser} IUser
 */

class UserRepository {
  /* -------------------------------- Retrieval ------------------------------- */

  /**
   * Find a user by ID
   *
   * @param {String} userId
   * @returns {Promise<IUser|null>}
   */
  static async findById(userId) {
    return await User.findById(userId);
  }

  /**
   * Find a user by email or google id
   *
   * @param {String} email
   * @param {String} googleId
   * @returns {Promise<IUser|null>}
   */
  static async findByEmailOrGoogleId(email, googleId) {
    return await User.findOne({
      $or: [{ email: email }, { googleId: googleId }],
    });
  }

  /**
   * Find a user by username (excludes sensitive fields)
   *
   * @param {String} username
   * @returns {Promise<IUser|null>}
   */
  static async findByUsername(username) {
    return await User.findOne(
      { username },
      {
        password: 0,
        refreshToken: 0,
        refreshTokenExpires: 0,
        verificationToken: 0,
        verificationTokenExpires: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0,
        googleID: 0,
      }
    );
  }

  /* -------------------------------- Creation -------------------------------- */

  /**
   * Create a user
   *
   * @param {Object} userData
   * @returns {Promise<IUser>}
   */
  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /* ------------------------------ Modification ------------------------------ */

  /**
   * Update user's profile image
   *
   * @param {String} userId
   * @param {String} profileImgUrl
   * @returns {Promise<IUser|null>}
   */
  static async updateProfileImage(userId, profileImgUrl) {
    return await User.findByIdAndUpdate(
      userId,
      { profileImg: profileImgUrl },
      { new: true }
    );
  }

  /* ----------------------------- Authentication ----------------------------- */

  /**
   * Update the refresh token of a user
   *
   * @param {String|import('mongoose').ObjectId} userId
   * @param {String} hashedToken
   * @param {Date} expiry
   * @returns {Promise<IUser|null>}
   */
  static async updateRefreshToken(userId, hashedToken, expiry) {
    return await User.findByIdAndUpdate(
      userId,
      {
        refreshToken: hashedToken,
        refreshTokenExpires: expiry,
      },
      { new: true }
    );
  }

  /**
   * Find a user by their hashed refresh token
   *
   * @param {String} hashedRefreshToken
   * @returns {Promise<IUser|null>}
   */
  static async findByHashedRefreshToken(hashedRefreshToken) {
    return await User.findOne({
      refreshToken: hashedRefreshToken,
      refreshTokenExpires: { $gt: Date.now() },
    });
  }

  /**
   * Unsets the refreshToken and expiry fields
   *
   * @param {String} userId
   * @returns {Promise<IUser|null>}
   */
  static async invalidateRefreshToken(userId) {
    return await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1, refreshTokenExpires: 1 },
    });
  }

  /* -------------------------------- Reactions ------------------------------- */

  /**
   * Add a review to user's liked reviews
   *
   * @param {String} userId
   * @param {String} reviewId
   * @returns {Promise<IUser|null>}
   */
  static async addLikedReview(userId, reviewId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { likedReviews: reviewId } },
      { new: true }
    );
  }

  /**
   * Remove a review from user's liked reviews
   *
   * @param {String} userId
   * @param {String} reviewId
   * @returns {Promise<IUser|null>}
   */
  static async removeLikedReview(userId, reviewId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { likedReviews: reviewId } },
      { new: true }
    );
  }

  /**
   * Add a review to user's disliked reviews
   *
   * @param {String} userId
   * @param {String} reviewId
   * @returns {Promise<IUser|null>}
   */
  static async addDislikedReview(userId, reviewId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { dislikedReviews: reviewId } },
      { new: true }
    );
  }

  /**
   * Remove a review from user's disliked reviews
   *
   * @param {String} userId
   * @param {String} reviewId
   * @returns {Promise<IUser|null>}
   */
  static async removeDislikedReview(userId, reviewId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { dislikedReviews: reviewId } },
      { new: true }
    );
  }

  /**
   * Check if user has liked a review
   *
   * @param {String} userId
   * @param {String} reviewId
   * @returns {Promise<boolean>}
   */
  static async hasLikedReview(userId, reviewId) {
    const user = await User.findById(userId, { likedReviews: 1 });
    return user ? user.likedReviews.includes(reviewId) : false;
  }

  /**
   * Check if user has disliked a review
   *
   * @param {String} userId
   * @param {String} reviewId
   * @returns {Promise<boolean>}
   */
  static async hasDislikedReview(userId, reviewId) {
    const user = await User.findById(userId, { dislikedReviews: 1 });
    return user ? user.dislikedReviews.includes(reviewId) : false;
  }

  /* ------------------------------ Notifications ----------------------------- */

  /**
   * Add a notification to user's notifications array
   *
   * @param {String} userId
   * @param {String} notificationId
   * @returns {Promise<IUser|null>}
   */
  static async addNotification(userId, notificationId) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { notifications: notificationId } },
      { new: true }
    );
  }

  /**
   * Remove a notification from user's notifications array
   *
   * @param {String} userId
   * @param {String} notificationId
   * @returns {Promise<IUser|null>}
   */
  static async removeNotification(userId, notificationId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { notifications: notificationId } },
      { new: true }
    );
  }
}

module.exports = UserRepository;
