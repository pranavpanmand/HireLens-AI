"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPosting = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const jobPostingSchema = new mongoose_1.Schema({
    recruiterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: 200,
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    salaryRange: {
        type: String,
        default: null,
    },
    salaryMin: {
        type: Number,
        default: null,
    },
    salaryMax: {
        type: Number,
        default: null,
    },
    jobType: {
        type: String,
        required: true,
        default: 'Full-time',
    },
    workMode: {
        type: String,
        enum: ['Remote', 'Hybrid', 'On-site', null],
        default: null,
    },
    experienceLevel: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
    },
    requirements: {
        type: [String],
        default: [],
    },
    skills: {
        type: [String],
        default: [],
    },
    applyUrl: {
        type: String,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    source: {
        type: String,
        default: 'internal',
    },
    externalId: {
        type: String,
        default: null,
    },
    postedAt: {
        type: Date,
        default: null,
    },
    embedding: {
        type: [Number],
        select: false, // Don't return large vector by default
    },
    embeddedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
// Compound unique index for deduplication of external jobs
jobPostingSchema.index({ source: 1, externalId: 1 }, { unique: true, partialFilterExpression: { externalId: { $ne: null } } });
// Performance indexes for common query patterns
jobPostingSchema.index({ isActive: 1, createdAt: -1 });
jobPostingSchema.index({ recruiterId: 1 });
// Advanced filter indexes
jobPostingSchema.index({ location: 1 });
jobPostingSchema.index({ workMode: 1 });
jobPostingSchema.index({ jobType: 1 });
jobPostingSchema.index({ postedAt: -1 });
jobPostingSchema.index({ source: 1 });
exports.JobPosting = mongoose_1.default.model('JobPosting', jobPostingSchema);
//# sourceMappingURL=JobPosting.js.map