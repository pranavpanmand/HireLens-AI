"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");

const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);

// Resume Analyzer
router.post('/resume/analyze', rateLimiter_1.aiLimiter, ai_controller_1.analyzeResumeHandler);

// Tailored Resume Generator
router.post('/resume/generate-tailored', rateLimiter_1.aiLimiter, ai_controller_1.generateTailoredResumeHandler);

// Cover Letter
router.post('/cover-letter', rateLimiter_1.aiLimiter, ai_controller_1.generateCoverLetterHandler);

// LinkedIn Optimizer
router.post('/linkedin-optimize', rateLimiter_1.aiLimiter, ai_controller_1.generateLinkedInProfileHandler);

// Networking Message Generator
router.post('/networking-message', rateLimiter_1.aiLimiter, ai_controller_1.generateNetworkingMessageHandler);

// STAR Story Generator
router.post('/star-stories', rateLimiter_1.aiLimiter, ai_controller_1.generateStarStoriesHandler);

// Mock Interview
// NOTE: the literal '/history' and '/feedback' routes MUST stay above the
// '/:sessionId' route, otherwise Express would match them as a session id.
router.get('/mock-interview/history', ai_controller_1.getMockHistory);
router.post('/mock-interview/feedback', ai_controller_1.saveInterviewFeedback);
router.post('/mock-interview/start', rateLimiter_1.aiLimiter, ai_controller_1.startMockInterview);
router.post('/mock-interview/:sessionId/answer', rateLimiter_1.aiLimiter, ai_controller_1.submitAnswer);
router.post('/mock-interview/:sessionId/finish', rateLimiter_1.aiLimiter, ai_controller_1.finishInterview);
router.get('/mock-interview/:sessionId', ai_controller_1.getInterviewReport);

// Skill Gap Analytics
router.get('/skill-gaps', ai_controller_1.getSkillGaps);

// Chatbot
router.post('/chat', rateLimiter_1.aiLimiter, ai_controller_1.chat);

exports.default = router;
