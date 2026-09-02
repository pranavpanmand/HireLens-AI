"use strict";
const mongoose = require("mongoose");

const jobAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'weekly'
    },
    lastSentAt: {
        type: Date
    },
    lastStrongMatchAlertSentAt: {
        type: Date,
        default: null
    },
    unsubscribeToken: {
        type: String
    }
}, {
    timestamps: true
});

exports.JobAlert = mongoose.model('JobAlert', jobAlertSchema);
