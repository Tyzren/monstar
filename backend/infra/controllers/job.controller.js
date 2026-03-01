const asyncHandler = require('express-async-handler');
const JobService = require('@services/job.service');

class JobController {
    static getAll = asyncHandler(async (req, res) => {
        const jobs = await JobService.fetchAll();
        return res.status(200).json(jobs);
    });

    static getOpen = asyncHandler(async (req, res) => {
        const jobs = await JobService.fetchOpen();
        return res.status(200).json(jobs);
      });
    
    static getByStatus = asyncHandler(async (req, res) => {
        const { status } = req.params;
        const jobs = await JobService.fetchByStatus(status);
        return res.status(200).json(jobs);
    });
}