"use strict";
const { env } = require("../config/env");

function stripHtml(input) {
    if (!input) return '';
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchAdzunaJobs(search = 'software developer', location = '', page = 1) {
    if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
        throw new Error('Adzuna credentials are not configured');
    }

    const sanitizedWhat = search.slice(0, 120);
    const sanitizedWhere = location.slice(0, 120);
    const country = 'in'; // Default to India, or make configurable

    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`);
    url.searchParams.set('app_id', env.ADZUNA_APP_ID);
    url.searchParams.set('app_key', env.ADZUNA_APP_KEY);
    url.searchParams.set('results_per_page', '20');
    url.searchParams.set('what', sanitizedWhat);
    url.searchParams.set('content-type', 'application/json');
    
    if (sanitizedWhere) {
        url.searchParams.set('where', sanitizedWhere);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Adzuna failed: ${res.statusText}`);
    }

    const payload = await res.json();
    const results = payload.results || [];

    return results.map(r => {
        const min = r.salary_min ? Math.round(r.salary_min) : null;
        const max = r.salary_max ? Math.round(r.salary_max) : null;
        return {
            sourceJobId: String(r.id),
            title: r.title || 'Untitled role',
            company: r.company?.display_name || 'Unknown company',
            location: r.location?.display_name || 'Remote',
            description: stripHtml(r.description),
            salaryRange: min && max ? `${min} - ${max}` : min ? `${min}+` : null,
            jobType: r.contract_time === 'part_time' ? 'Part-time' : 'Full-time',
            postedAt: r.created || null,
            applyUrl: r.redirect_url,
            source: 'Adzuna'
        };
    });
}

module.exports = { fetchAdzunaJobs };