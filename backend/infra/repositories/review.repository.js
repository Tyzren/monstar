const Review = require('@models/review');
const Unit = require('@models/unit');
const User = require('@models/user');

class ReviewRepository {
  /**
   * Find all reviews with optional filter
   *
   * @param {Object} filter Optional filter criteria
   */
  static async findAll(filter = {}) {
    return await Review.find(filter).populate('author');
  }

  /**
   * Find all reviews for a specific unit
   *
   * @param {ObjectId} unitId
   */
  static async findByUnitId(unitId) {
    return await Review.find({ unit: unitId });
  }

  /**
   * Find all reviews by a specific user
   *
   * @param {String} userId
   */
  static async findByUserId(userId) {
    return await Review.find({ author: userId })
      .populate('unit')
      .populate('author');
  }

  /**
   * Find a review by a specific author for a specific unit
   *
   * @param {String} authorId
   * @param {ObjectId} unitId
   */
  static async findByAuthorAndUnit(authorId, unitId) {
    return await Review.findOne({
      author: authorId,
      unit: unitId,
    });
  }

  /**
   * Find a review by ID
   *
   * @param {String} reviewId
   */
  static async findById(reviewId) {
    return await Review.findById(reviewId);
  }

  /**
   * Create a new review
   *
   * @param {Object} reviewData
   */
  static async create(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
  }

  /**
   * Update a review by ID
   *
   * @param {String} reviewId
   * @param {Object} updateData
   */
  static async updateById(reviewId, updateData) {
    return await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
  }

  /**
   * Delete a review by ID
   *
   * @param {String} reviewId
   */
  static async deleteById(reviewId) {
    return await Review.findByIdAndDelete(reviewId);
  }

  /**
   * Add a review to a unit's reviews array
   *
   * @param {ObjectId} unitId
   * @param {ObjectId} reviewId
   */
  static async addReviewToUnit(unitId, reviewId) {
    return await Unit.findByIdAndUpdate(
      unitId,
      { $push: { reviews: reviewId } },
      { new: true, runValidators: true }
    );
  }

  /**
   * Add a review to a user's reviews array
   *
   * @param {String} userId
   * @param {ObjectId} reviewId
   */
  static async addReviewToUser(userId, reviewId) {
    return await User.findByIdAndUpdate(
      userId,
      { $push: { reviews: reviewId } },
      { new: true, runValidators: true }
    );
  }

  /**
   * Remove a review from a user's reviews array
   *
   * @param {String} userId
   * @param {String} reviewId
   */
  static async removeReviewFromUser(userId, reviewId) {
    return await User.findByIdAndUpdate(userId, {
      $pull: { reviews: reviewId },
    });
  }

  /**
   * Remove a review from a unit's reviews array
   *
   * @param {ObjectId} unitId
   * @param {String} reviewId
   */
  static async removeReviewFromUnit(unitId, reviewId) {
    return await Unit.findByIdAndUpdate(unitId, {
      $pull: { reviews: reviewId },
    });
  }
}

module.exports = ReviewRepository;
