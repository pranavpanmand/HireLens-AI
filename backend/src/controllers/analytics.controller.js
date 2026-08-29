"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSkillGapAnalytics = void 0;
const MatchAnalysis_1 = require("../models/MatchAnalysis");
const errorHandler_1 = require("../middleware/errorHandler");

const getSkillGapAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const pipeline = [
            { $match: { userId: userId } },
            { $unwind: "$missingSkills" },
            { 
                $group: { 
                    _id: "$missingSkills", 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { count: -1 } },
            { $limit: 15 },
            { 
                $project: {
                    _id: 0,
                    skill: "$_id",
                    count: 1
                }
            }
        ];

        const skillGaps = await MatchAnalysis_1.MatchAnalysis.aggregate(pipeline);

        res.json({ success: true, data: skillGaps });
    }
    catch (error) {
        next(error);
    }
};
exports.getSkillGapAnalytics = getSkillGapAnalytics;
