const rateLimit = require('express-rate-limit');

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' },
});

// Stricter rate limiter for expensive AI endpoints (e.g. Gemini calls)
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 AI calls per 15 mins per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'AI limit reached (5 requests per 15 minutes). Please try again later.' },
});

module.exports = {
    apiLimiter,
    aiLimiter
};
