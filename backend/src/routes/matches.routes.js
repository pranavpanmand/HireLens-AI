"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matches_controller_1 = require("../controllers/matches.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.use((0, auth_1.requireRole)('student')); // Matches are for students comparing their resume to jobs
router.get('/', matches_controller_1.getMyMatches);
router.get('/job/:jobId', matches_controller_1.getMatchForJob);
const rateLimiter_1 = require("../middleware/rateLimiter");
router.post('/job/:jobId', rateLimiter_1.aiLimiter, matches_controller_1.generateMatch);
exports.default = router;
//# sourceMappingURL=matches.routes.js.map