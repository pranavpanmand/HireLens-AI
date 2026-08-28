"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyApplications = exports.updateApplicationStatus = exports.getJobApplicants = exports.applyForJob = void 0;

const Application_1 = require("../models/Application");
const JobPosting_1 = require("../models/JobPosting");
const Resume_1 = require("../models/Resume");
const errorHandler_1 = require("../middleware/errorHandler");

const applyForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const studentId = req.user.id;

        // Verify the job exists and is internal
        const job = await JobPosting_1.JobPosting.findById(jobId);
        if (!job) {
            throw new errorHandler_1.AppError('Job not found', 404);
        }
        if (job.applyUrl) {
            throw new errorHandler_1.AppError('This job requires external application', 400);
        }

        // Get the student's primary resume
        const resume = await Resume_1.Resume.findOne({ userId: studentId, isPrimary: true });
        if (!resume) {
            throw new errorHandler_1.AppError('Please upload and set a primary resume before applying', 400);
        }

        // Check if already applied
        const existingApplication = await Application_1.Application.findOne({ studentId, jobId });
        if (existingApplication) {
            throw new errorHandler_1.AppError('You have already applied for this job', 400);
        }

        // For now, match score is a placeholder. Ideally we'd call the AI service here
        // or compute cosine similarity between the job embedding and resume embedding.
        const matchScore = 75; 

        const application = await Application_1.Application.create({
            studentId,
            jobId,
            resumeId: resume._id,
            matchScore
        });

        res.status(201).json({
            success: true,
            data: application,
            message: 'Successfully applied for job'
        });
    } catch (error) {
        next(error);
    }
};
exports.applyForJob = applyForJob;

const getJobApplicants = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        // Verify recruiter owns this job
        const job = await JobPosting_1.JobPosting.findById(jobId);
        if (!job) {
            throw new errorHandler_1.AppError('Job not found', 404);
        }
        if (job.recruiterId.toString() !== req.user.id) {
            throw new errorHandler_1.AppError('Not authorized to view these applicants', 403);
        }

        const applicants = await Application_1.Application.find({ jobId })
            .populate('studentId', 'fullName email avatarUrl')
            .populate('resumeId', 'fileUrl parsedText')
            .sort({ matchScore: -1 })
            .lean();

        res.json({
            success: true,
            data: applicants
        });
    } catch (error) {
        next(error);
    }
};
exports.getJobApplicants = getJobApplicants;

const updateApplicationStatus = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        const application = await Application_1.Application.findById(applicationId).populate('jobId');
        if (!application) {
            throw new errorHandler_1.AppError('Application not found', 404);
        }

        // Verify recruiter owns this job
        if (application.jobId.recruiterId.toString() !== req.user.id) {
            throw new errorHandler_1.AppError('Not authorized', 403);
        }

        application.status = status;
        await application.save();

        res.json({
            success: true,
            data: application,
            message: 'Status updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
exports.updateApplicationStatus = updateApplicationStatus;

const getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application_1.Application.find({ studentId: req.user.id })
            .populate('jobId', 'title company location salaryRange')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        next(error);
    }
};
exports.getMyApplications = getMyApplications;
