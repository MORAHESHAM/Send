import mongoose from 'mongoose';

const learningGoalSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalTitle: {
    type: String,
    required: true
  },
  targetDate: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  progressPercentage: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const LearningGoal = mongoose.models.LearningGoal || mongoose.model('LearningGoal', learningGoalSchema);
export default LearningGoal;