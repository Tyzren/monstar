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
}

module.exports = UserRepository;
