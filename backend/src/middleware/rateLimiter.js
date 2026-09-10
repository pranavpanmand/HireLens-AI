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

// Auth rate limiter. Deliberately much stricter than apiLimiter: /login and
// /forgot-password are the endpoints worth brute-forcing, and the general
// 5000-request budget offers no protection there.
// skipSuccessfulRequests means only FAILED attempts count, so a legitimate user
// signing in and out repeatedly is never locked out.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        error: 'Too many attempts. Please wait a few minutes and try again.',
    },
});

module.exports = {
    apiLimiter,
    aiLimiter,
    authLimiter
};
