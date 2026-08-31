"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentProfile = void 0;
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: String, required: true },
    endYear: { type: String }, // can be empty if currently studying
    cgpaOrPercentage: { type: String },
    isCurrent: { type: Boolean, default: false }
});

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    technologies: [{ type: String }],
    githubUrl: { type: String },
    liveUrl: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    imageUrl: { type: String }
});

const experienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String },
    workMode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'] },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String },
    skillsUsed: [{ type: String }]
});

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    credentialId: { type: String },
    credentialUrl: { type: String }
});

const studentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Sub-documents / Arrays
    summary: { type: String },
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    skills: [{ type: String }], // Array of strings e.g. ["React", "Node.js"]
    languages: [{
        language: { type: String },
        proficiency: { type: String, enum: ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'] }
    }],
    achievements: [{
        title: { type: String },
        description: { type: String },
        date: { type: Date }
    }],
    // Competitive Programming links
    codingProfiles: {
        github: { type: String },
        leetcode: { type: String },
        codeforces: { type: String },
        codechef: { type: String },
        hackerrank: { type: String }
    },
    // Other links
    portfolioUrl: { type: String },
    linkedinUrl: { type: String },
    
    // Career Preferences
    careerPreferences: {
        roles: [{ type: String }],
        locations: [{ type: String }],
        workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site', 'Any'] },
        jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'] },
        expectedSalary: { type: String },
        availability: { type: String }
    }
}, {
    timestamps: true
});

exports.StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
