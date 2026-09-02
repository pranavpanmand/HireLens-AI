"use strict";
const cron = require("node-cron");
const { JobAlert } = require("../models/JobAlert");
const { JobPosting } = require("../models/JobPosting");
const { Resume } = require("../models/Resume");
const { sendEmail } = require("./email.service");
const { cosineSimilarity } = require("./embedding.service");

/**
 * Weekly Digest Cron
 * Runs every Monday at 9:00 AM
 */
cron.schedule("0 9 * * 1", async () => {
    console.log("[Cron] Running weekly Job Alerts digest...");
    try {
        const activeAlerts = await JobAlert.find({ isEnabled: true, frequency: 'weekly' }).populate('userId');
        
        // Fetch recent jobs (e.g., from the last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentJobs = await JobPosting.find({ createdAt: { $gte: sevenDaysAgo } }).lean();

        if (recentJobs.length === 0) return;

        for (const alert of activeAlerts) {
            const user = alert.userId;
            if (!user) continue;

            const resume = await Resume.findOne({ userId: user._id, isPrimary: true }).lean();
            if (!resume || !resume.embedding) continue;

            // Compute match scores
            const matches = recentJobs.map(job => {
                const score = job.embedding && job.embedding.length > 0 
                    ? cosineSimilarity(resume.embedding, job.embedding) * 100 
                    : 0;
                return { ...job, matchScore: Math.round(score) };
            }).filter(j => j.matchScore > 30); // only show reasonable matches

            if (matches.length === 0) continue;

            // Sort and take top 5
            matches.sort((a, b) => b.matchScore - a.matchScore);
            const topMatches = matches.slice(0, 5);

            const jobListHtml = topMatches.map(job => {
                const isStrongMatch = job.matchScore >= 80;
                let ctaHtml = `<a href="http://localhost:5173/jobs/${job._id}" style="color: #4F46E5;">View Job</a>`;
                
                if (isStrongMatch && job.applyUrl) {
                    ctaHtml = `<br/><span style="background-color:#f59e0b; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">✨ Great Match</span>
                    <br/><br/>
                    <i>This job is a strong match based on your resume. Apply now before it fills up:</i>
                    <br/>
                    <a href="${job.applyUrl}" style="display:inline-block; margin-top:8px; background-color:#f59e0b; color:white; text-decoration:none; padding:8px 16px; border-radius:6px; font-weight:bold;">Apply Now →</a>`;
                }

                return `
                <li style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <div style="font-size: 18px; font-weight: bold; color: #111827;">${job.title}</div>
                    <div style="color: #4b5563; margin-bottom: 8px;">${job.company} | ${job.location} | Match: ${job.matchScore}%</div>
                    ${ctaHtml}
                </li>`;
            }).join("");

            const html = `
                <h2>Your Weekly Job Matches</h2>
                <p>Hi ${user.fullName || 'there'}, here are some highly recommended opportunities based on your profile:</p>
                <ul style="list-style: none; padding: 0;">
                    ${jobListHtml}
                </ul>
                <hr/>
                <p style="font-size: 12px; color: gray;">
                    To stop receiving these emails, click here: 
                    <a href="http://localhost:5173/unsubscribe/${alert.unsubscribeToken}">Unsubscribe</a>
                </p>
            `;

            await sendEmail({
                to: user.email,
                subject: 'Your Weekly Career Compass Matches',
                text: 'You have new tailored job matches available on Career Compass AI.',
                html: html
            });

            alert.lastSentAt = new Date();
            await alert.save();
        }
        
        console.log(`[Cron] Finished sending weekly digests to ${activeAlerts.length} users.`);
    } catch (err) {
        console.error("[Cron] Error running weekly Job Alerts job:", err);
    }
});


/**
 * Daily Strong Match Alert
 * Runs every day at 12:00 PM (Noon)
 * Only alerts users if a job > 80% match is found AND they haven't received a daily alert today.
 */
cron.schedule("0 12 * * *", async () => {
    console.log("[Cron] Running daily Strong Match alerts...");
    try {
        const activeAlerts = await JobAlert.find({ isEnabled: true }).populate('userId');
        
        // Fetch jobs from the last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const recentJobs = await JobPosting.find({ createdAt: { $gte: oneDayAgo } }).lean();

        if (recentJobs.length === 0) return;

        for (const alert of activeAlerts) {
            const user = alert.userId;
            if (!user) continue;

            // Throttle: Max 1 per day
            if (alert.lastStrongMatchAlertSentAt) {
                const hoursSinceLastAlert = (new Date() - alert.lastStrongMatchAlertSentAt) / (1000 * 60 * 60);
                if (hoursSinceLastAlert < 20) { // Skip if we sent one in the last 20 hours
                    continue;
                }
            }

            const resume = await Resume.findOne({ userId: user._id, isPrimary: true }).lean();
            if (!resume || !resume.embedding) continue;

            // Find strong matches
            const strongMatches = recentJobs.map(job => {
                const score = job.embedding && job.embedding.length > 0 
                    ? cosineSimilarity(resume.embedding, job.embedding) * 100 
                    : 0;
                return { ...job, matchScore: Math.round(score) };
            }).filter(j => j.matchScore >= 80);

            if (strongMatches.length === 0) continue;

            // Sort and take top 3
            strongMatches.sort((a, b) => b.matchScore - a.matchScore);
            const topMatches = strongMatches.slice(0, 3);

            const jobListHtml = topMatches.map(job => `
                <li style="margin-bottom: 24px; padding: 16px; border: 2px solid #f59e0b; border-radius: 8px; background-color: #fffbeb;">
                    <div style="font-size: 18px; font-weight: bold; color: #111827;">${job.title}</div>
                    <div style="color: #4b5563; margin-bottom: 8px;">${job.company} | ${job.location} | Match: ${job.matchScore}%</div>
                    <span style="background-color:#f59e0b; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">✨ Great Match</span>
                    <br/><br/>
                    <i>This job is a strong match based on your resume. Apply now before it fills up:</i>
                    <br/>
                    <a href="${job.applyUrl}" style="display:inline-block; margin-top:8px; background-color:#f59e0b; color:white; text-decoration:none; padding:8px 16px; border-radius:6px; font-weight:bold;">Apply Now →</a>
                </li>
            `).join("");

            const html = `
                <h2>Urgent: Strong Job Matches Found! 🚀</h2>
                <p>Hi ${user.fullName || 'there'}, our AI just scanned today's new job postings and found roles that match your profile incredibly well (80%+ match).</p>
                <p>We recommend applying as soon as possible before these fill up:</p>
                <ul style="list-style: none; padding: 0;">
                    ${jobListHtml}
                </ul>
                <hr/>
                <p style="font-size: 12px; color: gray;">
                    To stop receiving these emails, click here: 
                    <a href="http://localhost:5173/unsubscribe/${alert.unsubscribeToken}">Unsubscribe</a>
                </p>
            `;

            await sendEmail({
                to: user.email,
                subject: '🔥 Strong Match Alert: Apply Now',
                text: 'We found high-match jobs for you. Apply now on Career Compass AI.',
                html: html
            });

            alert.lastStrongMatchAlertSentAt = new Date();
            await alert.save();
        }
        
        console.log(`[Cron] Finished sending Strong Match alerts.`);
    } catch (err) {
        console.error("[Cron] Error running Strong Match alerts:", err);
    }
});
