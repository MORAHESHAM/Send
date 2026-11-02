import express from 'express';

const router = express.Router();

// مصفوفة مؤقتة لتخزين سجلات الحضور بـ QR Code لضمان الاستقرار التام
let attendanceRecordsMemory = [];

// 1. مسار تسجيل الحضور عبر مسح الـ QR Code (Check-in)
router.post('/check-in', async (req, res) => {
  try {
    const { studentName, lectureTitle, qrCodeToken } = req.body;

    if (!lectureTitle) {
      return res.status(400).json({ error: "يرجى توفير عنوان المحاضرة أو الدرس لتسجيل الحضور." });
    }

    // التحقق مما إذا كان الطالب قد سجل حضوره مسبقاً لنفس المحاضرة
    const existingCheckIn = attendanceRecordsMemory.find(
      item => item.studentName === (studentName || "عمر هشام إبراهيم") && item.lectureTitle === lectureTitle
    );

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: "لقد تم تسجيل حضورك مسبقاً لهذه المحاضرة بالفعل! 📌",
        record: existingCheckIn
      });
    }

    const attendanceEntry = {
      _id: "mock_att_" + Date.now(),
      studentName: studentName || "عمر هشام إبراهيم",
      lectureTitle: lectureTitle,
      qrCodeToken: qrCodeToken || "qr_token_" + Math.random().toString(36).substring(7),
      status: "حاضر (Present)",
      checkedInAt: new Date()
    };

    // حفظ التسجيل في الذاكرة المؤقتة
    attendanceRecordsMemory.unshift(attendanceEntry);

    res.status(201).json({
      success: true,
      message: "تم تسجيل الحضور بنجاح عبر الـ QR Code! 🎓✨",
      record: attendanceEntry
    });

  } catch (error) {
    res.status(500).json({
      error: "حدث خطأ أثناء عملية تسجيل الحضور",
      details: error.message
    });
  }
});

// 2. مسار جلب وعرض كافة سجلات الحضور مع دعم البحث والفلترة
router.get('/', async (req, res) => {
  try {
    const { studentName, lectureTitle } = req.query;
    let records = attendanceRecordsMemory;

    // تطبيق شروط الفلترة لو تم تمريرها في الـ Query
    if (studentName || lectureTitle) {
      records = attendanceRecordsMemory.filter(item => {
        let match = true;
        if (studentName && !item.studentName.toLowerCase().includes(studentName.toLowerCase())) match = false;
        if (lectureTitle && !item.lectureTitle.toLowerCase().includes(lectureTitle.toLowerCase())) match = false;
        return match;
      });
    }

    res.status(200).json({
      success: true,
      filterApplied: { studentName: studentName || null, lectureTitle: lectureTitle || null },
      count: records.length,
      attendanceRecords: records
    });

  } catch (error) {
    res.status(500).json({
      error: "حدث خطأ أثناء جلب سجلات الحضور",
      details: error.message
    });
  }
});

export default router;