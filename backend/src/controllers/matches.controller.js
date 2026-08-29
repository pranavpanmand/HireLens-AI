"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMatch = exports.getMatchForJob = exports.getMyMatches = void 0;
const MatchAnalysis_1 = require("../models/MatchAnalysis");
const Resume_1 = require("../models/Resume");
const JobPosting_1 = require("../models/JobPosting");
const ai_service_1 = require("../services/ai.service");
const errorHandler_1 = require("../middleware/errorHandler");
const getMyMatches = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const matches = await MatchAnalysis_1.MatchAnalysis.find({ userId: req.user.id })
            .populate('jobId')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        res.json({ success: true, data: matches });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyMatches = getMyMatches;
const getMatchForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;
        // We only care about the match for the user's PRIMARY resume against this job
        const primaryResume = await Resume_1.Resume.findOne({ userId, isPrimary: true }).lean();
        if (!primaryResume) {
            res.json({ success: true, data: null, message: 'No primary resume found' });
            return;
        }
        const match = await MatchAnalysis_1.MatchAnalysis.findOne({
            userId,
            resumeId: primaryResume._id,
            jobId,
        }).lean();
        if (match) {
            res.json({ success: true, data: { ...match, resumeText: primaryResume.parsedText } });
        } else {
            res.json({ success: true, data: null });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getMatchForJob = getMatchForJob;
const generateMatch = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;
        const [job, resume] = await Promise.all([
            JobPosting_1.JobPosting.findById(jobId).lean(),
            Resume_1.Resume.findOne({ userId, isPrimary: true }).lean(),
        ]);
        if (!job) {
            throw new errorHandler_1.AppError('Job not found', 404);
        }
        if (!resume || !resume.parsedText) {
            throw new errorHandler_1.AppError('Primary resume not found or has no parsed text', 400);
        }
        // Check if we already have it to avoid duplicate AI calls
        const existing = await MatchAnalysis_1.MatchAnalysis.findOne({
            userId,
            resumeId: resume._id,
            jobId: job._id,
        });
        if (existing) {
            res.json({ success: true, data: { ...existing, resumeText: resume.parsedText }, message: 'Returned cached match analysis' });
            return;
        }
        // Call Gemini
        const result = await (0, ai_service_1.analyzeMatch)(resume.parsedText, job.description);
        // Save to DB
        const newMatch = await MatchAnalysis_1.MatchAnalysis.create({
            userId,
            resumeId: resume._id,
            jobId: job._id,
            matchScore: result.matchScore,
            scoreBreakdown: result.scoreBreakdown,
            matchedSkills: result.matchedSkills || [],
            missingSkills: result.missingSkills || [],
            learningPath: result.learningPath || [],
            summary: result.summary,
        });
        res.status(201).json({ success: true, data: { ...newMatch.toObject(), resumeText: resume.parsedText } });
    }
    catch (error) {
        if (error.code === 11000) {
            // Race condition: another request just created it
            const existing = await MatchAnalysis_1.MatchAnalysis.findOne({
                userId: req.user.id,
                jobId: req.params.jobId,
            });
            const resume = await Resume_1.Resume.findOne({ userId: req.user.id, isPrimary: true }).lean();
            res.json({ success: true, data: { ...existing?.toObject(), resumeText: resume?.parsedText } });
            return;
        }
        next(error);
    }
};
exports.generateMatch = generateMatch;
//# sourceMappingURL=matches.controller.js.map