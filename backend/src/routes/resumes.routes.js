"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const resumes_controller_1 = require("../controllers/resumes.controller");
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new errorHandler_1.AppError('Only PDF files are allowed', 400));
        }
    },
});
router.use(auth_1.requireAuth);
router.use((0, auth_1.requireRole)('student')); // Only students can upload resumes
router.post('/upload', upload.single('resume'), resumes_controller_1.uploadResume);
router.get('/', resumes_controller_1.getMyResumes);
router.get('/:id', resumes_controller_1.getResumeById);
router.delete('/:id', resumes_controller_1.deleteResume);
router.put('/:id/primary', resumes_controller_1.setPrimaryResume);
exports.default = router;
//# sourceMappingURL=resumes.routes.js.map