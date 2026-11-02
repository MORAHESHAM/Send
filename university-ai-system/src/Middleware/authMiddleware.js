import jwt from 'jsonwebtoken';

// دالة التحقق من الـ Token والصلاحيات
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(403).json({ error: "عذراً، مطلوب تسجيل الدخول أولاً للحصول على الصلاحية!" });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_send_system_2026', (err, user) => {
    if (err) {
      return res.status(401).json({ error: "انتهت صلاحية الجلسة أو الـ Token غير صالح!" });
    }
    req.user = user; 
    next();
  });
};

// دالة التحقق من الأدوار (الصلاحيات RBAC)
export const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "عذراً، لا تمتلك الصلاحية الكافية للوصول لهذا المسار!" });
    }
    next();
  };
};