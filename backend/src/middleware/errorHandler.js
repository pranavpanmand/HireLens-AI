"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const env_1 = require("../config/env");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        console.error('ValidationError details:', err.errors);
        const detailMessage = Object.values(err.errors || {}).map(e => e.message).join(', ') || err.message;
        res.status(400).json({
            success: false,
            error: `Validation error: ${detailMessage}`,
            message: err.message,
            details: err.errors
        });
        return;
    }
    // Mongoose duplicate key error
    if (err.name === 'MongoServerError' && err.code === 11000) {
        res.status(409).json({
            success: false,
            error: 'Duplicate entry',
        });
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: 'Invalid token',
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: 'Token expired',
        });
        return;
    }
    // Multer file size error
    if (err.name === 'MulterError') {
        res.status(400).json({
            success: false,
            error: `File upload error: ${err.message}`,
        });
        return;
    }
    // Unknown errors
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: env_1.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
}
//# sourceMappingURL=errorHandler.js.map