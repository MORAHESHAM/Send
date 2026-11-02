import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// استخدام الرابط المباشر مع تجاوز أخطاء الـ SSL والشبكة
const connectionString = process.env.DATABASE_URL || `postgres://postgres:${process.env.DB_PASSWORD || 'MORA1212hesham'}@db.timqrrfefnmaiscckxrx.supabase.co:5432/postgres`;

let sql;
try {
  sql = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    max: 5,
    connect_timeout: 5,
    transform: { undefined: null }
  });
} catch (e) {
  console.log("DB Connection Init Error:", e.message);
}

// دالة اختبار آمنة لا توقف السيرفر أبداً
export const testConnection = async () => {
  try {
    if (!sql) return false;
    await sql`SELECT 1`;
    return true;
  } catch (err) {
    console.log("Database warning:", err.message);
    return false;
  }
};

export default sql;