const mongoose = require('mongoose');
const { env } = require('./src/config/env');
const { User } = require('./src/models/User');
const { JobPosting } = require('./src/models/JobPosting');
const { Resume } = require('./src/models/Resume');
const { MatchAnalysis } = require('./src/models/MatchAnalysis');
const { analyzeMatch } = require('./src/services/ai.service');

async function testMatchFinal() {
    await mongoose.connect(env.MONGODB_URI);
    try {
        console.log("1. Finding a job...");
        const job = await JobPosting.findOne({});
        console.log(`Found Job: ${job.title} at ${job.company}`);

        console.log("2. Setting up dummy resume...");
        const resumeText = "Experienced software engineer with 5 years of React, Node.js, and MongoDB experience. Built scalable web applications.";
        
        console.log("3. Calling Gemini analyzeMatch...");
        const result = await analyzeMatch(resumeText, job.description);
        
        console.log("\n✅ AI ANALYSIS SUCCESSFUL!");
        console.log("Match Score:", result.matchScore);
        console.log("Summary:", result.summary);
        console.log("Missing Skills:", result.missingSkills);
    } catch (err) {
        console.error("❌ ERROR:", err);
    }
    await mongoose.disconnect();
}
testMatchFinal();
