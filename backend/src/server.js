"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
async function start() {
    try {
        await (0, db_1.connectDB)();
    }
    catch (err) {
        console.error('Failed to connect to MongoDB, but starting server anyway for API testing:', err);
    }
    app_1.default.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server running on port ${env_1.env.PORT} [${env_1.env.NODE_ENV}]`);
    });
}
start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map