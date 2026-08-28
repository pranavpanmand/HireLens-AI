"use strict";

const { fetchAdzunaJobs } = require('./adzuna.service');
const { fetchArbeitnowJobs } = require('./arbeitnow.service');
const { fetchRemotiveJobs } = require('./remotive.service');
const { ApiCall } = require('../models/ApiCall');
const { JobPosting } = require('../models/JobPosting');

async function aggregateJobs({ search = '', location = '', source = '', page = 1, limit = 10 }) {
    const providers = [];
    
    // Add providers based on source filter
    if (!source || source.toLowerCase() === 'all' || source.toLowerCase() === 'adzuna') {
        providers.push({ name: 'Adzuna', fetcher: fetchAdzunaJobs });
    }
    if (!source || source.toLowerCase() === 'all' || source.toLowerCase() === 'arbeitnow') {
        providers.push({ name: 'Arbeitnow', fetcher: fetchArbeitnowJobs });
    }
    if (!source || source.toLowerCase() === 'all' || source.toLowerCase() === 'remotive') {
        providers.push({ name: 'Remotive', fetcher: fetchRemotiveJobs });
    }

    const promises = providers.map(async p => {
        try {
            await ApiCall.create({ provider: p.name });
            const results = await p.fetcher(search, location, page);
            return results || [];
        } catch (error) {
            console.error(`Provider ${p.name} failed:`, error.message);
            return []; // Graceful degradation
        }
    });

    const resultsArray = await Promise.all(promises);
    let allJobs = resultsArray.flat();

    // Deduplicate internally before saving
    const seen = new Set();
    const deduplicated = [];

    for (const job of allJobs) {
        const uniqueId = job.sourceJobId || `${job.title}-${job.company}`.toLowerCase().replace(/\s+/g, '');
        if (!seen.has(uniqueId)) {
            seen.add(uniqueId);
            deduplicated.push(job);
        }
    }

    // Upsert into JobPosting collection to ensure they exist for GET /:id and Analyze Match
    if (deduplicated.length > 0) {
        const operations = deduplicated.map((r) => {
            return {
                updateOne: {
                    filter: { source: r.source, externalId: r.sourceJobId },
                    update: {
                        $set: {
                            title: String(r.title || 'Untitled role').slice(0, 200),
                            company: String(r.company || 'Unknown company'),
                            location: String(r.location || 'Remote'),
                            salaryRange: r.salaryRange || null,
                            jobType: r.jobType || 'Full-time',
                            description: String(r.description || ''),
                            applyUrl: r.applyUrl || null,
                            isActive: true,
                        },
                        $setOnInsert: {
                            skills: r.skills || [],
                            requirements: [],
                        }
                    },
                    upsert: true,
                }
            };
        });

        try {
            await JobPosting.bulkWrite(operations, { ordered: false });
        } catch (error) {
            console.error('Bulk write error:', error);
        }
    }

    // We do NOT return the in-memory deduplicated list directly anymore!
    // We return nothing, because jobs.controller will now fetch from DB using proper skip/limit pagination.
}

module.exports = { aggregateJobs };
