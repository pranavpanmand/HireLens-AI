"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecruiterStats = exports.deleteJob = exports.updateJob = exports.createJob = exports.getMyJobs = void 0;
const JobPosting_1 = require("../models/JobPosting");
const Application_1 = require("../models/Application");
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
        const { title, company, location, salaryRange, jobType, workMode, experienceLevel, description, requirements, skills, applyUrl, deadline } = req.body;
        const newJob = await JobPosting_1.JobPosting.create({
            recruiterId: req.user.id,
            title,
            company,
            location,
            salaryRange,
            jobType,
            workMode: workMode || null,
            experienceLevel: experienceLevel || null,
            description,
            requirements: requirements || [],
            skills: skills || [],
            applyUrl: applyUrl || null,
            source: 'internal',
            isActive: true,
            postedAt: new Date(),
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

const getRecruiterStats = async (req, res, next) => {
    try {
        const jobs = await JobPosting_1.JobPosting.find({ recruiterId: req.user.id }).select('_id isActive').lean();
        const jobIds = jobs.map(j => j._id);
        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(j => j.isActive).length;

        const applications = await Application_1.Application.find({ jobId: { $in: jobIds } }).lean();
        const totalApplicants = applications.length;
        const avgMatchScore = totalApplicants > 0
            ? Math.round(applications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / totalApplicants)
            : 0;

        // Per-job breakdown
        const perJob = {};
        applications.forEach(app => {
            const jid = app.jobId.toString();
            if (!perJob[jid]) perJob[jid] = { count: 0, totalScore: 0 };
            perJob[jid].count++;
            perJob[jid].totalScore += app.matchScore || 0;
        });

        res.json({
            success: true,
            data: { totalJobs, activeJobs, totalApplicants, avgMatchScore, perJob }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecruiterStats = getRecruiterStats;