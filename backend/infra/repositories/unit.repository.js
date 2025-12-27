const Unit = require('@models/unit');

class UnitRepository {
  /**
   * Query for units with pagination, filtering, and sorting
   */
  static async queryPaginatedUnits(query, sortCriteria, skip, limit) {
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          hasReviews: { $cond: [{ $gt: [{ $size: '$reviews' }, 0] }, 1, 0] },
        },
      },
    ];

    const countPipeline = [...pipeline, { $count: 'total' }];

    const paginatedPipeline = [
      ...pipeline,
      { $sort: { ...sortCriteria, _id: 1 } },
      { $skip: Number(skip) },
      { $limit: Number(limit) },
    ];

    const [units, countResult] = await Promise.all([
      Unit.aggregate(paginatedPipeline),
      Unit.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return { units, total };
  }

  /**
   * Query for N most reviewed units
   */
  static async queryMostReviewedUnits(n) {
    return await Unit.aggregate([
      { $addFields: { reviewCount: { $size: '$reviews' } } },
      { $sort: { reviewCount: -1 } },
      { $limit: n },
    ]).then((units) =>
      Unit.populate(units, {
        path: 'reviews',
        select:
          'title description overallRating relevancyRating facultyRating contentRating likes dislikes',
      })
    );
  }
}

module.exports = UnitRepository;
