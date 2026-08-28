"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recruiter_controller_1 = require("../controllers/recruiter.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require auth AND recruiter role
router.use(auth_1.requireAuth, (0, auth_1.requireRole)('recruiter'));
router.get('/jobs', recruiter_controller_1.getMyJobs);
router.post('/jobs', recruiter_controller_1.createJob);
router.put('/jobs/:id', recruiter_controller_1.updateJob);
router.delete('/jobs/:id', recruiter_controller_1.deleteJob);
exports.default = router;
//# sourceMappingURL=recruiter.routes.js.map