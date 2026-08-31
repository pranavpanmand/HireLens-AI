"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = exports.resetPassword = exports.forgotPassword = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const email_service_1 = require("../services/email.service");
const crypto = require("crypto");
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

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) throw new errorHandler_1.AppError('Please provide an email', 400);

        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate reset token (random hex string)
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Hash token and set expiry (30 mins)
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
        await user.save();

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host') === 'localhost:5000' ? 'localhost:5173' : req.get('host')}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
        const html = `
            <h3>Password Reset Request</h3>
            <p>You requested a password reset. Click the link below to reset your password. This link expires in 30 minutes.</p>
            <a href="${resetUrl}">Reset Password</a>
        `;

        try {
            await (0, email_service_1.sendEmail)({
                to: user.email,
                subject: 'Password Reset Token',
                text: message,
                html: html
            });
            res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            throw new errorHandler_1.AppError('Email could not be sent', 500);
        }
    } catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            throw new errorHandler_1.AppError('Please provide a valid new password (min 6 characters)', 400);
        }

        // Hash token from URL
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User_1.User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            throw new errorHandler_1.AppError('Invalid or expired reset token', 400);
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map