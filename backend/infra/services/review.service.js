const {
  Error404NotFound,
  Error409Conflict,
  Error401NotAuthorized,
} = require('@infra/utilities/errors');
const Notification = require('@models/notification');
const ReviewRepository = require('@repositories/review.repository');
const UnitRepository = require('@repositories/unit.repository');
const UserRepository = require('@repositories/user.repository');

/**
 * @typedef {import('@models/review').IReview} IReview
 */

class ReviewService {
  /**
   * Fetch all reviews with optional filter
   *
   * @param {Object} filter - Optional filter criteria
   * @returns {Promise<Array<IReview>>}
   */
  static fetchAll = async (filter = {}) => {
    return await ReviewRepository.findAll(filter);
  };

  /**
   * Fetch all reviews for a specific unit
   *
   * @param {String} unitCode
   * @returns {Promise<Array<IReview>>}
   */
  static fetchByUnit = async (unitCode) => {
    // Find the unit first
    const unit = await UnitRepository.findOneByUnitcode(unitCode);
    if (!unit) throw new Error404NotFound(`Unit not found`);

    return await ReviewRepository.findByUnitId(unit._id);
  };

  /**
   * Fetch all reviews by a specific user
   *
   * @param {String} userId
   * @returns {Promise<Array<IReview>>}
   */
  static fetchByUser = async (userId) => {
    return await ReviewRepository.findByUserId(userId);
  };

  /**
   * Create a new review for a unit
   *
   * @param {String} unitCode
   * @param {Object} reviewData
   * @returns {Promise<IReview>}
   */
  static createReview = async (unitCode, reviewData) => {
    // Find the unit
    const unit = await UnitRepository.findOneByUnitcode(unitCode);
    if (!unit)
      throw new Error404NotFound(`Unit with code ${unitCode} not found in DB`);

    // Check if the user has already reviewed this unit
    const existingReview = await ReviewRepository.findByAuthorAndUnit(
      reviewData.author,
      unit._id
    );

    if (existingReview) {
      throw new Error409Conflict('You have already reviewed this unit');
    }

    // Create and save the review
    const review = await ReviewRepository.create({
      ...reviewData,
      unit: unit._id,
    });

    // Add review to unit's reviews array
    await ReviewRepository.addReviewToUnit(unit._id, review._id);

    // Add review to user's reviews array
    await ReviewRepository.addReviewToUser(reviewData.author, review._id);

    // Recalculate and update unit averages
    await this._recalculateUnitAverages(unit._id);

    return review;
  };

