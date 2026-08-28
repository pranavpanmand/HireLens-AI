"use strict";

function stripHtml(input) {
    if (!input) return '';
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchRemotiveJobs(search = '', location = '', page = 1) {
    // Remotive has a free public API for remote jobs.
    // They don't support page pagination, they return a lot of results.
    // We'll limit it by search.
    
    // To prevent giant payloads if there is no search, we might limit it.
    // Remotive allows `search` query.
    let endpoint = 'https://remotive.com/api/remote-jobs';
    if (search) {
        endpoint += `?search=${encodeURIComponent(search)}`;
    } else {
        // If no search, we fetch a specific category to avoid massive payload
        endpoint += `?category=software-dev&limit=50`; 
    }

    const url = new URL(endpoint);
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Remotive failed: ${res.statusText}`);
    }

    const payload = await res.json();
    let results = payload.jobs || [];

    if (location) {
        const l = location.toLowerCase();
        // remotive jobs are remote, but sometimes specific to a timezone or country
        results = results.filter(r => (r.candidate_required_location || '').toLowerCase().includes(l));
    }

    // Since Remotive doesn't paginate well, we simulate it by slicing the array.
    const limit = 20;
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);

    return paginatedResults.map(r => {
        return {
            sourceJobId: String(r.id),
            title: r.title || 'Untitled role',
            company: r.company_name || 'Unknown company',
            location: r.candidate_required_location ? `Remote (${r.candidate_required_location})` : 'Remote',
            description: stripHtml(r.description),
            salaryRange: r.salary || null,
            jobType: r.job_type ? r.job_type.replace('_', ' ') : 'Full-time',
            postedAt: r.publication_date || null,
            applyUrl: r.url,
            source: 'Remotive'
        };
    });
}

module.exports = { fetchRemotiveJobs };
