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
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
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
}, { timestamps: true });

MockInterviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = { MockInterviewSession: mongoose.model('MockInterviewSession', MockInterviewSessionSchema) };
