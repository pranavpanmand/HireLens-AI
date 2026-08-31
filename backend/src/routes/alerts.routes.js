"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerts_controller_1 = require("../controllers/alerts.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();

// Public route for unsubscribing from email
router.get('/unsubscribe/:token', alerts_controller_1.unsubscribe);

// Protected routes
router.use(auth_1.requireAuth);
router.get('/status', alerts_controller_1.getStatus);
router.post('/toggle', alerts_controller_1.toggleAlert);

exports.default = router;
