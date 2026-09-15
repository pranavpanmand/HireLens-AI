"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyApplications = exports.updateApplicationStatus = exports.getJobApplicants = exports.applyForJob = void 0;

const Application_1 = require("../models/Application");
const JobPosting_1 = require("../models/JobPosting");
const Resume_1 = require("../models/Resume");
const { Message } = require("../models/Message");
const { StudentProfile } = require("../models/StudentProfile");
const { User } = require("../models/User");
const { sendEmail } = require("../services/email.service");
const errorHandler_1 = require("../middleware/errorHandler");

const applyForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const studentId = req.user.id;

        // Verify the job exists and is internal
        const job = await JobPosting_1.JobPosting.findById(jobId);
        if (!job) {
            throw new errorHandler_1.AppError('Job not found', 404);
        }
        if (job.applyUrl) {
            throw new errorHandler_1.AppError('This job requires external application', 400);
        }

        // Get the student's primary resume
        const resume = await Resume_1.Resume.findOne({ userId: studentId, isPrimary: true });
        if (!resume) {
            throw new errorHandler_1.AppError('Please upload and set a primary resume before applying', 400);
        }

        // Check if already applied
        const existingApplication = await Application_1.Application.findOne({ studentId, jobId });
        if (existingApplication) {
            throw new errorHandler_1.AppError('You have already applied for this job', 400);
        }

        // For now, match score is a placeholder. Ideally we'd call the AI service here
        // or compute cosine similarity between the job embedding and resume embedding.
        const matchScore = 75; 

        const application = await Application_1.Application.create({
            studentId,
            jobId,
            resumeId: resume._id,
            matchScore
        });

        res.status(201).json({
            success: true,
            data: application,
            message: 'Successfully applied for job'
        });
    } catch (error) {
        next(error);
    }
};
exports.applyForJob = applyForJob;

const getJobApplicants = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        // Verify recruiter owns this job
        const job = await JobPosting_1.JobPosting.findById(jobId);
        if (!job) {
            throw new errorHandler_1.AppError('Job not found', 404);
        }
        if (job.recruiterId.toString() !== req.user.id) {
            throw new errorHandler_1.AppError('Not authorized to view these applicants', 403);
        }

        const applicants = await Application_1.Application.find({ jobId })
            .populate('studentId', 'fullName email avatarUrl')
            .populate('resumeId', 'fileUrl parsedText')
            .sort({ matchScore: -1 })
            .lean();

        res.json({
            success: true,
            data: applicants
        });
    } catch (error) {
        next(error);
    }
};
exports.getJobApplicants = getJobApplicants;

const updateApplicationStatus = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { status, note } = req.body;

        const application = await Application_1.Application.findById(applicationId)
            .populate('jobId')
            .populate('studentId', 'email fullName');
            
        if (!application) {
            throw new errorHandler_1.AppError('Application not found', 404);
        }

        // Verify recruiter owns this job
        if (application.jobId.recruiterId.toString() !== req.user.id) {
            throw new errorHandler_1.AppError('Not authorized', 403);
        }

        application.status = status;
        await application.save();

        // Trigger automated status email
        const studentEmail = application.studentId.email;
        const studentName = application.studentId.fullName;
        const jobTitle = application.jobId.title;
        const company = application.jobId.company;
        const dashboardUrl = "http://localhost:5173/dashboard";

        let subject = `Update on your application for ${jobTitle} at ${company}`;
        let htmlBody = `<p>Hi ${studentName},</p>`;
        
        switch (status) {
            case 'shortlisted':
                subject = `Good News: You've been shortlisted for ${jobTitle} at ${company}!`;
                htmlBody += `<p>We're excited to let you know that your application for the <strong>${jobTitle}</strong> position has been shortlisted.</p>`;
                break;
            case 'interview_scheduled':
                subject = `Interview Scheduled: ${jobTitle} at ${company}`;
                htmlBody += `<p>Your interview for the <strong>${jobTitle}</strong> position has been scheduled. Please check your messages or calendar for details.</p>`;
                break;
            case 'offered':
                subject = `Congratulations! Job Offer for ${jobTitle} at ${company}`;
                htmlBody += `<p>Congratulations! We are thrilled to offer you the <strong>${jobTitle}</strong> position.</p>`;
                break;
            case 'rejected':
                subject = `Update on your application for ${jobTitle} at ${company}`;
                htmlBody += `<p>Thank you for your interest in the <strong>${jobTitle}</strong> position. While your background is impressive, we have decided to move forward with other candidates at this time.</p>`;
                break;
            case 'reviewed':
            default:
                htmlBody += `<p>Your application for the <strong>${jobTitle}</strong> position has been reviewed by the team and is currently moving forward in the process.</p>`;
                break;
        }

        if (note && note.trim().length > 0) {
            htmlBody += `<div style="margin: 20px 0; padding: 15px; border-left: 4px solid #4F46E5; background-color: #f9fafb;">
                <strong>Note from the Recruiter:</strong><br/>
                <em>"${note}"</em>
            </div>`;
        }

        htmlBody += `<p>You can track all your applications on your <a href="${dashboardUrl}">dashboard</a>.</p>
        <p>Best regards,<br/>The ${company} Team</p>`;

        // Send email silently without blocking response
        sendEmail({
            to: studentEmail,
            subject,
            html: htmlBody,
            text: `Your application status for ${jobTitle} at ${company} is now ${status}.`
        }).catch(err => console.error("Failed to send status update email:", err));

        res.json({
            success: true,
            data: application,
            message: 'Status updated successfully'
        });
    } catch (error) {
        next(error);
    }
};
exports.updateApplicationStatus = updateApplicationStatus;

