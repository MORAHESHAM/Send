import multer from 'multer';
import path from 'path';

// إعداد مكان تخزين الملفات واسمها الأصلي
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // تحديد مجلد الحفظ (تأكد إن المجلد موجود أو هيتم إنشاؤه)
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // إعطاء اسم فريد للملف لمنع تكرار الأسماء (تاريخ اليوم + اسم الملف الأصلي)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// فلتر للتاكد من نوع الملفات المسموحة (مثلاً PDFs وملفات الأوساط والمستندات)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|png|jpg|jpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('عذراً، مسموح فقط برفع ملفات المستندات والملفات التعليمية (PDF, Word, Powerpoint, Images)!'));
  }
};

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // أقصى حجم للملف 10 ميجابايت
  fileFilter: fileFilter
});
