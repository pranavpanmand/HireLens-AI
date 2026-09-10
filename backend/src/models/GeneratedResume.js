const mongoose = require('mongoose');

const GeneratedResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    default: null,
  },
  originalResumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  targetCompany: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  }
}, { timestamps: true });

GeneratedResumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = { GeneratedResume: mongoose.model('GeneratedResume', GeneratedResumeSchema) };
