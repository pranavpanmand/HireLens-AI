"use strict";
const cron = require("node-cron");
const { JobAlert } = require("../models/JobAlert");
const { JobPosting } = require("../models/JobPosting");
const { sendEmail } = require("./email.service");

// Run every Monday at 9:00 AM
cron.schedule("0 9 * * 1", async () => {
    console.log("[Cron] Running weekly Job Alerts job...");
    try {
        const activeAlerts = await JobAlert.find({ isEnabled: true }).populate('userId');
        
        // In a real scenario, we would use embeddings to find tailored matches per user.
        // For simplicity in this demo, we'll fetch the latest 5 jobs.
        const recentJobs = await JobPosting.find().sort({ createdAt: -1 }).limit(5).lean();

        if (recentJobs.length === 0) return;

        for (const alert of activeAlerts) {
            const user = alert.userId;
            if (!user) continue;

            const jobListHtml = recentJobs.map(job => 
                `<li>
                    <strong>${job.title}</strong> at ${job.company}<br/>
                    ${job.location} | ${job.salaryRange || 'Competitive'}<br/>
                    <a href="http://localhost:5173/jobs/${job._id}">View Job</a>
                </li>`
            ).join("");

            const html = `
                <h2>Your Weekly Job Matches</h2>
                <p>Hi ${user.fullName || 'there'}, here are some new opportunities that might interest you:</p>
                <ul>
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
                text: 'You have new job matches available on Career Compass AI.',
                html: html
            });

            alert.lastSentAt = new Date();
            await alert.save();
        }
        
        console.log(`[Cron] Finished sending alerts to ${activeAlerts.length} users.`);
    } catch (err) {
        console.error("[Cron] Error running Job Alerts job:", err);
    }
});
