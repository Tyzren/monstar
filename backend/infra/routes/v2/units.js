const express = require('express');

const UnitController = require('@controllers/unit.controller');

const router = express.Router();

router.get(
  '/',
  // #swagger.tags = ['Units V2']
  // #swagger.summary = 'Get all units'
  UnitController.listAll
);

router.get(
  '/popular',
  // #swagger.tags = ['Units V2']
  // #swagger.summary = 'Get 10 most popular units'
  UnitController.listMostReviewed
);

module.exports = router;
