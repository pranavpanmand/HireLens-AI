"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_1 = require("../middleware/auth");

const router = express_1.default.Router();

router.use(auth_1.requireAuth);
router.get("/skill-gap", analytics_controller_1.getSkillGapAnalytics);

exports.default = router;
