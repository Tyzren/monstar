const { getSortCriteria } = require('@constants/sortOptions');
const UnitRepository = require('@infra/repositories/unit.repository');
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
    const { offset = 0, limit = 10, sort = 'Alphabetic' } = filterOptions;

    const query = buildFilterQuery(filterOptions);
    const sortCriteria = getSortCriteria(sort);

    return await UnitRepository.queryPaginatedUnits(query, sortCriteria, offset, limit);
  };

  /**
   * Get N most reviewed units
   */
  static async getMostReviewedUnits(n = 10) {
    return await UnitRepository.queryMostReviewedUnits(n);
  }
}

module.exports = UnitService;
