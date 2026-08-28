"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobs_controller_1 = require("../controllers/jobs.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Publicly available so users can browse jobs before signing in
router.get('/', jobs_controller_1.getJobs);
router.get('/external', auth_1.requireAuth, jobs_controller_1.fetchExternal); // Triggers Adzuna fetch
router.get('/:id', auth_1.requireAuth, jobs_controller_1.getJobById);
exports.default = router;
//# sourceMappingURL=jobs.routes.js.map