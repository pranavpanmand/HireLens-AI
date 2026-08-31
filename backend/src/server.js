"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
require("./services/cron.service");

async function start() {
    try {
        await (0, db_1.connectDB)();
    }
    catch (err) {
        console.error('Failed to connect to MongoDB, but starting server anyway for API testing:', err);
    }
    const server = app_1.default.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server running on port ${env_1.env.PORT} [${env_1.env.NODE_ENV}]`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`⚠️ Port ${env_1.env.PORT} is busy. Cleaning up...`);
            process.exit(1);
        } else {
            console.error('Server error:', err);
        }
    });

    process.on('SIGINT', () => {
        server.close(() => process.exit(0));
    });
    process.on('SIGTERM', () => {
        server.close(() => process.exit(0));
    });
}
start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map