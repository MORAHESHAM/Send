import dotenv from 'dotenv';
// تحميل متغيرات البيئة أولاً وقبل أي استدعاء يعتمد عليها
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import sql, { testConnection } from './db.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js'; // استدعاء مسارات التقييم والكويزات
import attendanceRoutes from './routes/attendanceRoutes.js'; // استدعاء مسارات الحضور والـ QR Code
import learningGoalsRoutes from './routes/learningGoalsRoutes.js'; // استدعاء مسارات أهداف الطالب
import parentReportRoutes from './routes/parentReportRoutes.js'; // 📱 استدعاء مسارات تقارير أولياء الأمور
import mongoose from 'mongoose';

// الاتصال بقاعدة البيانات MongoDB بعد تحميل الـ dotenv بنجاح
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/send-db')
  .then(() => console.log("connected to MongoDB successfully! 🚀"))
  .catch(err => console.log("MongoDB connection error:", err.message));

// Initialize express FIRST (تعريف app أولاً قبل أي استخدام لها)
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Static Folder للملفات المرفوعة
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ==========================================
// 🌐 مسارات الواجهات الأمامية (HTML Routes)
// ==========================================

// صفحة نظام الحضور والـ QR Code
app.get('/qrcode', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'qrcode.html'));
});

// صفحة لوحة ولي الأمر
app.get('/parent', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'parent.html'));
});

// صفحة مركز رفع الملفات
app.get('/upload', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'upload.html'));
});

// جعل مجلد public متاحاً للعامة لعرض الواجهات
app.use(express.static(path.join(process.cwd(), 'public')));

// ربط كافة المسارات (Routes) بعد تعريف app مباشرة
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/learning-goals', learningGoalsRoutes); // ربط مسار الأهداف قبل المحاضرة 🎯
app.use('/api/parent-reports', parentReportRoutes); // 📱 ربط مسار تقارير ولي الأمر المبسطة

// Route تجريبي
app.get('/', async (req, res) => {
  const isDbConnected = await testConnection();
  
  if (isDbConnected) {
    res.json({ message: "SEND API and Database are running successfully! 🚀" });
  } else {
    res.json({ 
      message: "SEND API is running successfully! (Local Mock Mode Active) 🔥",
      database: "Offline due to local network restriction, but server is fully operational."
    });
  }
});

// تشغيل السيرفر محلياً أو تصديره لـ Vercel
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running smoothly on http://localhost:${PORT} 🚀`);
  });
}

// تصدير الـ app ليعمل بسلاسة على Vercel Serverless
export default app;