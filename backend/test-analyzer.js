const mongoose = require('mongoose');
const { Resume } = require('./src/models/Resume');
const { User } = require('./src/models/User');
const { analyzeResume } = require('./src/services/ai.service');
require('dotenv').config({ path: './.env' });

async function testAnalyzer() {
    // We don't even need to connect to mongoose to test the AI service
    // since the AI service doesn't query the DB directly, it just takes text.
    
    // Test 1: Strong Resume (Software Engineer with React/Node)
    const strongResume = `
    Pranav Panmand - Senior Full Stack Engineer
    Experience: 5 years building scalable web applications using React, Node.js, and MongoDB.
    - Built a high-performance ATS platform handling 10k+ concurrent users.
    - Reduced latency by 40% through Redis caching and optimized database queries.
    Skills: JavaScript, TypeScript, React, Node.js, Express, MongoDB, AWS, Docker.
    Education: B.S. in Computer Science
    `;
    
    // Test 2: Weak Resume (Irrelevant or poorly formatted)
    const weakResume = `
    John Doe
    I want a job in tech. I like computers.
    Experience: Worked at a grocery store for 2 years.
    Skills: Hard worker, good listener, basic HTML.
    Education: High School
    `;
    
    console.log("Analyzing Strong Resume...");
    const strongResult = await analyzeResume(strongResume);
    console.log(JSON.stringify(strongResult, null, 2));
    
    console.log("\nAnalyzing Weak Resume...");
    const weakResult = await analyzeResume(weakResume);
    console.log(JSON.stringify(weakResult, null, 2));
    
    process.exit(0);
}

testAnalyzer().catch(err => {
    console.error(err);
    process.exit(1);
});
