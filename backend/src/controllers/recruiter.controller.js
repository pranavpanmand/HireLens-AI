"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.updateJob = exports.createJob = exports.getMyJobs = void 0;
const JobPosting_1 = require("../models/JobPosting");
const errorHandler_1 = require("../middleware/errorHandler");
const getMyJobs = async (req, res, next) => {
    try {
        const jobs = await JobPosting_1.JobPosting.find({ recruiterId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: jobs });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyJobs = getMyJobs;
const createJob = async (req, res, next) => {
    try {
        const { title, company, location, salaryRange, jobType, description, requirements, skills } = req.body;
        const newJob = await JobPosting_1.JobPosting.create({
            recruiterId: req.user.id,
            title,
            company,
            location,
            salaryRange,
            jobType,
            description,
            requirements: requirements || [],
            skills: skills || [],
            source: 'internal', // Mark as internally created
            isActive: true,
        });
        res.status(201).json({ success: true, data: newJob });
    }
    catch (error) {
        next(error);
    }
};
exports.createJob = createJob;
const updateJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const job = await JobPosting_1.JobPosting.findOneAndUpdate({ _id: id, recruiterId: req.user.id }, { $set: updateData }, { new: true, runValidators: true });
        if (!job) {
            throw new errorHandler_1.AppError('Job not found or unauthorized', 404);
        }
        res.json({ success: true, data: job });
    }
    catch (error) {
        next(error);
    }
};
exports.updateJob = updateJob;
const deleteJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const job = await JobPosting_1.JobPosting.findOneAndDelete({ _id: id, recruiterId: req.user.id });
        if (!job) {
            throw new errorHandler_1.AppError('Job not found or unauthorized', 404);
        }
        res.json({ success: true, message: 'Job deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteJob = deleteJob;
//# sourceMappingURL=recruiter.controller.js.map