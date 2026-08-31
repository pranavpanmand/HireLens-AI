require('dotenv').config({ path: './.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Since we don't have direct listModels in the SDK easily without REST, we can just try another model
    // but the SDK does have something, wait the SDK might not expose listModels directly.
    // Let's use fetch.
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log("Available embedding models:");
    data.models.filter(m => m.name.includes('embed')).forEach(m => console.log(m.name, m.supportedGenerationMethods));
  } catch (e) {
    console.error(e);
  }
}

listModels();
