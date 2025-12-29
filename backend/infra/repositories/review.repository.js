const Review = require('@models/review');
const Unit = require('@models/unit');
const User = require('@models/user');

/**
 * @typedef {import('@models/review').IReview} IReview
 * @typedef {import('@models/unit').IUnit} IUnit
 * @typedef {import('@models/user').IUser} IUser
 */

class ReviewRepository {
  /* -------------------------------- Retrieval ------------------------------- */

  /**
   * Find all reviews with optional filter
   *
   * @param {Object} filter Optional filter criteria
   * @returns {Promise<Array<IReview>>}
   */
  static async findAll(filter = {}) {
    return await Review.find(filter).populate('author');
  }

  /**
   * Find all reviews for a specific unit
   *
   * @param {ObjectId} unitId
   * @returns {Promise<Array<IReview>>}
   */
  static async findByUnitId(unitId) {
    return await Review.find({ unit: unitId });
  }

  /**
   * Find all reviews by a specific user
   *
   * @param {String} userId
   * @returns {Promise<Array<IReview>>}
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
   * @returns {Promise<IReview|null>}
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
   * @returns {Promise<IReview|null>}
   */
  static async findById(reviewId) {
    return await Review.findById(reviewId);
  }

  /* -------------------------------- Creation -------------------------------- */

  /**
   * Create a new review
   *
   * @param {Object} reviewData
   * @returns {Promise<IReview>}
   */
  static async create(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
  }

  /**
   * Add a review to a unit's reviews array
   *
   * @param {ObjectId} unitId
   * @param {ObjectId} reviewId
   * @returns {Promise<IUnit|null>}
   */
  static async addReviewToUnit(unitId, reviewId) {
    return await Unit.findByIdAndUpdate(
      unitId,
      { $push: { reviews: reviewId } },
      { new: true, runValidators: true }
    );
  }

  /* ------------------------------ Modification ------------------------------ */

  /**
   * Add a review to a user's reviews array
   *
   * @param {String} userId
   * @param {ObjectId} reviewId
   * @returns {Promise<IUser|null>}
   */
  static async addReviewToUser(userId, reviewId) {
    return await User.findByIdAndUpdate(
      userId,
      { $push: { reviews: reviewId } },
      { new: true, runValidators: true }
    );
  }

  /**
   * Update a review by ID
   *
   * @param {String} reviewId
   * @param {Object} updateData
   * @returns {Promise<IReview|null>}
   */
  static async updateById(reviewId, updateData) {
    return await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
  }

  /* --------------------------------- Removal -------------------------------- */

  /**
   * Delete a review by ID
   *
   * @param {String} reviewId
   * @returns {Promise<IReview|null>}
   */
  static async deleteById(reviewId) {
    return await Review.findByIdAndDelete(reviewId);
  }

  /**
   * Remove a review from a user's reviews array
   *
   * @param {String} userId
   * @param {String} reviewId
   * @returns {Promise<IUser|null>}
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
   * @returns {Promise<IUnit|null>}
   */
  static async removeReviewFromUnit(unitId, reviewId) {
    return await Unit.findByIdAndUpdate(unitId, {
      $pull: { reviews: reviewId },
    });
  }

  /* -------------------------------- Reactions ------------------------------- */

  /**
   * Increment likes count for a review
   *
   * @param {String} reviewId
   * @returns {Promise<IReview|null>}
   */
  static async incrementLikes(reviewId) {
    return await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { likes: 1 } },
      { new: true }
    );
  }

  /**
   * Decrement likes count for a review
   *
   * @param {String} reviewId
   * @returns {Promise<IReview|null>}
   */
  static async decrementLikes(reviewId) {
    return await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { likes: -1 } },
      { new: true }
    );
  }

  /**
   * Increment dislikes count for a review
   *
   * @param {String} reviewId
   * @returns {Promise<IReview|null>}
   */
  static async incrementDislikes(reviewId) {
    return await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { dislikes: 1 } },
      { new: true }
    );
  }

  /**
   * Decrement dislikes count for a review
   *
   * @param {String} reviewId
   * @returns {Promise<IReview|null>}
   */
  static async decrementDislikes(reviewId) {
    return await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { dislikes: -1 } },
      { new: true }
    );
  }
}

module.exports = ReviewRepository;
