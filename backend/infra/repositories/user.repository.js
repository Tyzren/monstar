const User = require('@models/user');

class UserRepository {
  /**
   * Find a user by ID
   *
   * @param {String} userId
   */
  static async findById(userId) {
    return await User.findById(userId);
  }

  /**
   * Find a user by email or google id
   *
   * @param {String} email
   * @param {String} googleId
   */
  static async findByEmailOrGoogleId(email, googleId) {
    return await User.findOne({
      $or: [{ email: email }, { googleId: googleId }],
    });
  }

  /**
   * Create a user
   *
   * @param {Object} userData
   */
  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Update the refresh token of a user
   *
   * @param {String|import('mongoose').ObjectId} userId
   * @param {String} hashedToken
   * @param {Date} expiry
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
   */
  static async findByHashedRefreshToken(hashedRefreshToken) {
    return await User.findOne({
      refreshToken: hashedRefreshToken,
      refreshTokenExpires: { $gt: Date.now() },
    });
  }

  /**
   * Unsets the refreshToken and expiry fields
   */
  static async invalidateRefreshToken(userId) {
    return await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1, refreshTokenExpires: 1 }
    });
  }
}

module.exports = UserRepository;
