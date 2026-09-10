"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.getMockHistory = exports.getInterviewReport = exports.finishInterview = exports.submitAnswer = exports.startMockInterview = exports.generateCoverLetterHandler = exports.analyzeResumeHandler = exports.getSkillGaps = exports.generateLinkedInProfileHandler = exports.generateNetworkingMessageHandler = exports.generateStarStoriesHandler = void 0;
const Resume_1 = require("../models/Resume");
const JobPosting_1 = require("../models/JobPosting");
const MatchAnalysis_1 = require("../models/MatchAnalysis");
const StudentProfile_1 = require("../models/StudentProfile");
const User_1 = require("../models/User");
const ai_service_1 = require("../services/ai.service");
const errorHandler_1 = require("../middleware/errorHandler");
const mongoose = require("mongoose");

const { MockInterviewSession } = require("../models/MockInterviewSession");
const { InterviewFeedback } = require("../models/InterviewFeedback");
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

// ========================= TAILORED RESUME GENERATOR =========================
const generateTailoredResumeHandler = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { jobId, jobTitle, company, jobDescription, resumeId } = req.body;

        let resume;
        if (resumeId) {
            resume = await Resume_1.Resume.findOne({ _id: resumeId, userId });
        } else {
            resume = await Resume_1.Resume.findOne({ userId, isPrimary: true });
            if (!resume) resume = await Resume_1.Resume.findOne({ userId });
        }

        if (!resume || !resume.parsedText) {
            throw new errorHandler_1.AppError('No resume found. Please upload a resume first.', 404);
        }

        let targetTitle = jobTitle;
        let targetCompany = company;
        let targetDescription = jobDescription;
        let validJobId = null;

        if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
            const job = await JobPosting_1.JobPosting.findById(jobId).lean();
            if (job) {
                targetTitle = targetTitle || job.title;
                targetCompany = targetCompany || job.company;
                targetDescription = targetDescription || job.description;
                validJobId = job._id;
            }
        }

        if (!targetTitle || !targetDescription) {
            throw new errorHandler_1.AppError('Job Title and Job Description are required', 400);
        }

        const result = await (0, ai_service_1.generateTailoredResume)(
            resume.parsedText, 
            targetDescription, 
            targetTitle, 
            targetCompany || 'Target Company'
        );
        
        // Save to DB
        const { GeneratedResume } = require("../models/GeneratedResume");
        const tailoredResume = await GeneratedResume.create({
            userId,
            jobId: validJobId,
            originalResumeId: resume._id,
            targetRole: targetTitle,
            targetCompany: targetCompany,
            content: result.content
        });

        res.json({ success: true, data: tailoredResume });
    } catch (error) {
        next(error);
    }
};
exports.generateTailoredResumeHandler = generateTailoredResumeHandler;

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

/** Shape a session document for the client (drops nothing the UI needs, adds progress). */
function serializeSession(session) {
    const doc = typeof session.toObject === 'function' ? session.toObject() : session;
    return {
        id: doc._id,
        jobId: doc.jobId || null,
        jobTitle: doc.jobTitle,
        company: doc.company,
        interviewType: doc.interviewType,
        difficulty: doc.difficulty,
        numberOfQuestions: doc.numberOfQuestions,
        source: doc.source,
        status: doc.status,
        questions: doc.questions || [],
        answers: doc.answers || [],
        overallScore: doc.overallScore ?? null,
        summary: doc.summary || null,
        startedAt: doc.startedAt,
        completedAt: doc.completedAt || null,
        createdAt: doc.createdAt,
    };
}

/** Average of a 0-10 field across answers, expressed 0-10. */
function averageOf(answers, field) {
    if (!answers.length) return 0;
    const total = answers.reduce((sum, a) => sum + (Number(a?.[field]) || 0), 0);
    return Math.round((total / answers.length) * 10) / 10;
}

