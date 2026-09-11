const mongoose = require('mongoose');

/**
 * A single generated interview question.
 * NOTE: `category`, `difficulty` and `tips` are produced by ai.service.generateMockQuestions
 * and were previously dropped silently by Mongoose strict mode because they were not
 * declared here. They are now persisted so the session UI can render them.
 */
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  context: String,
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'situational', 'hr'],
    default: 'technical',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  tips: String,
  // Seconds allowed for this question. Derived from difficulty (60/90/120).
  timeLimit: { type: Number, default: 90, min: 30, max: 600 },
}, { _id: false });

/**
 * A candidate's answer plus the AI evaluation of it.
 * Scores are clamped 0-10 at the schema level so a hallucinated value
 * (e.g. `confidence: 9999`) cannot poison the averages.
 */
const AnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true, min: 0 },
  userAnswer: { type: String, default: '' },

  score: { type: Number, default: 0, min: 0, max: 10 },
  // Axes carried over from the existing evaluateAnswer contract
  clarity: { type: Number, default: 0, min: 0, max: 10 },
  relevance: { type: Number, default: 0, min: 0, max: 10 },
  specificity: { type: Number, default: 0, min: 0, max: 10 },
  // Axes merged in from the PrepNexa evaluator
  confidence: { type: Number, default: 0, min: 0, max: 10 },
  communication: { type: Number, default: 0, min: 0, max: 10 },
  correctness: { type: Number, default: 0, min: 0, max: 10 },

  feedback: String,
  // Kept as `sampleGoodAnswer` for backwards compatibility with existing
  // documents; `improvedAnswer` from the AI is mapped onto it in the controller.
  sampleGoodAnswer: String,

  timeTaken: { type: Number, default: 0, min: 0 },
  skipped: { type: Boolean, default: false },
  answeredAt: { type: Date, default: Date.now },
}, { _id: false });

const MockInterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
  },
  jobTitle: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  // Snapshot of the JD used to generate questions, so evaluation does not
  // need to re-query JobPosting on every single answer.
  jobDescription: {
    type: String,
    default: '',
  },
  interviewType: {
    type: String,
    enum: ['Technical', 'Behavioral', 'HR', 'Mixed'],
    default: 'Mixed',
  },
  difficulty: {
    type: String,
    enum: ['Entry-Level', 'Mid-Level', 'Senior'],
    default: 'Mid-Level',
  },
  numberOfQuestions: {
    type: Number,
    default: 5,
    min: 1,
    max: 30,
  },
  source: {
    type: String,
    enum: ['General', 'Saved Job', 'Resume', 'Target Role'],
    default: 'General',
  },
  // Populated when source === 'Resume'
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null,
  },

  questions: [QuestionSchema],
  answers: [AnswerSchema],

  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress',
  },

  overallScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100,
  },

  summary: {
    narrative: String,
    categoryScores: {
      technical: Number,
      communication: Number,
      confidence: Number,
      clarity: Number,
    },
    strengths: [String],
    weaknesses: [String],
    topImprovements: [String],
    weakestAnswers: [{
      originalQuestion: String,
      userAnswer: String,
      betterAnswer: String,
    }],
  },

  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

// History listing: sessions for one user, newest first.
MockInterviewSessionSchema.index({ userId: 1, createdAt: -1 });
// "Resume an unfinished interview" and status-filtered history.
MockInterviewSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

/** How many questions actually have a recorded answer. */
MockInterviewSessionSchema.virtual('answeredCount').get(function () {
  return Array.isArray(this.answers) ? this.answers.length : 0;
});

MockInterviewSessionSchema.set('toJSON', { virtuals: true });
MockInterviewSessionSchema.set('toObject', { virtuals: true });

module.exports = { MockInterviewSession: mongoose.model('MockInterviewSession', MockInterviewSessionSchema) };