  /**
   * Update a review by ID
   *
   * @param {String} reviewId
   * @param {String} userId - ID of the user making the request
   * @param {Object} updateData
   * @returns {Promise<IReview|null>}
   */
  static updateReview = async (reviewId, userId, updateData) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) throw new Error404NotFound('Review not found');

    // Get the requesting user
    const requestingUser = await UserRepository.findById(userId);
    if (!requestingUser)
      throw new Error404NotFound('Requesting user not found');

    // Check authorization (must be author or admin)
    const isAuthor = review.author.toString() === requestingUser._id.toString();
    if (!isAuthor && !requestingUser.admin) {
      throw new Error401NotAuthorized('Unauthorized to update review');
    }

    // Update the review
    const updatedReview = await ReviewRepository.updateById(
      reviewId,
      updateData
    );

    // Recalculate unit averages
    await this._recalculateUnitAverages(review.unit);

    return updatedReview;
  };

  /**
   * Delete a review by ID
   *
   * @param {String} reviewId
   * @param {String} userId - ID of the user making the request
   * @returns {Promise<void>}
   */
  static deleteReview = async (reviewId, userId) => {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) throw new Error404NotFound('Review not found');

    // Get the requesting user
    const requestingUser = await UserRepository.findById(userId);
    if (!requestingUser)
      throw new Error404NotFound('Requesting user not found');

    // Check authorization (must be author or admin)
    const isAuthor = review.author.toString() === requestingUser._id.toString();
    const isAdmin = requestingUser.admin;
    if (!isAuthor && !isAdmin) {
      throw new Error401NotAuthorized(
        'You are not authorized to delete this review'
      );
    }

    const unitId = review.unit;

    // Delete the review
    await ReviewRepository.deleteById(reviewId);

    // Remove review from user's reviews array
    await ReviewRepository.removeReviewFromUser(review.author, reviewId);

    // Remove review from unit's reviews array
    await ReviewRepository.removeReviewFromUnit(unitId, reviewId);

    // Recalculate unit averages
    await this._recalculateUnitAverages(unitId);
  };

  /**
   * Toggle like/dislike reaction on a review
   *
   * @param {String} reviewId
   * @param {String} userId
   * @param {String} reactionType - 'like' or 'dislike'
   * @returns {Promise<{review: IReview, reactions: {liked: boolean, disliked: boolean}}>}
   */
  static toggleReaction = async (reviewId, userId, reactionType) => {
    //TODO: We can't have these database operations done here, find out a way to use repos only.
    // Fetch all required documents in parallel
    const [review, user] = await Promise.all([
      ReviewRepository.findById(reviewId),
      UserRepository.findById(userId),
    ]);

    if (!review) throw new Error404NotFound('Review not found');
    if (!user) throw new Error404NotFound('User not found');

    // Fetch additional required documents
    const [unit, author] = await Promise.all([
      UnitRepository.findById(review.unit),
      UserRepository.findById(review.author),
    ]);

    if (!unit) throw new Error404NotFound('Unit not found');
    if (!author) throw new Error404NotFound('Author not found');

    // Initialize operations object to track changes
    const operations = {
      notificationToRemove: null,
      notificationToAdd: null,
      reactionAdded: false,
      reactionRemoved: false,
      oppositeReactionRemoved: false,
    };

    // Handle like/dislike toggle
    if (reactionType === 'like') {
      const hasLiked = user.likedReviews.includes(review._id);

      if (hasLiked) {
        // Remove like
        review.likes = Math.max(0, review.likes - 1);
        user.likedReviews.pull(review._id);
        operations.reactionRemoved = true;

        // Find and mark notification for removal
        operations.notificationToRemove = await Notification.findOne({
          user: author._id,
          review: review._id,
        });
      } else {
        // Add like
        review.likes++;
        user.likedReviews.push(review._id);
        operations.reactionAdded = true;

        // Create notification data
        operations.notificationToAdd = {
          data: {
            message: `${user.username} liked your review on ${unit.unitCode.toUpperCase()}`,
            user: { username: user.username, profileImg: user.profileImg },
          },
          navigateTo: `/unit/${unit.unitCode}`,
          review: review._id,
          user: author._id,
        };

        // Check if user had disliked this review
        if (user.dislikedReviews.includes(review._id)) {
          review.dislikes = Math.max(0, review.dislikes - 1);
          user.dislikedReviews.pull(review._id);
          operations.oppositeReactionRemoved = true;
        }
      }
    } else {
      // dislike
      const hasDisliked = user.dislikedReviews.includes(review._id);

      if (hasDisliked) {
        // Remove dislike
        review.dislikes = Math.max(0, review.dislikes - 1);
        user.dislikedReviews.pull(review._id);
        operations.reactionRemoved = true;
      } else {
        // Add dislike
        review.dislikes++;
        user.dislikedReviews.push(review._id);
        operations.reactionAdded = true;

        // Check if user had liked this review
        if (user.likedReviews.includes(review._id)) {
          review.likes = Math.max(0, review.likes - 1);
          user.likedReviews.pull(review._id);
          operations.oppositeReactionRemoved = true;

          // Find and mark notification for removal
          operations.notificationToRemove = await Notification.findOne({
            user: author._id,
            review: review._id,
          });
        }
      }
    }

    // Process notifications
    if (operations.notificationToRemove) {
      await Notification.deleteOne({
        _id: operations.notificationToRemove._id,
      });

      if (
        author.notifications &&
        author.notifications.includes(operations.notificationToRemove._id)
      ) {
        author.notifications.pull(operations.notificationToRemove._id);
      }
    }

    if (operations.notificationToAdd) {
      const newNotification = new Notification(operations.notificationToAdd);
      await newNotification.save();

      if (!author.notifications) {
        author.notifications = [];
      }
      author.notifications.push(newNotification._id);
    }

    // Save all documents in parallel
    await Promise.all([review.save(), user.save(), author.save()]);

    // Return the updated review with reaction status
    return {
      review,
      reactions: {
        liked: user.likedReviews.includes(review._id),
        disliked: user.dislikedReviews.includes(review._id),
      },
    };
  };

  /**
   * Private helper to recalculate and update unit rating averages
   *
   * @param {ObjectId} unitId
   * @returns {Promise<void>}
   */
  static _recalculateUnitAverages = async (unitId) => {
    const allReviews = await ReviewRepository.findByUnitId(unitId);

    const avgOverallRating = allReviews.length
      ? allReviews.reduce((sum, rev) => sum + rev.overallRating, 0) /
        allReviews.length
      : 0;
    const avgContentRating = allReviews.length
      ? allReviews.reduce((sum, rev) => sum + rev.contentRating, 0) /
        allReviews.length
      : 0;
    const avgFacultyRating = allReviews.length
      ? allReviews.reduce((sum, rev) => sum + rev.facultyRating, 0) /
        allReviews.length
      : 0;
    const avgRelevancyRating = allReviews.length
      ? allReviews.reduce((sum, rev) => sum + rev.relevancyRating, 0) /
        allReviews.length
      : 0;

    await UnitRepository.updateOneByUnitcode(unitId, {
      avgOverallRating,
      avgContentRating,
      avgFacultyRating,
      avgRelevancyRating,
    });
  };
}

module.exports = ReviewService;
