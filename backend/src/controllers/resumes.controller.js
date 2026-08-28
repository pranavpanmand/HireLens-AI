"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrimaryResume = exports.deleteResume = exports.getResumeById = exports.getMyResumes = exports.uploadResume = void 0;
const Resume_1 = require("../models/Resume");
const resume_service_1 = require("../services/resume.service");
const errorHandler_1 = require("../middleware/errorHandler");
const promises_1 = __importDefault(require("fs/promises"));
const cloudinary_service_1 = require("../services/cloudinary.service");
const embedding_service_1 = require("../services/embedding.service");
const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new errorHandler_1.AppError('No file uploaded', 400);
        }
        const file = req.file;
        const userId = req.user.id;
        
        // Parse the PDF from memory buffer
        const parsedText = await (0, resume_service_1.parsePdfResume)(file.buffer);
        const skills = (0, resume_service_1.extractSkillsSimple)(parsedText);
        
        // Upload to Cloudinary
        const cloudinaryResult = await (0, cloudinary_service_1.uploadToCloudinary)(file.buffer, `resumes/${userId}`, 'raw');
        
        // If this is the user's first resume, make it primary
        const existingCount = await Resume_1.Resume.countDocuments({ userId });
        const isPrimary = existingCount === 0;
        
        const resume = await Resume_1.Resume.create({
            userId,
            fileName: file.originalname,
            originalName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            cloudinaryUrl: cloudinaryResult.secure_url,
            publicId: cloudinaryResult.public_id,
            parsedText,
            skillsExtracted: skills,
            isPrimary,
        });
        
        // Generate embedding in background (don't block the response)
        if (parsedText && parsedText.trim().length > 50) {
            (0, embedding_service_1.generateEmbedding)(parsedText).then(async (embedding) => {
                await Resume_1.Resume.updateOne({ _id: resume._id }, { $set: { embedding, embeddedAt: new Date() } });
                console.log(`[Resume] Embedded resume ${resume._id}`);
            }).catch(err => {
                console.warn(`[Resume] Embedding failed for ${resume._id}:`, err.message);
            });
        }
        
        res.status(201).json({ success: true, data: resume });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadResume = uploadResume;
const getMyResumes = async (req, res, next) => {
    try {
        const resumes = await Resume_1.Resume.find({ userId: req.user.id })
            .sort({ isPrimary: -1, createdAt: -1 })
            .select('-embedding -parsedText') // Don't send huge texts/vectors by default
            .lean();
        res.json({ success: true, data: resumes });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyResumes = getMyResumes;
const getResumeById = async (req, res, next) => {
    try {
        const resume = await Resume_1.Resume.findOne({ _id: req.params.id, userId: req.user.id }).lean();
        if (!resume) {
            throw new errorHandler_1.AppError('Resume not found', 404);
        }
        res.json({ success: true, data: resume });
    }
    catch (error) {
        next(error);
    }
};
exports.getResumeById = getResumeById;
const deleteResume = async (req, res, next) => {
    try {
        const resume = await Resume_1.Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!resume) {
            throw new errorHandler_1.AppError('Resume not found', 404);
        }
        
        // Delete the actual file from Cloudinary if it exists
        if (resume.publicId) {
            await (0, cloudinary_service_1.deleteFromCloudinary)(resume.publicId, 'raw').catch(console.error);
        } else if (resume.filePath) {
            // Fallback for legacy local files
            await promises_1.default.unlink(resume.filePath).catch(console.error);
        }
        
        // If it was primary and they have other resumes, make the newest one primary
        if (resume.isPrimary) {
            const nextLatest = await Resume_1.Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
            if (nextLatest) {
                nextLatest.isPrimary = true;
                await nextLatest.save();
            }
        }
        res.json({ success: true, message: 'Resume deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteResume = deleteResume;
const setPrimaryResume = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Verify it exists and belongs to user
        const resume = await Resume_1.Resume.findOne({ _id: id, userId });
        if (!resume) {
            throw new errorHandler_1.AppError('Resume not found', 404);
        }
        // Remove primary flag from all others
        await Resume_1.Resume.updateMany({ userId }, { $set: { isPrimary: false } });
        // Set this one as primary
        resume.isPrimary = true;
        await resume.save();
        res.json({ success: true, message: 'Primary resume updated', data: resume });
    }
    catch (error) {
        next(error);
    }
};
exports.setPrimaryResume = setPrimaryResume;
//# sourceMappingURL=resumes.controller.js.map