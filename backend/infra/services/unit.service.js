const { getSortCriteria } = require('@constants/sortOptions');
const UnitRepository = require('@infra/repositories/unit.repository');
const { buildFilterQuery } = require('@infra/utilities/unitFilterHelpers');

class UnitService {
  /**
   * Get all units
   */
  static fetchAll = async () => {
    return await UnitRepository.findAll();
  };

  /**
   * Get units filtered
   *
   * @param {Object} filterOptions
   */
  static fetchPaginated = async (filterOptions) => {
    const { offset = 0, limit = 10, sort = 'Alphabetic' } = filterOptions;

    const query = buildFilterQuery(filterOptions);
    const sortCriteria = getSortCriteria(sort);

    return await UnitRepository.findWithPagination(
      query,
      sortCriteria,
      offset,
      limit
    );
  };

  /**
   * Get N most reviewed units
   *
   * @param {Number} n
   */
  static fetchMostReviewed = async (n = 10) => {
    return await UnitRepository.findMostReviewedUnits(n);
  };

  /**
   * Get a unit by unitcode
   *
   * @param {String} unitCode
   */
  static fetchByCode = async (unitCode) => {
    return await UnitRepository.findOneByUnitcode(unitCode);
  };

  /**
   * Modify a unit
   *
   * @param {String} unitCode
   * @param {Object} updateData
   */
  static modifyByUnitcode = async (unitCode, updateData) => {
    const allowedFields = [
      'name',
      'description',
      'avgOverallRating',
      'avgContentRating',
      'avgFacultyRating',
      'avgRelevancyRating',
    ];
    const hasOnlyAllowedFields = Object.keys(updateData).every((key) =>
      allowedFields.includes(key)
    );
    if (!hasOnlyAllowedFields)
      throw new Error('Disallowed fields present in update data');
    const unit = await UnitRepository.updateOneByUnitcode(unitCode, updateData);
    if (!unit) throw new Error('Unit not found');
    return unit;
  };

  /**
   * Fetch all units that have the given unit as a prerequisite
   *
   * @param {String} unitCode
   */
  static fetchUnitsRequiredBy = async (unitCode) => {
    const unit = await UnitRepository.findOneByUnitCode(unitCode);
    if (!unit) throw new Error('Unit not found');
    return await UnitRepository.findRequiredBy(unitCode);
  };
}

module.exports = UnitService;
