const rateLimit = require('express-rate-limit');

// General API rate limiter (Increased to prevent blocking)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' },
});

// AI Rate limiter (Increased as requested by user to allow unlimited AI usage)
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Effectively disabled
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'AI limit reached. Please try again later.' },
});

module.exports = {
    apiLimiter,
    aiLimiter
};
