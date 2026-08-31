const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // wait, @google/generative-ai doesn't actually expose listModels() in older versions? 
    // let's try calling an API endpoint via axios to see models.
    const axios = require('axios');
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const flashModels = response.data.models.filter(m => m.name.includes('flash')).map(m => m.name);
    console.log("Flash models:", flashModels);
}
listModels();
