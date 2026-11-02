import express from 'express';

const router = express.Router();

// مصفوفة مؤقتة لتخزين أهداف الطلاب قبل المحاضرات
let studentGoalsMemory = [];

// 1. مسار تسجيل أهداف الطالب قبل دخول المحاضرة
router.post('/set-goal', async (req, res) => {
  try {
    const { studentName, lectureTitle, desiredOutcomes, specificQuestions } = req.body;

    if (!lectureTitle || !desiredOutcomes) {
      return res.status(400).json({ 
        error: "يرجى تحديد عنوان المحاضرة وما ترغب في تحقيقه أو الاستفادة منه." 
      });
    }

    // تحليل ذكي مقترح من الـ AI بناءً على هدف الطالب
    const aiGuidance = `بناءً على هدفك في (${lectureTitle}): يُنصح بالتركيز مع الدكتور على الأمثلة العملية وتدوين الملاحظات حول ${desiredOutcomes}.`;

    const goalEntry = {
      _id: "goal_" + Date.now(),
      studentName: studentName || "عمر هشام إبراهيم",
      lectureTitle: lectureTitle,
      desiredOutcomes: desiredOutcomes, // إيه اللي عايز يستفيده
      specificQuestions: specificQuestions || "لا توجد أسئلة محددة، التركيز الشامل.",
      aiGuidance: aiGuidance,
      status: "نشط - قيد الاستعداد للمحاضرة 🎯",
      createdAt: new Date()
    };

    studentGoalsMemory.unshift(goalEntry);

    res.status(201).json({
      success: true,
      message: "تم تسجيل هدفك التعليمي بنجاح! نظام SEND جاهز لتوجيهك أثناء المحاضرة 🤖✨",
      learningGoal: goalEntry
    });

  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الأهداف", details: error.message });
  }
});

// 2. مسار استعراض الأهداف المسجلة مع إمكانية الفلترة
router.get('/', async (req, res) => {
  try {
    const { studentName, lectureTitle } = req.query;
    let goals = studentGoalsMemory;

    if (studentName || lectureTitle) {
      goals = studentGoalsMemory.filter(item => {
        let match = true;
        if (studentName && !item.studentName.toLowerCase().includes(studentName.toLowerCase())) match = false;
        if (lectureTitle && !item.lectureTitle.toLowerCase().includes(lectureTitle.toLowerCase())) match = false;
        return match;
      });
    }

    res.status(200).json({
      success: true,
      filterApplied: { studentName: studentName || null, lectureTitle: lectureTitle || null },
      count: goals.count || goals.length,
      learningGoals: goals
    });

  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الأهداف", details: error.message });
  }
});

export default router;