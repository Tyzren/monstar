const Unit = require('@models/unit');

class UnitRepository {
  /**
   * Find all units
   */
  static async findAll() {
    return await Unit.find({}).populate('reviews');
  }

  static async findOneByUnitcode(unitcode) {
    return await Unit.findOne({ unitCode: unitcode.toLowerCase() });
  }

  /**
   * Query for units with pagination, filtering, and sorting
   */
  static async findWithPagination(query, sortCriteria, skip, limit) {
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
  static async findMostReviewedUnits(n) {
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

  static async updateOneByUnitcode(unitCode, updateData) {
    return await Unit.findOneAndUpdate({ unitCode: unitCode }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Finds units that have the given unit as a prerequisite
   *
   * E.g., (given) FIT1045 -> FIT1008 (find these ones)
   */
  static async findRequiredBy(unitCode) {
    return await Unit.find({
      'requisites.prerequisites': {
        $elemMatch: {
          units: { $in: [unitCode.toUpperCase(), unitCode.toLowerCase()] },
        },
      },
    });
  }
}

module.exports = UnitRepository;
