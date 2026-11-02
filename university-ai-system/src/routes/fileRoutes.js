import express from 'express';
import { upload } from '../Middleware/uploadMiddleware.js';
import { verifyToken, verifyRole } from '../Middleware/authMiddleware.js';
import File from '../models/fileModel.js'; // استدعاء موديل الملفات
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 1. مسار رفع ملف جديد مع الحفظ في قاعدة البيانات
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "الرجاء اختيار ملف لرفعه!" });
    }

    let savedFile = null;
    try {
      const newFile = new File({
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
      });

      savedFile = await newFile.save();
    } catch (dbError) {
      console.log("تنبيه قاعدة البيانات:", dbError.message);
    }

    res.status(201).json({
      message: "تم رفع الملف بنجاح إلى مستودع النظام! 📂✨",
      fileInfo: {
        id: savedFile ? savedFile._id : null,
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
        path: `/uploads/${req.file.filename}`,
        savedInDB: savedFile ? true : false
      }
    });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء رفع الملف.", details: error.message });
  }
});

// 2. مسار لعرض قائمة الملفات المتاحة من المجلد مباشرة
router.get('/list', verifyToken, (req, res) => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    return res.json({ files: [] });
  }

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "تعذر قراءة ملفات المستودع." });
    }

    const fileList = files.map(file => ({
      filename: file,
      url: `http://localhost:5001/uploads/${file}`
    }));

    res.json({
      message: "قائمة الملفات التعليمية المتاحة في النظام 📚",
      files: fileList
    });
  });
});

// 3. مسار جلب وعرض جميع الملفات (آمن: يقرأ من المجلد مباشرة لو القاعدة فاصلة)
router.get('/', async (req, res) => {
  try {
    let filesList = [];
    
    try {
      const dbFiles = await File.find().sort({ createdAt: -1 }).maxTimeMS(3000);
      filesList = dbFiles.map(file => ({
        id: file._id,
        originalName: file.originalName,
        filename: file.filename,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        url: `http://localhost:5001${file.path}`,
        createdAt: file.createdAt
      }));
    } catch (dbError) {
      console.log("قاعدة البيانات غير متصلة، جاري جلب الملفات من المجلد المحلي...");
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (fs.existsSync(uploadDir)) {
        const localFiles = fs.readdirSync(uploadDir);
        filesList = localFiles.map((file, index) => ({
          id: index + 1,
          originalName: file,
          filename: file,
          size: "غير محدد",
          url: `http://localhost:5001/uploads/${file}`,
          createdAt: new Date()
        }));
      }
    }

    res.status(200).json({
      message: "تم استرجاع قائمة الملفات بنجاح 📚",
      count: filesList.length,
      files: filesList
    });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الملفات.", details: error.message });
  }
});

// 4. مسار حذف ملف (يدعم الحذف من قاعدة البيانات أو المجلد المحلي مباشرة)
router.delete('/:id', async (req, res) => {
  try {
    const fileIdOrName = req.params.id;
    let deletedInfo = null;

    // 1. محاولة البحث والحذف من قاعدة البيانات لو كان الـ ID صالح لـ MongoDB
    if (fileIdOrName.match(/^[0-9a-fA-F]{24}$/)) {
      const file = await File.findById(fileIdOrName);
      if (file) {
        const filePath = path.join(process.cwd(), file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        await File.findByIdAndDelete(fileIdOrName);
        deletedInfo = { id: file._id, originalName: file.originalName };
      }
    }

    // 2. لو مش في القاعدة أو الـ ID رقم تسلسلي/اسم ملف، نحذفه من المجلد المحلي مباشرة
    if (!deletedInfo) {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (fs.existsSync(uploadDir)) {
        const localFiles = fs.readdirSync(uploadDir);
        
        // لو الـ ID عبارة عن رقم فهرس (index مثل 1 أو 2)
        let targetFileName = null;
        if (!isNaN(fileIdOrName) && Number(fileIdOrName) <= localFiles.length) {
          targetFileName = localFiles[Number(fileIdOrName) - 1];
        } else {
          // أو لو الـ ID هو اسم الملف نفسه
          targetFileName = localFiles.find(f => f === fileIdOrName);
        }

        if (targetFileName) {
          const localFilePath = path.join(uploadDir, targetFileName);
          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            deletedInfo = { id: fileIdOrName, originalName: targetFileName };
          }
        }
      }
    }

    if (!deletedInfo) {
      return res.status(404).json({ error: "الملف غير موجود لا في القاعدة ولا في المجلد المحلي!" });
    }

    res.status(200).json({
      message: "تم حذف الملف بنجاح من النظام! 🗑️✨",
      deletedFile: deletedInfo
    });

  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء محاولة حذف الملف.", details: error.message });
  }
});

export default router;