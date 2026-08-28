"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const savedJobs_controller_1 = require("../controllers/savedJobs.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth); // All routes require auth
router.get('/', savedJobs_controller_1.getSavedJobs);
router.post('/', savedJobs_controller_1.saveJob);
router.delete('/:jobId', savedJobs_controller_1.unsaveJob);
router.get('/:jobId/status', savedJobs_controller_1.checkSavedStatus);
exports.default = router;
//# sourceMappingURL=savedJobs.routes.js.map