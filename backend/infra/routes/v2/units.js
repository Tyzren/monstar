const express = require('express');

const UnitController = require('@controllers/unit.controller');
const adminMiddleware = require('@infra/middleware/admin.middleware');

const router = express.Router();

router.get(
  '/',
  // #swagger.tags = ['Units V2']
  // #swagger.summary = 'Get all units'
  UnitController.getAll
);

router.get(
  '/popular',
  // #swagger.tags = ['Units V2']
  // #swagger.summary = 'Get 10 most popular units'
  UnitController.getMostReviewed
);

router.get(
  '/filter',
  // #swagger.tags = ['Units V2']
  // #swagger.summary = 'Get paginated and filtered units'
  UnitController.getPaginated
);

router.put(
  '/update/:unitcode',
  adminMiddleware,
  // #swagger.tags = ['Units V2']
  // #swagger.summary = 'Update a unit'
  UnitController.updateByUnitcode
);

router.get(
  '/:unitCode/required-by',
  // #swagger.tags = ['Units V2']
  // #swagger.description = 'Get all units that have the given unit as a prerequisite'
  UnitController.getRequiredBy
);

module.exports = router;
