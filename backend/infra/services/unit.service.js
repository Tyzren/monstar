const { getSortCriteria } = require('@constants/sortOptions');
const { buildFilterQuery } = require('@infra/utilities/unitFilterHelpers');
const Unit = require('@models/unit');

class UnitService {
  /**
   * Get all units
   */
  static getAllUnits = async () => {
    return await Unit.find({}).populate('reviews');
  };

  /**
   * Get units filtered
   */
  static getFilteredUnits = async (filterOptions) => {
    // Get the query parameters
    const {
      offset = 0,
      limit = 10,
      search = '',
      sort = 'Alphabetic',
      showReviewed = 'false',
      showUnreviewed = 'false',
      hideNoOfferings = 'false',
      faculty,
      semesters,
      campuses,
    } = filterOptions;

    // Build the base filter query using helper
    const query = buildFilterQuery({
      search,
      faculty,
      semesters,
      campuses,
      showReviewed,
      showUnreviewed,
      hideNoOfferings,
    });

    const sortCriteria = getSortCriteria(sort);

    const pipeline = [
      // Match the units based on the query
      { $match: query },
      // Populate the reviews field for each unit
      {
        $lookup: {
          from: 'reviews',
          localField: 'reviews',
          foreignField: '_id',
          as: 'reviews',
        },
      },
      // Compute the number of reviews for each unit and whether it has reviews
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          hasReviews: { $cond: [{ $gt: [{ $size: '$reviews' }, 0] }, 1, 0] },
        },
      },
    ];

    const countPipeline = [...pipeline, { $count: 'total' }];

    pipeline.push(
      { $sort: { ...sortCriteria, _id: 1 } },
      { $skip: Number(offset) },
      { $limit: Number(limit) }
    );

    const [units, countResult] = await Promise.all([
      Unit.aggregate(pipeline),
      Unit.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return { units, total };
  };

  /**
   * Get N most reviewed units
   */
  static async getMostReviewedUnits(n = 10) {
    const popularUnits = await Unit.aggregate([
      {
        $addFields: {
          reviewCount: { $size: '$reviews' }
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: n }
    ]);

    return await Unit.populate(popularUnits, {
      path: 'reviews',
      select: 'title description overallRating relevancyRating facultyRating contentRating likes dislikes'
    });
  }
}

module.exports = UnitService;
