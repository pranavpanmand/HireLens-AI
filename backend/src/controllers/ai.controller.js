"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.getMockHistory = exports.submitAnswer = exports.startMockInterview = exports.generateCoverLetterHandler = exports.analyzeResumeHandler = exports.getSkillGaps = exports.generateLinkedInProfileHandler = exports.generateNetworkingMessageHandler = exports.generateStarStoriesHandler = void 0;
const Resume_1 = require("../models/Resume");
const JobPosting_1 = require("../models/JobPosting");
const MatchAnalysis_1 = require("../models/MatchAnalysis");
const StudentProfile_1 = require("../models/StudentProfile");
const User_1 = require("../models/User");
const ai_service_1 = require("../services/ai.service");
const errorHandler_1 = require("../middleware/errorHandler");
const mongoose = require("mongoose");

const { MockInterviewSession } = require("../models/MockInterviewSession");
const { CoverLetter } = require("../models/CoverLetter");

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
        const { jobId, jobTitle, company, jobDescription, resumeId, customAchievements } = req.body;

        let resume;
        if (resumeId) {
            resume = await Resume_1.Resume.findOne({ _id: resumeId, userId });
        }
        if (!resume) {
            resume = await Resume_1.Resume.findOne({ userId, isPrimary: true });
        }
        if (!resume) {
            resume = await Resume_1.Resume.findOne({ userId });
        }

        if (!resume || !resume.parsedText) {
            throw new errorHandler_1.AppError('No resume found. Please upload a resume first.', 404);
        }

        let targetTitle = jobTitle;
        let targetCompany = company;
        let targetDescription = jobDescription;

        if (jobId) {
            const job = await JobPosting_1.JobPosting.findById(jobId).lean();
            if (job) {
                targetTitle = targetTitle || job.title;
                targetCompany = targetCompany || job.company;
                targetDescription = targetDescription || job.description;

                // Check if one already exists for this jobId
                let existingCL = await CoverLetter.findOne({ userId, jobId });
                if (existingCL) {
                    return res.json({ success: true, data: existingCL });
                }
            }
        }

        if (!targetTitle || !targetCompany) {
            throw new errorHandler_1.AppError('Job Title and Company are required', 400);
        }

        let fullResumeText = resume.parsedText;
        if (customAchievements && customAchievements.trim()) {
            fullResumeText += `\n\nKey Achievements & Highlights:\n${customAchievements}`;
        }

        const result = await (0, ai_service_1.generateCoverLetter)(
            fullResumeText, 
            targetDescription || `${targetTitle} position at ${targetCompany}`, 
            targetTitle, 
            targetCompany
        );
        
        // Save to DB
        const coverLetter = await CoverLetter.create({
            userId,
            jobId: jobId || null,
            coverLetter: result.coverLetter,
            matchedSkills: result.matchedSkills || [],
            keyHighlights: result.keyHighlights || []
        });

        res.json({ success: true, data: coverLetter });
    } catch (error) {
        next(error);
    }
};
exports.generateCoverLetterHandler = generateCoverLetterHandler;

// ========================= LINKEDIN OPTIMIZER =========================
const generateLinkedInProfileHandler = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { resumeId } = req.body;

        let resume;
        if (resumeId) {
            resume = await Resume_1.Resume.findOne({ _id: resumeId, userId });
        } else {
            resume = await Resume_1.Resume.findOne({ userId, isPrimary: true });
            if (!resume) resume = await Resume_1.Resume.findOne({ userId });
        }

        if (!resume || !resume.parsedText || resume.parsedText.trim().length < 50) {
            throw new errorHandler_1.AppError('No valid resume found. Please upload a resume first to optimize your LinkedIn.', 404);
        }

        const optimizedProfile = await (0, ai_service_1.generateLinkedInOptimization)(resume.parsedText);
        res.json({ success: true, data: optimizedProfile });
    } catch (error) {
        next(error);
    }
};
exports.generateLinkedInProfileHandler = generateLinkedInProfileHandler;

// ========================= NETWORKING MESSAGE GENERATOR =========================
const generateNetworkingMessageHandler = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { resumeId, targetRole, targetCompany, recipientName, messageType } = req.body;

        if (!targetRole || !targetCompany || !messageType) {
            throw new errorHandler_1.AppError('Target role, company, and message type are required', 400);
        }

        let resume;
        if (resumeId) {
            resume = await Resume_1.Resume.findOne({ _id: resumeId, userId });
        } else {
            resume = await Resume_1.Resume.findOne({ userId, isPrimary: true });
            if (!resume) resume = await Resume_1.Resume.findOne({ userId });
        }

        if (!resume || !resume.parsedText || resume.parsedText.trim().length < 50) {
            throw new errorHandler_1.AppError('No valid resume found. Please upload a resume first.', 404);
        }

        const messageData = await (0, ai_service_1.generateNetworkingMessage)(
            resume.parsedText,
            targetRole,
            targetCompany,
            recipientName,
            messageType
        );
        
        res.json({ success: true, data: messageData });
    } catch (error) {
        next(error);
    }
};
exports.generateNetworkingMessageHandler = generateNetworkingMessageHandler;

