const express = require('express');

const JobController = require('@controllers/job.controller');
const userMiddleware = require('@middleware/user.middleware');

const router = express.Router();

router.get(
  '/',
  // #swagger.tags = ['Jobs']
  // #swagger.summary = 'Get all jobs'
  JobController.getAll
);

router.get(
  '/open',
  // #swagger.tags = ['Jobs']
  // #swagger.summary = 'Get all open job listings'
  JobController.getOpen
);

router.get(
  '/status/:status',
  // #swagger.tags = ['Jobs']
  // #swagger.summary = 'Get job listings by status (OPEN, CLOSED, Opening Soon)'
  JobController.getByStatus
);

router.get(
  '/role-type/:roleType',
  // #swagger.tags = ['Jobs']
  // #swagger.summary = 'Get job listings by role type category'
  JobController.getByRoleType
);

router.get(
  '/:notionId',
  // #swagger.tags = ['Jobs']
  // #swagger.summary = 'Get a single job listing by ID'
  JobController.getById
);

router.post(
  '/refresh-cache',
  userMiddleware,
  // #swagger.tags = ['Jobs']
  // #swagger.summary = 'Invalidate jobs cache (auth required)'
  JobController.refreshCache
);

module.exports = router;
