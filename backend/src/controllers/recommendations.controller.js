"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.embedAllJobs = void 0;
const Resume_1 = require("../models/Resume");
const JobPosting_1 = require("../models/JobPosting");
const embedding_service_1 = require("../services/embedding.service");
const errorHandler_1 = require("../middleware/errorHandler");
const ai_service_1 = require("../services/ai.service");

// In-memory cache for recommendations (userId -> { data, expiry })
const recommendationCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * GET /api/recommendations
 * Returns top N jobs ranked by cosine similarity to user's resume embedding.
 */
const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        // Check cache
        const cached = recommendationCache.get(userId);
        if (cached && cached.expiry > Date.now()) {
            return res.json({ success: true, data: cached.data.slice(0, limit), fromCache: true });
        }

        // Get user's primary resume with embedding
        const resume = await Resume_1.Resume.findOne({ userId, isPrimary: true }).select('+embedding');
        if (!resume) {
            throw new errorHandler_1.AppError('No primary resume found. Please upload a resume first.', 404);
        }

        // If resume isn't embedded yet, embed it now
        let resumeEmbedding = resume.embedding;
        if (!resumeEmbedding || resumeEmbedding.length === 0) {
            if (!resume.parsedText || resume.parsedText.trim().length < 50) {
                throw new errorHandler_1.AppError('Resume text is too short to generate recommendations.', 400);
            }
            console.log('[Recommendations] Generating resume embedding on-demand...');
            resumeEmbedding = await (0, embedding_service_1.generateEmbedding)(resume.parsedText);
            await Resume_1.Resume.updateOne({ _id: resume._id }, { $set: { embedding: resumeEmbedding, embeddedAt: new Date() } });
        }

        // Get all jobs with embeddings
        const jobs = await JobPosting_1.JobPosting.find({ isActive: true, embedding: { $exists: true, $ne: [] } })
            .select('+embedding')
            .lean();

        if (jobs.length === 0) {
            return res.json({ success: true, data: [], message: 'No job embeddings available yet. Run the embedding job first.' });
        }

        // Compute cosine similarity for each job
        const scored = jobs.map(job => ({
            ...job,
            similarityScore: (0, embedding_service_1.cosineSimilarity)(resumeEmbedding, job.embedding)
        }));

        // Sort by similarity descending
        scored.sort((a, b) => b.similarityScore - a.similarityScore);

        // Take top N, remove embedding from response
        const topJobs = scored.slice(0, limit).map(job => {
            const { embedding, ...rest } = job;
            return {
                ...rest,
                matchPercent: Math.round(job.similarityScore * 100)
            };
        });

        // Generate reasons for top 5 jobs in parallel (with error handling for API limits)
        if (resume.parsedText) {
            const top5 = topJobs.slice(0, 5);
            await Promise.all(top5.map(async (job) => {
                try {
                    job.matchReason = await (0, ai_service_1.generateMatchReason)(
                        resume.parsedText,
                        job.title,
                        (job.skills || []).join(', ')
                    );
                } catch (apiError) {
                    console.warn(`[Recommendations] AI reason generation failed for job ${job.title}:`, apiError.message);
                    job.matchReason = "Your profile skills align well with the requirements for this role.";
                }
            }));
        }

        // Cache results
        recommendationCache.set(userId, { data: topJobs, expiry: Date.now() + CACHE_TTL_MS });

        res.json({ success: true, data: topJobs });
    } catch (error) {
        next(error);
    }
};
exports.getRecommendations = getRecommendations;

/**
 * POST /api/recommendations/embed-jobs
 * Batch-embeds all jobs that don't have embeddings yet.
 * Admin/utility endpoint.
 */
const embedAllJobs = async (req, res, next) => {
    try {
        const batchSize = 5; // Process 5 at a time to avoid rate limits
        const delay = (ms) => new Promise(r => setTimeout(r, ms));

        const unembedded = await JobPosting_1.JobPosting.find({
            isActive: true,
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } },
                { embeddedAt: null }
            ]
        }).select('_id title description').lean();

        console.log(`[EmbedJobs] Found ${unembedded.length} jobs to embed`);
        
        let embedded = 0;
        let failed = 0;

        for (let i = 0; i < unembedded.length; i += batchSize) {
            const batch = unembedded.slice(i, i + batchSize);
            
            await Promise.all(batch.map(async (job) => {
                try {
                    const textToEmbed = `${job.title}. ${(job.description || '').substring(0, 8000)}`;
                    const embedding = await (0, embedding_service_1.generateEmbedding)(textToEmbed);
                    await JobPosting_1.JobPosting.updateOne({ _id: job._id }, { $set: { embedding, embeddedAt: new Date() } });
                    embedded++;
                } catch (err) {
                    console.warn(`[EmbedJobs] Failed for job ${job._id}:`, err.message);
                    failed++;
                }
            }));

            if (i + batchSize < unembedded.length) {
                await delay(1000); // Rate limit: wait 1s between batches
            }

            // Send progress every 50 jobs
            if ((i + batchSize) % 50 === 0) {
                console.log(`[EmbedJobs] Progress: ${Math.min(i + batchSize, unembedded.length)}/${unembedded.length}`);
            }
        }

        // Clear recommendation cache since embeddings changed
        recommendationCache.clear();

        res.json({
            success: true,
            message: `Embedding complete. ${embedded} embedded, ${failed} failed, out of ${unembedded.length} total.`,
            data: { embedded, failed, total: unembedded.length }
        });
    } catch (error) {
        next(error);
    }
};
exports.embedAllJobs = embedAllJobs;