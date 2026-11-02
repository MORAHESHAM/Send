import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { verifyToken } from '../Middleware/authMiddleware.js'; // تأكد من اسم المجلد (middleware أو Middleware)

const router = express.Router();

// تهيئة عميل الـ Google Gen AI باستخدام مفتاح البيئة
const aiApiKey = process.env.GEMINI_API_KEY;
const ai = aiApiKey ? new GoogleGenAI({ apiKey: aiApiKey }) : null;

// مسار تلقي أسئلة الطلاب وتوليد الرد بالذكاء الاصطناعي
router.post('/ask', verifyToken, async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "من فضلك أرسل السؤال المطلوب للذكاء الاصطناعي!" });
  }

  try {
    // لو المفتاح متوفر في ملف .env
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `أنت مساعد ذكي ومتخصص في إدارة الطيران ومجال السياحة لجامعة مدينة السادات الأهلية. أجب على السؤال التالي بطريقة احترافية وواضحة للطلاب: ${question}` }
            ]
          }
        ],
      });

      return res.json({
        success: true,
        source: "Gemini AI Live API 🚀",
        answer: response.text
      });
    } else {
      // وضع المحاكاة الذكي في حالة عدم توفر المفتاح مؤقتاً لضمان نجاح العرض
      return res.json({
        success: true,
        source: "AI Simulation Mode 🛡️",
        answer: `بصفتي مساعد الطيران الذكي لنظام SEND، أقول لك بخصوص سؤالك ("${question}"): إدارة الطيران تتطلب فهماً دقيقاً للتشغيل، الجداول الزمنية، وتطبيقات الذكاء الاصطناعي في السياحة والعمليات الجوية!`
      });
    }

  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ 
      error: "حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي.",
      details: error.message 
    });
  }
});

export default router;