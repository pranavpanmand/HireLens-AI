"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_1 = require("../middleware/auth");

const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);

// Resume Analyzer
router.post('/resume/analyze', ai_controller_1.analyzeResumeHandler);

// Cover Letter
router.post('/cover-letter', ai_controller_1.generateCoverLetterHandler);

// Mock Interview
router.post('/mock-interview/start', ai_controller_1.startMockInterview);
router.post('/mock-interview/:sessionId/answer', ai_controller_1.submitAnswer);
router.get('/mock-interview/history', ai_controller_1.getMockHistory);

// Skill Gap Analytics
router.get('/skill-gaps', ai_controller_1.getSkillGaps);

// Chatbot
router.post('/chat', ai_controller_1.chat);

exports.default = router;
