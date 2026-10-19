import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signInAdmin } from "@/app/admin/login/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const loginErrors: Record<string, string> = {
  "not-configured": "ยังไม่ได้เชื่อม Supabase กับเว็บไซต์",
  "missing-fields": "กรุณากรอกอีเมลและรหัสผ่าน",
  "invalid-credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "not-authorized": "บัญชีนี้ยังไม่มีสิทธิ์เข้าใช้งานระบบจัดการ",
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error ? loginErrors[params.error] : undefined;

  if (isSupabaseConfigured() && await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="admin-shell admin-login-shell">
      <section className="admin-login-card">
        <Link href="/" className="admin-back-link">← กลับหน้าเว็บไซต์</Link>
        <p className="admin-kicker">PIRIYAPUL INTERNATIONAL</p>
        <h1>เข้าสู่ระบบจัดการ</h1>
        <p className="admin-muted">จัดการหมวดสินค้าและแบรนด์บนเว็บไซต์</p>

        {!isSupabaseConfigured() ? (
          <div className="admin-alert">
            ยังไม่ได้เชื่อม Supabase กรุณาตั้งค่า Project URL และ Publishable key ในไฟล์ <code>.env.local</code>
          </div>
        ) : (
          <form className="admin-form" action={signInAdmin}>
            {error && <p className="admin-alert" role="alert">{error}</p>}
            <label>
              อีเมล
              <input name="email" type="email" autoComplete="username" required />
            </label>
            <label>
              รหัสผ่าน
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button className="admin-primary-button" type="submit">เข้าสู่ระบบ</button>
          </form>
        )}
      </section>
    </main>
  );
}
