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
   * @param {User} user
   * @param {String} hashedToken
   * @param {Date} expiry
   */
  static async updateRefreshToken(user, hashedToken, expiry) {
    user.refreshToken = hashedToken;
    user.refreshTokenExpires = expiry;
    return await user.save();
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
}

module.exports = UserRepository;