const startMockInterview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { jobId, jobTitle, company, jobDescription, interviewType, difficulty, numberOfQuestions, source } = req.body;

        const count = Math.min(30, Math.max(1, Number(numberOfQuestions) || 5));

        let title = (jobTitle || '').trim() || 'Target Position';
        let companyName = (company || '').trim() || 'Target Company';
        let description = (jobDescription || '').trim();
        let validJobId = null;
        let resumeId = null;

        if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
            const job = await JobPosting_1.JobPosting.findById(jobId).lean();
            if (job) {
                title = job.title;
                companyName = job.company;
                description = job.description || description;
                validJobId = job._id;
            }
        }

        // source === 'Resume': ground the questions in the candidate's own resume.
        if (source === 'Resume') {
            const resume = await Resume_1.Resume.findOne({ userId, isPrimary: true })
                .select('parsedText')
                .lean();
            if (!resume || !resume.parsedText || resume.parsedText.trim().length < 50) {
                throw new errorHandler_1.AppError(
                    'No primary resume found. Upload a resume in Documents first, or pick a different question source.',
                    404
                );
            }
            resumeId = resume._id;
            description = `${description}\n\nCandidate Resume:\n${resume.parsedText.substring(0, 6000)}`.trim();
        }

        if (!description) {
            description = 'General Technical & Behavioral Interview';
        }

        const { questions } = await (0, ai_service_1.generateMockQuestions)(
            description, title, interviewType, difficulty, count
        );

        const session = await MockInterviewSession.create({
            userId,
            jobId: validJobId,
            jobTitle: title,
            company: companyName,
            // Snapshot the JD so evaluation never has to re-query JobPosting per answer.
            jobDescription: description.substring(0, 8000),
            interviewType: interviewType || 'Mixed',
            difficulty: difficulty || 'Mid-Level',
            numberOfQuestions: questions.length,
            source: source || 'General',
            resumeId,
            questions,
            answers: [],
            status: 'in_progress',
            startedAt: new Date(),
        });

        res.status(201).json({ success: true, data: serializeSession(session) });
    } catch (error) {
        next(error);
    }
};
exports.startMockInterview = startMockInterview;

const submitAnswer = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { questionIndex, answer, timeTaken } = req.body;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new errorHandler_1.AppError('Invalid session id', 400);
        }

        const session = await MockInterviewSession.findById(sessionId);
        if (!session) throw new errorHandler_1.AppError('Session not found', 404);
        if (session.userId.toString() !== req.user.id) throw new errorHandler_1.AppError('Unauthorized', 403);
        if (session.status === 'completed') {
            throw new errorHandler_1.AppError('This interview has already been submitted.', 409);
        }

        const idx = Number(questionIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx >= session.questions.length) {
            throw new errorHandler_1.AppError('Invalid question index', 400);
        }

        const question = session.questions[idx].question;
        // Uses the JD snapshot taken at start — no per-answer JobPosting lookup.
        const evaluation = await (0, ai_service_1.evaluateAnswer)(question, answer, session.jobDescription || '');

        const answerObj = {
            questionIndex: idx,
            userAnswer: (answer || '').trim(),
            score: evaluation.score,
            clarity: evaluation.clarity,
            relevance: evaluation.relevance,
            specificity: evaluation.specificity,
            confidence: evaluation.confidence,
            communication: evaluation.communication,
            correctness: evaluation.correctness,
            feedback: evaluation.feedback,
            sampleGoodAnswer: evaluation.improvedAnswer,
            timeTaken: Math.max(0, Number(timeTaken) || 0),
            skipped: Boolean(evaluation.skipped),
            answeredAt: new Date(),
        };

        if (!session.answers) session.answers = [];
        const existing = session.answers.findIndex(a => a.questionIndex === idx);
        if (existing !== -1) {
            session.answers[existing] = answerObj;
        } else {
            session.answers.push(answerObj);
        }

        await session.save();

        res.json({
            success: true,
            data: {
                evaluation: {
                    ...evaluation,
                    whatWentWell: evaluation.whatWentWell,
                    whatToImprove: evaluation.whatToImprove,
                },
                answeredCount: session.answers.length,
                totalQuestions: session.questions.length,
                isLastQuestion: idx === session.questions.length - 1,
            },
        });
    } catch (error) {
        next(error);
    }
};
exports.submitAnswer = submitAnswer;

/**
 * Finish an interview: fill in any unanswered questions as skipped, compute the
 * overall score out of 100, and generate the final report. Idempotent — calling
 * it twice returns the already-generated report instead of paying for Gemini again.
 */
