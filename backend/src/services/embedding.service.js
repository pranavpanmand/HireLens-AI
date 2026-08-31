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
 * Utility to execute a Gemini API call with automatic retries for rate limits (429)
 */
async function callWithRetry(apiCall, maxRetries = 5) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            if (error.status === 429 || (error.message && error.message.includes('429'))) {
                const jitter = Math.random() * 5000;
                const delay = (Math.pow(2, i) * 10000) + jitter;
                console.warn(`[Gemini API] Rate limit hit. Retrying in ${Math.round(delay/1000)}s... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    console.error("[Gemini API] Max retries reached.");
    throw lastError;
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
    const model = getGenAI().getGenerativeModel({ model: 'gemini-embedding-2' });
    
    const result = await callWithRetry(() => model.embedContent(truncated));
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
