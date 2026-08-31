"use strict";

const axios = require("axios");

async function fetchJSearchJobs(query = '', location = '', page = 1) {
    if (!process.env.RAPIDAPI_KEY) {
        console.warn("[JSearch] No RAPIDAPI_KEY found, skipping JSearch aggregation.");
        return [];
    }

    try {
        const searchQuery = `${query} ${location}`.trim() || 'Software Engineer';
        const options = {
            method: 'GET',
            url: 'https://jsearch.p.rapidapi.com/search',
            params: {
                query: searchQuery,
                page: String(page),
                num_pages: '1'
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        const data = response.data;

        if (!data || !data.data || !Array.isArray(data.data)) {
            return [];
        }

        return data.data.map(job => ({
            source: 'JSearch',
            sourceJobId: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: `${job.job_city || ''} ${job.job_state || ''} ${job.job_country || ''}`.trim() || 'Remote',
            salaryRange: job.job_min_salary ? `$${job.job_min_salary} - $${job.job_max_salary}` : 'Competitive',
            jobType: job.job_employment_type || 'Full-time',
            description: job.job_description,
            applyUrl: job.job_apply_link,
            skills: []
        }));
    } catch (error) {
        console.error("JSearch API error:", error.message);
        return [];
    }
}

module.exports = { fetchJSearchJobs };
