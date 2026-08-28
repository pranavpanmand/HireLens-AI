"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recommendations_controller_1 = require("../controllers/recommendations.controller");
const auth_1 = require("../middleware/auth");

const router = (0, express_1.Router)();

router.get('/', auth_1.requireAuth, recommendations_controller_1.getRecommendations);
router.post('/embed-jobs', auth_1.requireAuth, recommendations_controller_1.embedAllJobs);

exports.default = router;