"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdfResume = parsePdfResume;
exports.extractSkillsSimple = extractSkillsSimple;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const promises_1 = __importDefault(require("fs/promises"));
async function parsePdfResume(dataBuffer) {
    try {
        const data = await (0, pdf_parse_1.default)(dataBuffer);
        return data.text || '';
    }
    catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF resume');
    }
}
function extractSkillsSimple(text) {
    // A simple rule-based fallback if AI is not used immediately
    const commonSkills = [
        'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'react', 'angular',
        'vue', 'node.js', 'express', 'mongodb', 'sql', 'postgresql', 'mysql', 'docker',
        'kubernetes', 'aws', 'gcp', 'azure', 'git', 'ci/cd', 'agile', 'html', 'css',
        'machine learning', 'data science', 'ai'
    ];
    const lowerText = text.toLowerCase();
    const extracted = commonSkills.filter(skill => lowerText.includes(skill));
    return extracted;
}
//# sourceMappingURL=resume.service.js.map