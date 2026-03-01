const asyncHandler = require('express-async-handler');
const JobService = require('@services/job.service');

class JobController {
    static getAll = asyncHandler(async (req, res) => {
        const jobs = await JobService.fetchAll();
        return res.status(200).json(jobs);
    });
}