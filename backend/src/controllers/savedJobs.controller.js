"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSavedStatus = exports.unsaveJob = exports.saveJob = exports.getSavedJobs = void 0;
const SavedJob_1 = require("../models/SavedJob");
const errorHandler_1 = require("../middleware/errorHandler");
const getSavedJobs = async (req, res, next) => {
    try {
        const savedJobs = await SavedJob_1.SavedJob.find({ userId: req.user.id })
            .populate('jobId')
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            success: true,
            data: savedJobs.map(sj => sj.jobId),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSavedJobs = getSavedJobs;
const saveJob = async (req, res, next) => {
    try {
        const { jobId } = req.body;
        if (!jobId) {
            throw new errorHandler_1.AppError('Job ID is required', 400);
        }
        // Rely on MongoDB compound index to prevent duplicates
        await SavedJob_1.SavedJob.create({
            userId: req.user.id,
            jobId,
        });
        res.status(201).json({ success: true, message: 'Job saved successfully' });
    }
    catch (error) {
        if (error.code === 11000) {
            next(new errorHandler_1.AppError('Job is already saved', 400));
            return;
        }
        next(error);
    }
};
exports.saveJob = saveJob;
const unsaveJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const result = await SavedJob_1.SavedJob.findOneAndDelete({
            userId: req.user.id,
            jobId,
        });
        if (!result) {
            throw new errorHandler_1.AppError('Saved job not found', 404);
        }
        res.json({ success: true, message: 'Job removed from saved list' });
    }
    catch (error) {
        next(error);
    }
};
exports.unsaveJob = unsaveJob;
const checkSavedStatus = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const saved = await SavedJob_1.SavedJob.exists({
            userId: req.user.id,
            jobId,
        });
        res.json({ success: true, data: { isSaved: !!saved } });
    }
    catch (error) {
        next(error);
    }
};
exports.checkSavedStatus = checkSavedStatus;
//# sourceMappingURL=savedJobs.controller.js.map