const { GoogleGenerativeAI } = require('@google/generative-ai');
const { env } = require('./src/config/env');

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

async function list() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`);
  const data = await response.json();
  console.log(data.models.filter(m => m.supportedGenerationMethods.includes('embedContent')).map(m => m.name));
}

list();
