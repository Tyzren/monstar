const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

const ReviewService = require('@services/review.service');

class ReviewController {
  /**
   * Get all reviews (with optional filter from body)
   */
  static getAll = asyncHandler(async (req, res) => {
    const reviews = await ReviewService.fetchAll(req.body);
    return res.status(200).json(reviews);
  });

  /**
   * Get all reviews for a specific unit
   */
  static getByUnit = asyncHandler(async (req, res) => {
    const unitCode = req.params.unit.toLowerCase();

    const reviews = await ReviewService.fetchByUnit(unitCode);
    return res.status(200).json(reviews);
  });

  /**
   * Get all reviews by a specific user
   */
  static getByUser = asyncHandler(async (req, res) => {
    const reviews = await ReviewService.fetchByUser(req.params.userId);
    return res.status(200).json(reviews);
  });

  /**
   * Create a new review for a unit
   */
  static createReview = asyncHandler(async (req, res) => {
    const unitCode = req.params.unit.toLowerCase();

    // Verify that the author in the request body matches the authenticated user
    if (req.body.review_author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        error: 'You are not authorized to create a review for this unit',
      });
    }

    const review = await ReviewService.createReview(unitCode, req.body);
    return res.status(201).json(review);
  });

  /**
   * Update a review by ID
   */
  static updateReview = asyncHandler(async (req, res) => {
    const updatedReview = await ReviewService.updateReview(
      req.params.reviewId,
      req.user.id,
      req.body
    );

    return res.status(200).json({
      message: 'Review successfully updated',
      review: updatedReview,
    });
  });

  /**
   * Delete a review by ID
   */
  static deleteReview = asyncHandler(async (req, res) => {
    await ReviewService.deleteReview(req.params.reviewId, req.user.id);

    return res.status(200).json({
      message: 'Review successfully deleted',
    });
  });

  /**
   * Toggle like/dislike on a review
   */
  static toggleReaction = asyncHandler(async (req, res) => {
    const reviewId = req.params.reviewId;
    const { userId, reactionType } = req.body;

    if (!['like', 'dislike'].includes(reactionType)) {
      return res.status(400).json({
        error: 'Invalid reaction type. Must be "like" or "dislike"',
      });
    }

    const result = await ReviewService.toggleReaction(
      reviewId,
      userId,
      reactionType
    );

    return res.status(200).json(result);
  });

  /**
   * Send report email for a review
   */
  static sendReport = asyncHandler(async (req, res) => {
    const { reportReason, reportDescription, reporterName, review } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME,
      subject: `Report on review written by user ${review.author.username}`,
      html: `<p>
Reporter: ${reporterName} <br>
Reason: ${reportReason} <br>
Description: ${reportDescription} <br>
<br>
Author ID: ${review.author._id} <br>
Author Username: ${review.author.username} <br>
<br>
Review ID: ${review._id} <br>
Review Title: ${review.title} <br>
Review Description: ${review.description} <br>
</p>`,
    });

    return res.status(201).json({ message: 'Report email sent' });
  });
}

module.exports = ReviewController;
