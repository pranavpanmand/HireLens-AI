"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = require("./routes");
const env_1 = require("./config/env");
const app = (0, express_1.default)();
// Security headers
app.use((0, helmet_1.default)());
// CORS — allow frontend dev server
app.use((0, cors_1.default)({
    origin: env_1.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL || 'http://localhost:8080'
        : 'http://localhost:8080',
    credentials: true,
}));
const rateLimiter = require('./middleware/rateLimiter');
app.use('/api/', rateLimiter.apiLimiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Serve uploaded files (local development)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Register API routes
(0, routes_1.registerRoutes)(app);
// Centralized error handler (must be after routes)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map