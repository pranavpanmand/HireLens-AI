const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiKey);

async function testGemini() {
  console.log('Testing Gemini API with @google/generative-ai SDK...');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Reply with EXACTLY the word: API_KEY_VALID');
    console.log(`Gemini Success! Response: ${result.response.text().trim()}`);
  } catch (error) {
    console.error('Gemini Request Error:', error.message);
  }
}

testGemini();
