const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiKey);

async function listAllModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
    const data = await response.json();
    
    const validModels = data.models.filter(m => 
      m.supportedGenerationMethods.includes('generateContent')
    ).map(m => m.name);
    
    console.log('Available models for generateContent:');
    console.log(validModels);
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listAllModels();
