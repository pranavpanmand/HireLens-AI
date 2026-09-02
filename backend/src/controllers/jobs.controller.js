"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchExternal = exports.getJobById = exports.getJobs = void 0;
const JobPosting_1 = require("../models/JobPosting");
const adzuna_service_1 = require("../services/adzuna.service");
const errorHandler_1 = require("../middleware/errorHandler");
const { aggregateJobs } = require('../services/jobsAggregator.service');

/**
 * Normalize work mode strings from various providers into standard values.
 */
function normalizeWorkMode(raw) {
    if (!raw) return null;
    const lower = raw.toLowerCase().trim();
    if (['remote', 'fully remote', 'work from home', 'wfh', 'telecommute'].some(v => lower.includes(v))) return 'Remote';
    if (['hybrid', 'flexible'].some(v => lower.includes(v))) return 'Hybrid';
    if (['on-site', 'onsite', 'office', 'in-office', 'on site'].some(v => lower.includes(v))) return 'On-site';
    return null;
}

/**
 * Normalize job type strings into standard values.
 */
function normalizeJobType(raw) {
    if (!raw) return 'Full-time';
    const lower = raw.toLowerCase().trim();
    if (lower.includes('intern')) return 'Internship';
    if (lower.includes('part') && lower.includes('time')) return 'Part-time';
    if (lower.includes('contract') || lower.includes('freelance')) return 'Contract';
    if (lower.includes('temporary') || lower.includes('temp')) return 'Temporary';
    return 'Full-time';
}

const getJobs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50); // cap at 50
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const location = req.query.location || '';
        const source = req.query.source || '';
        const workMode = req.query.workMode || '';
        const jobType = req.query.jobType || '';
        const experienceLevel = req.query.experienceLevel || '';
        const minSalary = req.query.minSalary ? parseInt(req.query.minSalary) : null;
        const maxSalary = req.query.maxSalary ? parseInt(req.query.maxSalary) : null;
        const skills = req.query.skills ? req.query.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        const postedWithin = req.query.postedWithin || '';
        const sort = req.query.sort || 'recent';

        // Dynamically fetch and upsert to MongoDB first, to keep DB fresh
        // Wrapped in a 5-second timeout so it doesn't block the request if external APIs hang
        await Promise.race([
            aggregateJobs({ search, location, source, page, limit }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('External APIs timeout')), 5000))
        ]).catch(err => {
            console.warn('[JobsController] aggregateJobs failed or timed out (non-blocking):', err.message);
        });

        // Build MongoDB filter
        const filter = { isActive: true };
        
        // Source filter
        if (source && source.toLowerCase() !== 'all') {
            filter.source = new RegExp(`^${source}$`, 'i');
        }

        // Text search across title, company, description
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { title: { $regex: escaped, $options: 'i' } },
                { company: { $regex: escaped, $options: 'i' } },
                { description: { $regex: escaped, $options: 'i' } },
            ];
        }

        // Location filter — case-insensitive partial match
        if (location && location.toLowerCase() !== 'all') {
            const escaped = location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.location = { $regex: escaped, $options: 'i' };
        }

        // Work mode filter
        if (workMode && workMode.toLowerCase() !== 'all') {
            const normalized = normalizeWorkMode(workMode);
            if (normalized) {
                // Also match location-based remote (many jobs have "Remote" in location field)
                if (normalized === 'Remote') {
                    filter.$and = filter.$and || [];
                    filter.$and.push({
                        $or: [
                            { workMode: 'Remote' },
                            { location: { $regex: 'remote', $options: 'i' } }
                        ]
                    });
                } else {
                    filter.workMode = normalized;
                }
            }
        }

        // Job type filter
        if (jobType && jobType.toLowerCase() !== 'all') {
            const normalized = normalizeJobType(jobType);
            filter.jobType = new RegExp(`^${normalized}$`, 'i');
        }

        // Experience level filter
        if (experienceLevel && experienceLevel.toLowerCase() !== 'all') {
            filter.experienceLevel = new RegExp(experienceLevel, 'i');
        }

        // Salary range filter — only restrict jobs that HAVE salary data
        if (minSalary !== null || maxSalary !== null) {
            const salaryFilter = {};
            if (minSalary !== null) salaryFilter.$gte = minSalary;
            if (maxSalary !== null) salaryFilter.$lte = maxSalary;
            // Show jobs with matching salary OR jobs with no salary data (don't exclude unknowns)
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { salaryMin: salaryFilter },
                    { salaryMin: null, salaryMax: null } // keep jobs with unknown salary visible
                ]
            });
        }

        // Skills filter — match ANY of the provided skills
        if (skills.length > 0) {
            const skillRegexes = skills.map(s => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
            filter.skills = { $in: skillRegexes };
        }

        // Posted within filter
        if (postedWithin) {
            let cutoff;
            const now = new Date();
            switch (postedWithin) {
                case '24h': cutoff = new Date(now - 24 * 60 * 60 * 1000); break;
                case '3d': cutoff = new Date(now - 3 * 24 * 60 * 60 * 1000); break;
                case '7d': cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000); break;
                case '30d': cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000); break;
            }
            if (cutoff) {
                filter.$and = filter.$and || [];
                filter.$and.push({
                    $or: [
                        { postedAt: { $gte: cutoff } },
                        { createdAt: { $gte: cutoff } } // fallback if postedAt is null
                    ]
                });
            }
        }

        // Build sort option
        let sortOption;
        switch (sort) {
            case 'salary_desc': sortOption = { salaryMax: -1, createdAt: -1 }; break;
            case 'salary_asc': sortOption = { salaryMin: 1, createdAt: -1 }; break;
            case 'relevance': sortOption = search ? { score: { $meta: 'textScore' } } : { createdAt: -1 }; break;
            case 'recent':
            default: sortOption = { postedAt: -1, createdAt: -1 }; break;
        }
        // text score sort only works with $text query, fall back for regex
        if (sort === 'relevance' && !filter.$text) {
            sortOption = { createdAt: -1 };
        }

        // Fetch paginated results natively from MongoDB
        const [jobs, total] = await Promise.all([
            JobPosting_1.JobPosting.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean(),
            JobPosting_1.JobPosting.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            },
        });
    } catch (error) {
        console.error('[JobsController] Error fetching jobs:', error);
        next(error);
    }
};
exports.getJobs = getJobs;

const getJobById = async (req, res, next) => {
    try {
        const job = await JobPosting_1.JobPosting.findById(req.params.id).lean();
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        res.json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

exports.getJobById = getJobById;
const fetchExternal = async (req, res, next) => {
    try {
        const what = req.query.what || 'software engineer';
        const where = req.query.where || '';
        const country = req.query.country || 'in';
        const result = await (0, adzuna_service_1.fetchExternalJobs)(what, where, country);
        res.json({
            success: true,
            message: `Fetched ${result.fetched} jobs (${result.fromCache ? 'cached' : 'live'})`,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchExternal = fetchExternal;