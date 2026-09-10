"use strict";
const mongoose = require("mongoose");

const coverLetterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPosting',
        required: false
    },
    coverLetter: {
        type: String,
        required: true
    },
    matchedSkills: [{ type: String }],
    keyHighlights: [{ type: String }]
}, {
    timestamps: true
});

// Ensure a user can only have one cover letter per job
coverLetterSchema.index({ userId: 1, jobId: 1 }, { unique: true });

exports.CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);
