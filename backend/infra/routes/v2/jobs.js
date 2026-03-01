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

module.exports = router;