// ========================= STAR STORY GENERATOR =========================
const generateStarStoriesHandler = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { resumeId, targetRole } = req.body;

        let resume;
        if (resumeId) {
            resume = await Resume_1.Resume.findOne({ _id: resumeId, userId });
        } else {
            resume = await Resume_1.Resume.findOne({ userId, isPrimary: true });
            if (!resume) resume = await Resume_1.Resume.findOne({ userId });
        }

        if (!resume || !resume.parsedText || resume.parsedText.trim().length < 50) {
            throw new errorHandler_1.AppError('No valid resume found. Please upload a resume first.', 404);
        }

        const starStories = await (0, ai_service_1.generateStarStories)(resume.parsedText, targetRole);
        res.json({ success: true, data: starStories });
    } catch (error) {
        next(error);
    }
};
exports.generateStarStoriesHandler = generateStarStoriesHandler;

// ========================= MOCK INTERVIEW =========================
const startMockInterview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { jobId, jobTitle, company, jobDescription } = req.body;

        let title = jobTitle || "Target Position";
        let companyName = company || "Target Company";
        let description = jobDescription || "General Technical & Behavioral Interview";
        let validJobId = null;

        if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
            const job = await JobPosting_1.JobPosting.findById(jobId).lean();
            if (job) {
                title = job.title;
                companyName = job.company;
                description = job.description;
                validJobId = job._id;
            }
        }

        const { questions } = await (0, ai_service_1.generateMockQuestions)(description, title);

        const session = await MockInterviewSession.create({
            userId,
            jobId: validJobId,
            jobTitle: title,
            company: companyName,
            questions: questions.map(q => ({
                question: q.question,
                category: q.category,
                difficulty: q.difficulty,
                tips: q.tips
            })),
            answers: []
        });

        res.json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};
exports.startMockInterview = startMockInterview;

const submitAnswer = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { questionIndex, answer } = req.body;

        const session = await MockInterviewSession.findById(sessionId);
        if (!session) throw new errorHandler_1.AppError('Session not found', 404);
        if (session.userId.toString() !== req.user.id) throw new errorHandler_1.AppError('Unauthorized', 403);
        if (questionIndex < 0 || questionIndex >= session.questions.length) {
            throw new errorHandler_1.AppError('Invalid question index', 400);
        }

        const job = await JobPosting_1.JobPosting.findById(session.jobId).lean();
        const question = session.questions[questionIndex].question;

        const evaluation = await (0, ai_service_1.evaluateAnswer)(question, answer, job?.description || '');

        const answerObj = { questionIndex, userAnswer: answer, ...evaluation };
        
        // Ensure answers array is big enough and update
        if (!session.answers) session.answers = [];
        const currentAnswerIndex = session.answers.findIndex(a => a.questionIndex === questionIndex);
        if (currentAnswerIndex !== -1) {
             session.answers[currentAnswerIndex] = answerObj;
        } else {
             session.answers.push(answerObj);
        }

        // Calculate overall score if all questions answered
        const answeredCount = session.answers.length;
        if (answeredCount === session.questions.length) {
            session.overallScore = Math.round(
                session.answers.reduce((sum, a) => sum + (a?.score || 0), 0) / session.questions.length
            );
        }
        await session.save();

        res.json({ success: true, data: { evaluation, answeredCount, totalQuestions: session.questions.length } });
    } catch (error) {
        next(error);
    }
};
exports.submitAnswer = submitAnswer;

const getMockHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const dbSessions = await MockInterviewSession.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
            
        const sessions = dbSessions.map(session => ({
            id: session._id,
            jobTitle: session.jobTitle,
            company: session.company,
            questionsCount: session.questions.length,
            answeredCount: session.answers.length,
            overallScore: session.overallScore || null,
            createdAt: session.createdAt
        }));
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

        const response = await (0, ai_service_1.chatWithAI)(message, userContext, conversationHistory, req.body.file);
        res.json({ success: true, data: { response } });
    } catch (error) {
        next(error);
    }
};
exports.chat = chat;
