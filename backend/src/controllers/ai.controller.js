"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.getMockHistory = exports.submitAnswer = exports.startMockInterview = exports.generateCoverLetterHandler = exports.analyzeResumeHandler = exports.getSkillGaps = void 0;
const Resume_1 = require("../models/Resume");
const JobPosting_1 = require("../models/JobPosting");
const MatchAnalysis_1 = require("../models/MatchAnalysis");
const StudentProfile_1 = require("../models/StudentProfile");
const User_1 = require("../models/User");
const ai_service_1 = require("../services/ai.service");
const errorHandler_1 = require("../middleware/errorHandler");
const mongoose = require("mongoose");

// ---- In-memory store for mock interviews (could be a collection later) ----
const mockSessions = new Map();

// ========================= RESUME ANALYZER =========================
const analyzeResumeHandler = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const resume = await Resume_1.Resume.findOne({ userId, isPrimary: true });
        if (!resume || !resume.parsedText || resume.parsedText.trim().length < 50) {
            throw new errorHandler_1.AppError('No primary resume with sufficient text found. Upload a resume first.', 404);
        }

        const analysis = await (0, ai_service_1.analyzeResume)(resume.parsedText);
        res.json({ success: true, data: analysis });
    } catch (error) {
        next(error);
    }
};
exports.analyzeResumeHandler = analyzeResumeHandler;

// ========================= COVER LETTER =========================
const generateCoverLetterHandler = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { jobId } = req.body;
        if (!jobId) throw new errorHandler_1.AppError('jobId is required', 400);

        const [resume, job] = await Promise.all([
            Resume_1.Resume.findOne({ userId, isPrimary: true }),
            JobPosting_1.JobPosting.findById(jobId).lean()
        ]);

        if (!resume || !resume.parsedText) throw new errorHandler_1.AppError('No resume found', 404);
        if (!job) throw new errorHandler_1.AppError('Job not found', 404);

        const result = await (0, ai_service_1.generateCoverLetter)(
            resume.parsedText, job.description, job.title, job.company
        );
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
exports.generateCoverLetterHandler = generateCoverLetterHandler;

// ========================= MOCK INTERVIEW =========================
const startMockInterview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { jobId } = req.body;
        if (!jobId) throw new errorHandler_1.AppError('jobId is required', 400);

        const job = await JobPosting_1.JobPosting.findById(jobId).lean();
        if (!job) throw new errorHandler_1.AppError('Job not found', 404);

        const { questions } = await (0, ai_service_1.generateMockQuestions)(job.description, job.title);

        const sessionId = new mongoose.Types.ObjectId().toString();
        const session = {
            id: sessionId,
            userId,
            jobId,
            jobTitle: job.title,
            company: job.company,
            questions,
            answers: [],
            createdAt: new Date()
        };
        mockSessions.set(sessionId, session);

        res.json({ success: true, data: { sessionId, questions } });
    } catch (error) {
        next(error);
    }
};
exports.startMockInterview = startMockInterview;

const submitAnswer = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { questionIndex, answer } = req.body;

        const session = mockSessions.get(sessionId);
        if (!session) throw new errorHandler_1.AppError('Session not found', 404);
        if (session.userId !== req.user.id) throw new errorHandler_1.AppError('Unauthorized', 403);
        if (questionIndex < 0 || questionIndex >= session.questions.length) {
            throw new errorHandler_1.AppError('Invalid question index', 400);
        }

        const job = await JobPosting_1.JobPosting.findById(session.jobId).lean();
        const question = session.questions[questionIndex].question;

        const evaluation = await (0, ai_service_1.evaluateAnswer)(question, answer, job?.description || '');

        session.answers[questionIndex] = { questionIndex, userAnswer: answer, ...evaluation };

        // Calculate overall score if all questions answered
        const answeredCount = session.answers.filter(Boolean).length;
        if (answeredCount === session.questions.length) {
            session.overallScore = Math.round(
                session.answers.reduce((sum, a) => sum + (a?.score || 0), 0) / session.questions.length
            );
        }

        res.json({ success: true, data: { evaluation, answeredCount, totalQuestions: session.questions.length } });
    } catch (error) {
        next(error);
    }
};
exports.submitAnswer = submitAnswer;

const getMockHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const sessions = [];
        for (const [id, session] of mockSessions) {
            if (session.userId === userId) {
                sessions.push({
                    id,
                    jobTitle: session.jobTitle,
                    company: session.company,
                    questionsCount: session.questions.length,
                    answeredCount: session.answers.filter(Boolean).length,
                    overallScore: session.overallScore || null,
                    createdAt: session.createdAt
                });
            }
        }
        sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ success: true, data: sessions });
    } catch (error) {
        next(error);
    }
};
exports.getMockHistory = getMockHistory;

// ========================= SKILL GAP ANALYTICS =========================
const getSkillGaps = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const gaps = await MatchAnalysis_1.MatchAnalysis.aggregate([
            { $match: { userId: userObjectId } },
            { $unwind: "$missingSkills" },
            { $group: { _id: "$missingSkills", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 },
            { $project: { _id: 0, skill: "$_id", count: 1 } }
        ]);

        res.json({ success: true, data: gaps });
    } catch (error) {
        next(error);
    }
};
exports.getSkillGaps = getSkillGaps;

// ========================= AI CHATBOT =========================
const chat = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { message, conversationHistory = [] } = req.body;
        if (!message) throw new errorHandler_1.AppError('Message is required', 400);

        // Gather user context
        const [user, profile, resume] = await Promise.all([
            User_1.User.findById(userId).lean(),
            StudentProfile_1.StudentProfile.findOne({ userId }).lean(),
            Resume_1.Resume.findOne({ userId, isPrimary: true }).select('parsedText skillsExtracted').lean()
        ]);

        const userContext = {
            fullName: user?.fullName,
            skills: profile?.skills || resume?.skillsExtracted || [],
            education: profile?.education?.map(e => `${e.degree} in ${e.fieldOfStudy} from ${e.institution}`).join('; ') || '',
            careerPreferences: profile?.careerPreferences || {},
            resumeSummary: resume?.parsedText?.substring(0, 2000) || ''
        };

        const response = await (0, ai_service_1.chatWithAI)(message, userContext, conversationHistory);
        res.json({ success: true, data: { response } });
    } catch (error) {
        next(error);
    }
};
exports.chat = chat;
