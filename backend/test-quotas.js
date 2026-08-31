const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env' });

async function testQuota(modelName) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Test request");
        console.log(`Model ${modelName} SUCCESS:`, result.response.text().substring(0, 50));
    } catch (err) {
        console.log(`Model ${modelName} FAILED:`, err.message);
    }
}

async function run() {
    await testQuota('gemini-2.5-flash-lite');
    await testQuota('gemini-flash-lite-latest');
    await testQuota('gemini-3.5-flash');
}
run();
