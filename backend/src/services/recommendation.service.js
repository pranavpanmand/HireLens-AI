"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");
let genAI;
function getGenAI() {
    if (!genAI) {
        genAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
    }
    return genAI;
}
async function generateEmbedding(text) {
    try {
        const model = getGenAI().getGenerativeModel({ model: 'gemini-embedding-2' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }
    catch (error) {
        console.error('Embedding generation failed:', error);
        throw new Error('Failed to generate embeddings');
    }
}
//# sourceMappingURL=recommendation.service.js.map