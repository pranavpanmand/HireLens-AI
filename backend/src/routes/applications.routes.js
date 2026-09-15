"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const applications_controller_1 = require("../controllers/applications.controller");

const router = (0, express_1.Router)();

// Apply for a job (Student only)
router.post('/job/:jobId', auth_1.requireAuth, (0, auth_1.requireRole)('student'), applications_controller_1.applyForJob);

// Get my applications (Student only)
router.get('/my', auth_1.requireAuth, (0, auth_1.requireRole)('student'), applications_controller_1.getMyApplications);

// Get applicants for a job (Recruiter only)
router.get('/job/:jobId', auth_1.requireAuth, (0, auth_1.requireRole)('recruiter'), applications_controller_1.getJobApplicants);

// Update application status (Recruiter only)
router.put('/:applicationId/status', auth_1.requireAuth, (0, auth_1.requireRole)('recruiter'), applications_controller_1.updateApplicationStatus);

// Get applicant profile (Recruiter only)
router.get('/:applicationId/profile', auth_1.requireAuth, (0, auth_1.requireRole)('recruiter'), applications_controller_1.getApplicantProfile);

// Send message to applicant (Recruiter only)
router.post('/:applicationId/message', auth_1.requireAuth, (0, auth_1.requireRole)('recruiter'), applications_controller_1.sendMessage);

// Get message history for application (Recruiter only)
router.get('/:applicationId/messages', auth_1.requireAuth, (0, auth_1.requireRole)('recruiter'), applications_controller_1.getMessages);

exports.default = router;
