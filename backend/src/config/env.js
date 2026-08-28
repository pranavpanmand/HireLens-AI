"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from server directory
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
function getEnv() {
    const required = ['MONGODB_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
    return {
        PORT: parseInt(process.env.PORT || '5000', 10),
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        ADZUNA_APP_ID: process.env.ADZUNA_APP_ID || '',
        ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY || '',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        NODE_ENV: process.env.NODE_ENV || 'development',
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    };
}
exports.env = getEnv();
//# sourceMappingURL=env.js.map