const sendMessage = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { subject, body } = req.body;
        const recruiterId = req.user.id;

        const application = await Application_1.Application.findById(applicationId)
            .populate('jobId')
            .populate('studentId', 'email fullName');

        if (!application) {
            throw new errorHandler_1.AppError('Application not found', 404);
        }

        if (application.jobId.recruiterId.toString() !== recruiterId) {
            throw new errorHandler_1.AppError('Not authorized', 403);
        }

        const student = application.studentId;
        const job = application.jobId;

        // Save message to DB
        const message = await Message.create({
            recruiterId,
            studentId: student._id,
            applicationId,
            subject,
            body
        });

        // Send actual email
        const htmlBody = `
            <h2>New Message regarding your application for ${job.title}</h2>
            <p>Hi ${student.fullName},</p>
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; white-space: pre-wrap;">${body}</div>
            <p>Best regards,<br/>${job.company}</p>
        `;

        await sendEmail({
            to: student.email,
            subject: `[${job.company}] ${subject}`,
            html: htmlBody,
            text: body
        });

        res.status(201).json({
            success: true,
            data: message,
            message: 'Message sent successfully'
        });
    } catch (error) {
        next(error);
    }
};
exports.sendMessage = sendMessage;

const getMessages = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const messages = await Message.find({ applicationId }).sort({ sentAt: -1 }).lean();
        
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};
exports.getMessages = getMessages;

const getApplicantProfile = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        
        const application = await Application_1.Application.findById(applicationId)
            .populate('jobId')
            .populate('studentId', 'fullName email phone avatarUrl');
            
        if (!application) {
            throw new errorHandler_1.AppError('Application not found', 404);
        }

        // Verify recruiter owns this job
        if (application.jobId.recruiterId.toString() !== req.user.id) {
            throw new errorHandler_1.AppError('Not authorized', 403);
        }

        const studentProfile = await StudentProfile.findOne({ userId: application.studentId._id }).lean();
        const resume = await Resume_1.Resume.findById(application.resumeId).lean();

        if (studentProfile && studentProfile.visibility === 'private') {
            // Mask profile data
            return res.json({
                success: true,
                data: {
                    user: application.studentId,
                    application: {
                        status: application.status,
                        matchScore: application.matchScore,
                        createdAt: application.createdAt
                    },
                    resume: {
                        fileUrl: resume?.fileUrl
                    },
                    isPrivate: true,
                    message: 'Candidate has set their profile to private. You can only view basic info and their resume.'
                }
            });
        }

        res.json({
            success: true,
            data: {
                user: application.studentId,
                profile: studentProfile,
                application: {
                    status: application.status,
                    matchScore: application.matchScore,
                    createdAt: application.createdAt
                },
                resume: resume,
                isPrivate: false
            }
        });
    } catch (error) {
        next(error);
    }
};
exports.getApplicantProfile = getApplicantProfile;

const getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application_1.Application.find({ studentId: req.user.id })
            .populate('jobId', 'title company location salaryRange')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        next(error);
    }
};
exports.getMyApplications = getMyApplications;
