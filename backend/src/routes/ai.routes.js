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

// Cover Letter
router.post('/cover-letter', rateLimiter_1.aiLimiter, ai_controller_1.generateCoverLetterHandler);

// Mock Interview
router.post('/mock-interview/start', ai_controller_1.startMockInterview);
router.post('/mock-interview/:sessionId/answer', ai_controller_1.submitAnswer);
router.get('/mock-interview/history', ai_controller_1.getMockHistory);

// Skill Gap Analytics
router.get('/skill-gaps', ai_controller_1.getSkillGaps);

// Chatbot
router.post('/chat', rateLimiter_1.aiLimiter, ai_controller_1.chat);

exports.default = router;
