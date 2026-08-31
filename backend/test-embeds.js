const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env' });

async function testQuota(modelName) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent("Test request");
        console.log(`Model ${modelName} SUCCESS:`, result.embedding.values.length);
    } catch (err) {
        console.log(`Model ${modelName} FAILED:`, err.message);
    }
}

async function run() {
    await testQuota('gemini-embedding-2');
    await testQuota('text-embedding-004');
}
run();
