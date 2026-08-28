"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer = require("multer");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_1 = require("../middleware/auth");

const router = (0, express_1.Router)();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// All profile routes require authentication
router.use(auth_1.requireAuth);

router.get('/', profile_controller_1.getProfile);
router.post('/photo', upload.single('photo'), profile_controller_1.uploadProfilePhoto);
router.delete('/photo', profile_controller_1.deleteProfilePhoto);
router.put('/basic-info', profile_controller_1.updateBasicInfo);
router.put('/education', profile_controller_1.updateEducation);
router.put('/experience', profile_controller_1.updateExperience);
router.put('/projects', profile_controller_1.updateProjects);
router.put('/skills', profile_controller_1.updateSkills);

exports.default = router;
