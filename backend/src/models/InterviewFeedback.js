const mongoose = require('mongoose');

const InterviewFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterviewSession',
  },
  rating: {
    type: String, // Difficult, Okay, Good, Great
    required: true,
  },
  goals: [{
    type: String, // Build confidence, Communication, Technical skills, etc.
  }],
  improvements: [{
    type: String, // Questions, Recording, Length, Feedback report, etc.
  }],
  comments: {
    type: String,
  }
}, { timestamps: true });

module.exports = { InterviewFeedback: mongoose.model('InterviewFeedback', InterviewFeedbackSchema) };
