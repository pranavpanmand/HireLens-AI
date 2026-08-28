"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    role: zod_1.z.enum(['student', 'recruiter']),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
router.post('/register', (0, validate_1.validate)(registerSchema), auth_controller_1.register);
router.post('/login', (0, validate_1.validate)(loginSchema), auth_controller_1.login);
router.post('/logout', auth_1.requireAuth, auth_controller_1.logout);
router.get('/me', auth_1.requireAuth, auth_controller_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map