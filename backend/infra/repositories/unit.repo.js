const Unit = require('@models/unit');

class UnitRepository {
  /**
   *
   */
  static async queryPaginatedUnits(query, sortCriteria, skip, limit) {
    const pipeline = [
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

    const paginatedPipeline = [
      ...pipeline,
      { $sort: { ...sortCriteria, _id: 1 } },
      { $skip: Number(skip) },
      { $limit: Number(limit) }
    ]

    const [units, countResult] = await Promise.all([
      Unit.aggregate(paginatedPipeline),
      Unit.aggregate(countPipeline),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return { units, total };
  }
}

module.exports = UnitRepository;
