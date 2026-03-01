const asyncHandler = require('express-async-handler');
const JobService = require('@services/job.service');
const { isValidJobStatus, isValidJobRoleType, normalizeJobStatus, normalizeJobRoleType } = require('@constants/jobOptions');

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
        if (!isValidJobStatus(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: OPEN, CLOSED, Opening Soon` });
        }
        const jobs = await JobService.fetchByStatus(normalizeJobStatus(status));
        return res.status(200).json(jobs);
    });

    static getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const job = await JobService.fetchById(id);
        return res.status(200).json(job);
    });

    static getByRoleType = asyncHandler(async (req, res) => {
        const { roleType } = req.params;
        if (!isValidJobRoleType(roleType)) {
            return res.status(400).json({ error: `Invalid role type. Must be one of: Consulting, Education, Events, Finance, HR, IT, Marketing / Media, Other, Partnerships / Sponsorships, Subcommittee` });
        }
        const jobs = await JobService.fetchByRoleType(normalizeJobRoleType(roleType));
        return res.status(200).json(jobs);
    });
}