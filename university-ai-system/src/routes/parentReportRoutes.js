import express from 'express';

const router = express.Router();

// مصفوفة مؤقتة لتخزين تقارير أولياء الأمور المسبقة لضمان الاستقرار
let parentReportsMemory = [];

// مسار لتوليد وعرض تقرير مبسط لولي الأمر
router.post('/generate-report', async (req, res) => {
  try {
    const { studentName, parentPhone, recentLecture, attendanceStatus, averageScore, generalMood } = req.body;

    const name = studentName || "عمر هشام إبراهيم";
    const lecture = recentLecture || "محاضرة اقتصاديات السياحة والطيران";
    const attendance = attendanceStatus || "حاضر في الموعد 🎓";
    const score = averageScore || "9 / 10 (ممتاز 🌟)";
    const mood = generalMood || "نشط ومركّز على أهدافه";

    // صياغة رسالة مبسطة جداً وغير معقدة لولي الأمر
    const simplifiedMessage = `مرحباً بك يا فندم 🌹\nنطئنكم على ابنكم (${name}) اليوم في نظام SEND التعليمي:\n• الحضور: ${attendance}\n• آخر محاضرة: ${lecture}\n• التقييم العام: ${score}\n• الأداء: ${mood}\n\nشكراً لمتابعتكم المستمرة معنا لمستقبل مشرق! 🚀✨`;

    const reportEntry = {
      _id: "report_" + Date.now(),
      studentName: name,
      parentPhone: parentPhone || "01000000000",
      simplifiedMessage: simplifiedMessage,
      createdAt: new Date()
    };

    parentReportsMemory.unshift(reportEntry);

    // التصحيح هنا: إضافة (201) قبل الـ json
    res.status(201).json({
      success: true,
      message: "تم تجهيز تقرير ولي الأمر المبسط بنجاح وجاهز للإرسال! 📱✨",
      parentReport: reportEntry
    });

  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء تجهيز التقرير", details: error.message });
  }
});

// مسار لجلب وعرض التقارير المرسلة
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    count: parentReportsMemory.length,
    reports: parentReportsMemory
  });
});

export default router;