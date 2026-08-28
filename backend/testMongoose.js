const mongoose = require('mongoose');
const { env } = require('./src/config/env');
const { MatchAnalysis } = require('./src/models/MatchAnalysis');

async function test() {
    await mongoose.connect(env.MONGODB_URI);
    try {
        const doc = await MatchAnalysis.create({
            userId: new mongoose.Types.ObjectId(),
            resumeId: new mongoose.Types.ObjectId(),
            jobId: new mongoose.Types.ObjectId(),
            matchScore: 85,
            matchedSkills: ["React"],
            missingSkills: [],
            learningPath: [
                {
                    skill: "Node",
                    resources: [
                        {
                            title: "Learn Node",
                            url: "http://example.com",
                            type: "course"
                        }
                    ]
                }
            ],
            summary: "Looks good"
        });
        console.log("Success:", doc._id);
    } catch (err) {
        console.error(err);
    }
    await mongoose.disconnect();
}
test();
