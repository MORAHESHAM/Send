import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  taskOrQuizTitle: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['task', 'quiz'],
    required: true
  },
  content: {
    type: String, // نص الإجابة أو محتوى التاسك المرفوع
    required: true
  },
  score: {
    type: Number, // الدرجة النهائية المستحقة
    default: 0
  },
  maxScore: {
    type: Number, // الدرجة الكلية
    default: 10
  },
  aiFeedback: {
    type: String, // ملاحظات وتوجيهات الذكاء الاصطناعي لتحسين المستوى
    default: ""
  },
  aiGeneratedPercentage: {
    type: Number, // نسبة الاعتماد على الذكاء الاصطناعي (من 0 إلى 100%)
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

export default Evaluation;