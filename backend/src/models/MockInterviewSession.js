const mongoose = require('mongoose');

const MockInterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: false,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  interviewType: {
    type: String,
    default: 'Mixed',
  },
  difficulty: {
    type: String,
    default: 'Mid-Level',
  },
  numberOfQuestions: {
    type: Number,
    default: 5,
  },
  source: {
    type: String,
    default: 'General',
  },
  questions: [{
    question: String,
    context: String
  }],
  answers: [{
    questionIndex: Number,
    userAnswer: String,
    score: Number,
    feedback: String,
    sampleGoodAnswer: String
  }],
  overallScore: {
    type: Number,
    default: null
  },
  summary: {
    narrative: String,
    categoryScores: {
      technical: Number,
      communication: Number,
      confidence: Number
    },
    topImprovements: [String]
  }
}, { timestamps: true });

MockInterviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = { MockInterviewSession: mongoose.model('MockInterviewSession', MockInterviewSessionSchema) };
