"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_routes_1 = __importDefault(require("./auth.routes"));
const jobs_routes_1 = __importDefault(require("./jobs.routes"));
const savedJobs_routes_1 = __importDefault(require("./savedJobs.routes"));
const resumes_routes_1 = __importDefault(require("./resumes.routes"));
const matches_routes_1 = __importDefault(require("./matches.routes"));
const recruiter_routes_1 = __importDefault(require("./recruiter.routes"));
const recommendations_routes_1 = __importDefault(require("./recommendations.routes"));
const profile_routes_1 = __importDefault(require("./profile.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const applications_routes_1 = __importDefault(require("./applications.routes"));
const alerts_routes_1 = __importDefault(require("./alerts.routes"));
function registerRoutes(app) {
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/jobs', jobs_routes_1.default);
    app.use('/api/saved-jobs', savedJobs_routes_1.default);
    app.use('/api/resumes', resumes_routes_1.default);
    app.use('/api/matches', matches_routes_1.default);
    app.use('/api/recruiter', recruiter_routes_1.default);
    app.use('/api/recommendations', recommendations_routes_1.default);
    app.use('/api/profile', profile_routes_1.default);
    app.use('/api/ai', ai_routes_1.default);
    app.use('/api/applications', applications_routes_1.default);
    app.use('/api/alerts', alerts_routes_1.default);
    app.use('/api/analytics', require('./analytics.routes').default);
    // Health check
    app.get('/api/health', (_req, res) => {
        res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
    });
}
//# sourceMappingURL=index.js.map