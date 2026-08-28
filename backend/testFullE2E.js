const mongoose = require('mongoose');
const { env } = require('./src/config/env');
const { User } = require('./src/models/User');
const { JobPosting } = require('./src/models/JobPosting');
const { Resume } = require('./src/models/Resume');
const { MatchAnalysis } = require('./src/models/MatchAnalysis');
const { ApiCall } = require('./src/models/ApiCall');

async function testFullE2E() {
    console.log("=== CONNECTING TO DB ===");
    await mongoose.connect(env.MONGODB_URI);
    
    try {
        console.log("\n=== 1. DB JobPosting Count ===");
        const total = await JobPosting.countDocuments();
        const adzuna = await JobPosting.countDocuments({ source: 'Adzuna' });
        const arbeitnow = await JobPosting.countDocuments({ source: 'Arbeitnow' });
        const remotive = await JobPosting.countDocuments({ source: 'Remotive' });
        console.log(`Total Jobs: ${total}`);
        console.log(`Adzuna: ${adzuna}`);
        console.log(`Arbeitnow: ${arbeitnow}`);
        console.log(`Remotive: ${remotive}`);
        
        console.log("\n=== 2. Resume Check ===");
        const resumes = await Resume.countDocuments();
        console.log(`Total Resumes: ${resumes}`);
        
        console.log("\n=== 3. Matches Check ===");
        const matches = await MatchAnalysis.countDocuments();
        console.log(`Total Matches: ${matches}`);
        
    } catch (err) {
        console.error(err);
    }
    
    await mongoose.disconnect();
}
testFullE2E();
