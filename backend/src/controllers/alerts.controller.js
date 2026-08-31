"use strict";
const crypto = require("crypto");
const { JobAlert } = require("../models/JobAlert");
const { AppError } = require("../middleware/errorHandler");

const getStatus = async (req, res, next) => {
    try {
        const alert = await JobAlert.findOne({ userId: req.user.id });
        res.json({
            success: true,
            data: alert || { isEnabled: false }
        });
    } catch (error) {
        next(error);
    }
};

const toggleAlert = async (req, res, next) => {
    try {
        const { isEnabled } = req.body;
        let alert = await JobAlert.findOne({ userId: req.user.id });

        if (!alert) {
            alert = new JobAlert({
                userId: req.user.id,
                isEnabled: isEnabled,
                unsubscribeToken: crypto.randomBytes(20).toString('hex')
            });
        } else {
            alert.isEnabled = isEnabled;
        }

        await alert.save();
        res.json({ success: true, data: alert });
    } catch (error) {
        next(error);
    }
};

const unsubscribe = async (req, res, next) => {
    try {
        const { token } = req.params;
        const alert = await JobAlert.findOne({ unsubscribeToken: token });

        if (!alert) {
            throw new AppError('Invalid unsubscribe token', 400);
        }

        alert.isEnabled = false;
        await alert.save();

        res.json({ success: true, message: 'You have been unsubscribed from job alerts.' });
    } catch (error) {
        next(error);
    }
};

exports.getStatus = getStatus;
exports.toggleAlert = toggleAlert;
exports.unsubscribe = unsubscribe;
