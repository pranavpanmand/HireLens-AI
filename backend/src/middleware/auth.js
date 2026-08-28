"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
function requireAuth(req, _res, next) {
    try {
        const token = req.cookies.jwt || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);
        if (!token) {
            throw new errorHandler_1.AppError('Not authorized, no token', 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError('Not authorized, invalid token', 401));
    }
}
function requireRole(role) {
    return (req, _res, next) => {
        if (!req.user) {
            next(new errorHandler_1.AppError('Not authorized', 401));
            return;
        }
        if (req.user.role !== role) {
            next(new errorHandler_1.AppError('Forbidden: Insufficient permissions', 403));
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map