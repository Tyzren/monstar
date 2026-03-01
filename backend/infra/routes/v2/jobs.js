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

module.exports = router;