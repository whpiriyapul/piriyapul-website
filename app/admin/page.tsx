import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="admin-shell">
        <section className="admin-panel admin-setup-panel">
          <p className="admin-kicker">PIRIYAPUL INTERNATIONAL</p>
          <h1>ระบบจัดการแบรนด์</h1>
          <p>เชื่อม Supabase ก่อนเริ่มใช้งาน โดยทำตามขั้นตอนในไฟล์ SUPABASE_SETUP.md</p>
          <Link className="admin-primary-button admin-button-link" href="/">กลับหน้าเว็บไซต์</Link>
        </section>
      </main>
    );
  }

  if (!await getCurrentAdmin()) redirect("/admin/login");
  redirect("/admin/content");
}
