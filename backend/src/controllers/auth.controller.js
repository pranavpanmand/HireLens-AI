"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const generateToken = (user) => {
    const payload = {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
};
const setTokenCookie = (res, token) => {
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
const register = async (req, res, next) => {
    try {
        const { email, password, fullName, role } = req.body;
        const userExists = await User_1.User.findOne({ email });
        if (userExists) {
            throw new errorHandler_1.AppError('User already exists', 400);
        }
        const user = await User_1.User.create({
            email,
            password,
            fullName,
            role,
        });
        const token = generateToken(user);
        setTokenCookie(res, token);
        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw new errorHandler_1.AppError('Invalid email or password', 401);
        }
        const token = generateToken(user);
        setTokenCookie(res, token);
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = (_req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        // req.user is populated by requireAuth middleware
        if (!req.user) {
            throw new errorHandler_1.AppError('Not authenticated', 401);
        }
        // Fetch latest user data from DB to ensure it's up to date
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map