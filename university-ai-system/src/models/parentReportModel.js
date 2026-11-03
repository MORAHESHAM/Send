import mongoose from 'mongoose';

const parentReportSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  summaryNotes: {
    type: String,
    required: true
  },
  attendanceRate: {
    type: Number,
    default: 0
  },
  evaluationScore: {
    type: Number,
    default: 0
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const ParentReport = mongoose.models.ParentReport || mongoose.model('ParentReport', parentReportSchema);
export default ParentReport;