const finishInterview = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new errorHandler_1.AppError('Invalid session id', 400);
        }

        const session = await MockInterviewSession.findById(sessionId);
        if (!session) throw new errorHandler_1.AppError('Session not found', 404);
        if (session.userId.toString() !== req.user.id) throw new errorHandler_1.AppError('Unauthorized', 403);

        if (session.status === 'completed' && session.summary && session.summary.narrative) {
            return res.json({ success: true, data: serializeSession(session) });
        }

        if (!session.answers) session.answers = [];

        // Any question the candidate ended the interview on counts as skipped, not missing.
        const answered = new Set(session.answers.map(a => a.questionIndex));
        session.questions.forEach((_q, i) => {
            if (!answered.has(i)) {
                session.answers.push({
                    questionIndex: i,
                    userAnswer: '',
                    score: 0, clarity: 0, relevance: 0, specificity: 0,
                    confidence: 0, communication: 0, correctness: 0,
                    feedback: 'This question was not answered.',
                    sampleGoodAnswer: '',
                    timeTaken: 0,
                    skipped: true,
                    answeredAt: new Date(),
                });
            }
        });
        session.answers.sort((a, b) => a.questionIndex - b.questionIndex);

        // Spec: overall score is out of 100.
        session.overallScore = Math.round(averageOf(session.answers, 'score') * 10);

        const transcript = session.answers.map(a => ({
            question: session.questions[a.questionIndex]?.question || '',
            category: session.questions[a.questionIndex]?.category || '',
            userAnswer: a.userAnswer,
            score: a.score,
            skipped: a.skipped,
        }));

        let summary;
        try {
            summary = await (0, ai_service_1.generateInterviewSummary)(transcript, session.jobDescription || session.company);
        } catch (aiError) {
            // The interview itself is still worth saving — fall back to scores we
            // already computed rather than losing the whole session to a 502.
            console.error('[finishInterview] Summary generation failed:', aiError.message);
            summary = {
                narrative: 'The detailed AI summary could not be generated this time, but your per-question scores below are saved. You can regenerate the report from Interview History.',
                categoryScores: {
                    technical: averageOf(session.answers, 'correctness'),
                    communication: averageOf(session.answers, 'communication'),
                    confidence: averageOf(session.answers, 'confidence'),
                    clarity: averageOf(session.answers, 'clarity'),
                },
                strengths: [],
                weaknesses: [],
                topImprovements: [],
                weakestAnswers: [],
            };
        }

        session.summary = summary;
        session.status = 'completed';
        session.completedAt = new Date();
        await session.save();

        res.json({ success: true, data: serializeSession(session) });
    } catch (error) {
        next(error);
    }
};
exports.finishInterview = finishInterview;

/** Full report/transcript for a single session. */
const getInterviewReport = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new errorHandler_1.AppError('Invalid session id', 400);
        }

        const session = await MockInterviewSession.findById(sessionId).lean();
        if (!session) throw new errorHandler_1.AppError('Session not found', 404);
        if (session.userId.toString() !== req.user.id) throw new errorHandler_1.AppError('Unauthorized', 403);

        res.json({ success: true, data: serializeSession(session) });
    } catch (error) {
        next(error);
    }
};
exports.getInterviewReport = getInterviewReport;

/**
 * Paginated history. Deliberately excludes the full questions/answers arrays —
 * the list only needs headline numbers, and the report endpoint serves detail.
 */
const getMockHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const filter = { userId };
        if (req.query.status && ['in_progress', 'completed', 'abandoned'].includes(req.query.status)) {
            filter.status = req.query.status;
        }

        const [dbSessions, total] = await Promise.all([
            MockInterviewSession.find(filter)
                .select('jobTitle company interviewType difficulty status overallScore createdAt completedAt questions answers summary.narrative')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            MockInterviewSession.countDocuments(filter),
        ]);

        const sessions = dbSessions.map(session => ({
            id: session._id,
            jobTitle: session.jobTitle,
            company: session.company,
            interviewType: session.interviewType,
            difficulty: session.difficulty,
            status: session.status || 'completed',
            questionsCount: session.questions?.length || 0,
            answeredCount: session.answers?.length || 0,
            overallScore: session.overallScore ?? null,
            narrative: session.summary?.narrative || null,
            createdAt: session.createdAt,
            completedAt: session.completedAt || null,
        }));

        res.json({
            success: true,
            data: {
                sessions,
                meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
            },
        });
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

// ========================= MOCK INTERVIEW FEEDBACK =========================
const FEEDBACK_RATINGS = ['Difficult', 'Okay', 'Good', 'Great'];
const FEEDBACK_GOALS = ['Confidence', 'Communication', 'Technical skills', 'Interview practice', 'Something else'];
const FEEDBACK_IMPROVEMENTS = ['Questions', 'Recording', 'Interview length', 'Feedback report', 'Technical issue'];

const saveInterviewFeedback = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { sessionId, rating, goals, improvements, comments } = req.body;

        if (!FEEDBACK_RATINGS.includes(rating)) {
            throw new errorHandler_1.AppError(`Rating must be one of: ${FEEDBACK_RATINGS.join(', ')}`, 400);
        }

        // Only accept a sessionId the caller actually owns.
        let validSessionId = null;
        if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
            const owned = await MockInterviewSession.exists({ _id: sessionId, userId });
            if (!owned) throw new errorHandler_1.AppError('Session not found', 404);
            validSessionId = sessionId;
        }

        const feedback = await InterviewFeedback.create({
            userId,
            sessionId: validSessionId,
            rating,
            goals: (Array.isArray(goals) ? goals : []).filter(g => FEEDBACK_GOALS.includes(g)),
            improvements: (Array.isArray(improvements) ? improvements : []).filter(i => FEEDBACK_IMPROVEMENTS.includes(i)),
            comments: typeof comments === 'string' ? comments.trim().substring(0, 2000) : '',
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        next(error);
    }
};
exports.saveInterviewFeedback = saveInterviewFeedback;
