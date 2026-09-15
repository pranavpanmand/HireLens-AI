"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const mongoose_1 = require("mongoose");

const applicationSchema = new mongoose_1.Schema({
  studentId: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
  },
  resumeId: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  matchScore: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'shortlisted', 'interview_scheduled', 'offered', 'rejected'],
    default: 'applied',
  },
}, {
  timestamps: true,
});

// Prevent duplicate applications
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

exports.Application = mongoose_1.model('Application', applicationSchema);
