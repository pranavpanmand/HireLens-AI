"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
exports.cosineSimilarity = cosineSimilarity;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");

let genAI;
function getGenAI() {
    if (!genAI) {
        if (!env_1.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        genAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
    }
    return genAI;
}

/**
 * Generate a 768-dimensional embedding vector for text using Gemini text-embedding-004.
 * Truncates to 10,000 chars to stay within API limits.
 */
async function generateEmbedding(text) {
    if (!text || text.trim().length === 0) {
        throw new Error('Cannot embed empty text');
    }
    
    const truncated = text.substring(0, 10000);
    const model = getGenAI().getGenerativeModel({ model: 'text-embedding-004' });
    
    const result = await model.embedContent(truncated);
    return result.embedding.values;
}

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical, 0 = orthogonal).
 */
function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;
    
    return dotProduct / denominator;
}
