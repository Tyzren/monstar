const asyncHandler = require('express-async-handler');

const UnitService = require('@infra/services/unit.service');

const { isValidSortOption } = require('../../constants/sortOptions');

class UnitController {
  /**
   * List all units
   */
  static listAll = asyncHandler(async (req, res) => {
    const units = UnitService.getAllUnits();
    return res.status(201).json(units);
  });

  /**
   * List units filtered
   */
  static listFiltered = asyncHandler(async (req, res) => {
    const { sort = 'Alphabetic' } = req.query;
    if (!isValidSortOption(sort)) {
      return res.status(400).json({
        error: `Invalid sort options: ${sort}. Must be one of: Alphabetic, Most Reviews, Highest Overall, or Lowest Overall`,
      });
    }

    const { units, total } = await UnitService.getFilteredUnits(req.query);
    if (!units.length) {
      return res.status(404).json({ error: 'No units match the given query' });
    }

    return res.status(200).json({ units, total });
  });

  /**
   * List most reviewed units
   */
  static listMostReviewed = asyncHandler(async (req, res) => {
    const mostReviewedUnits = await UnitService.getMostReviewedUnits(10);
    return res.status(200).json(mostReviewedUnits);
  });
}

module.exports = UnitController;
