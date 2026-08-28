"use strict";

function stripHtml(input) {
    if (!input) return '';
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchArbeitnowJobs(search = '', location = '', page = 1) {
    // Arbeitnow has page pagination. It doesn't strictly support advanced search, 
    // but it has a free, public endpoint. We'll fetch the page and filter locally if needed.
    const url = new URL(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
    
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Arbeitnow failed: ${res.statusText}`);
    }

    const payload = await res.json();
    let results = payload.data || [];

    // Local filtering since Arbeitnow API doesn't support search params directly
    if (search) {
        const s = search.toLowerCase();
        results = results.filter(r => 
            (r.title || '').toLowerCase().includes(s) || 
            (r.company_name || '').toLowerCase().includes(s) ||
            (r.tags || []).some(t => t.toLowerCase().includes(s))
        );
    }
    
    if (location) {
        const l = location.toLowerCase();
        results = results.filter(r => (r.location || '').toLowerCase().includes(l));
    }

    return results.map(r => {
        return {
            sourceJobId: String(r.slug),
            title: r.title || 'Untitled role',
            company: r.company_name || 'Unknown company',
            location: r.remote ? 'Remote' : (r.location || 'Unknown'),
            description: stripHtml(r.description),
            salaryRange: null, // Arbeitnow doesn't always provide salary cleanly
            jobType: r.job_types?.join(', ') || 'Full-time',
            postedAt: r.created_at ? new Date(r.created_at * 1000).toISOString() : null,
            applyUrl: r.url,
            source: 'Arbeitnow'
        };
    });
}

module.exports = { fetchArbeitnowJobs };
