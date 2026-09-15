"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHiringStats = exports.getMatchTrend = exports.getInterviewTrend = exports.getSkillGapAnalytics = void 0;
const MatchAnalysis_1 = require("../models/MatchAnalysis");
const { MockInterviewSession } = require("../models/MockInterviewSession");
const { Application } = require("../models/Application");
const { JobPosting } = require("../models/JobPosting");
const errorHandler_1 = require("../middleware/errorHandler");

const getSkillGapAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const pipeline = [
            { $match: { userId: userId } },
            { $unwind: "$missingSkills" },
            { $group: { _id: "$missingSkills", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 },
            { $project: { _id: 0, skill: "$_id", count: 1 } }
        ];
        const skillGaps = await MatchAnalysis_1.MatchAnalysis.aggregate(pipeline);
        res.json({ success: true, data: skillGaps });
    }
    catch (error) {
        next(error);
    }
};
exports.getSkillGapAnalytics = getSkillGapAnalytics;

const getInterviewTrend = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Fetch completed interviews sorted by date
        const sessions = await MockInterviewSession.find({ userId, status: 'completed' })
            .sort({ completedAt: 1 })
            .select('completedAt overallScore summary.categoryScores interviewType')
            .lean();
            
        // Map to format suitable for Recharts
        const data = sessions.map((s, index) => ({
            sessionNum: `Session ${index + 1}`,
            date: s.completedAt ? s.completedAt.toISOString().split('T')[0] : 'Unknown',
            overallScore: s.overallScore || 0,
            technical: s.summary?.categoryScores?.technical || 0,
            communication: s.summary?.categoryScores?.communication || 0,
            confidence: s.summary?.categoryScores?.confidence || 0,
            clarity: s.summary?.categoryScores?.clarity || 0,
            interviewType: s.interviewType
        }));
        
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
exports.getInterviewTrend = getInterviewTrend;

const getMatchTrend = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Match score trend over time
        const analyses = await MatchAnalysis_1.MatchAnalysis.find({ userId })
            .sort({ createdAt: 1 })
            .select('createdAt matchScore jobTitle')
            .lean();
            
        const trendData = analyses.map(a => ({
            date: a.createdAt.toISOString().split('T')[0],
            score: a.matchScore,
            jobTitle: a.jobTitle
        }));

        // Application status funnel
        const appPipeline = [
            { $match: { studentId: req.user._id || req.user.id } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ];
        
        const appsRaw = await Application.aggregate(appPipeline);
        
        // Map to specific order for funnel
        const funnelOrder = ['applied', 'reviewed', 'shortlisted', 'interview_scheduled', 'offered', 'rejected'];
        const appsData = funnelOrder.map(status => {
            const found = appsRaw.find(a => a._id === status);
            return {
                status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                count: found ? found.count : 0
            };
        });

        res.json({ 
            success: true, 
            data: {
                trend: trendData,
                applications: appsData
            } 
        });
    } catch (error) {
        next(error);
    }
};
exports.getMatchTrend = getMatchTrend;

const getHiringStats = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;
        
        // 1. Get all jobs for this recruiter
        const jobs = await JobPosting.find({ recruiterId }).select('_id title').lean();
        const jobIds = jobs.map(j => j._id);
        
        // 2. Apps over time
        const timePipeline = [
            { $match: { jobId: { $in: jobIds } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { "_id": 1 } },
            { $project: { _id: 0, date: "$_id", applications: "$count" } }
        ];
        
        // 3. Applicants per job and avg match score
        const jobPipeline = [
            { $match: { jobId: { $in: jobIds } } },
            { $group: {
                _id: "$jobId",
                applicantCount: { $sum: 1 },
                avgMatchScore: { $avg: "$matchScore" }
            }}
        ];
        
        // 4. Funnel stats combined
        const funnelPipeline = [
            { $match: { jobId: { $in: jobIds } } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ];
        
        const [timeData, jobStats, funnelRaw] = await Promise.all([
            Application.aggregate(timePipeline),
            Application.aggregate(jobPipeline),
            Application.aggregate(funnelPipeline)
        ]);

        // Map jobStats to include titles
        const jobBreakdown = jobStats.map(stat => {
            const job = jobs.find(j => j._id.toString() === stat._id.toString());
            return {
                jobTitle: job ? job.title : 'Unknown Job',
                applicants: stat.applicantCount,
                avgScore: Math.round(stat.avgMatchScore)
            };
        }).sort((a,b) => b.applicants - a.applicants); // Sort by most applicants

        // Map funnel to ordered format
        const funnelOrder = ['applied', 'reviewed', 'shortlisted', 'interview_scheduled', 'offered', 'rejected'];
        const funnelData = funnelOrder.map(status => {
            const found = funnelRaw.find(f => f._id === status);
            return {
                stage: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                count: found ? found.count : 0
            };
        });
        
        res.json({
            success: true,
            data: {
                applicationsOverTime: timeData,
                jobsBreakdown: jobBreakdown,
                pipelineFunnel: funnelData
            }
        });
    } catch (error) {
        next(error);
    }
};
exports.getHiringStats = getHiringStats;
