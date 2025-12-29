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
   */
  static async findByEmailOrGoogleId(email, googleId) {
    return await User.findOne({
      $or: [{ email: email }, { googleId: googleId }]
    });
  }

  /**
   * Create a user
   */
  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  static async updateRefreshToken(user, hashedToken, expiry) {
    user.refreshToken = hashedToken;
    user.refreshTokenExpires = expiry;
    return await user.save();
  }
}

module.exports = UserRepository;
