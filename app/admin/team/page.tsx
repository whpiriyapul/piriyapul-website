import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { hasSupabaseSecretKey } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { inviteAdminUser, removeAdminUser } from "@/app/admin/team/actions";

type TeamPageProps = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function AdminTeamPage({ searchParams }: TeamPageProps) {
  const currentAdmin = await requireAdmin();
  if (currentAdmin.membership.role !== "admin") redirect("/admin");
  const params = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data: users, error: usersError } = await supabase
    .from("admin_users")
    .select("user_id,email,role,created_at")
    .order("created_at");

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">PIRIYAPUL INTERNATIONAL</p>
          <h1>จัดการผู้ใช้งาน</h1>
        </div>
        <nav className="admin-nav" aria-label="เมนูผู้ดูแล">
          <Link href="/admin/content">จัดการเว็บไซต์</Link>
          <Link className="admin-nav-active" href="/admin/team">ผู้ใช้งาน</Link>
          <Link href="/" target="_blank">ดูหน้าเว็บ ↗</Link>
        </nav>
      </header>

      {params.message && <p className="admin-notice" role="status">{params.message}</p>}
      {params.error && <p className="admin-alert" role="alert">{params.error}</p>}
      {usersError && <p className="admin-alert" role="alert">อ่านรายชื่อผู้ใช้งานไม่สำเร็จ</p>}

      {!hasSupabaseSecretKey() && (
        <p className="admin-alert">
          การเชิญและเพิกถอนผู้ใช้ต้องตั้งค่า <code>SUPABASE_SECRET_KEY</code> ฝั่งเซิร์ฟเวอร์ก่อน
        </p>
      )}

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>เชิญผู้ใช้งาน</h2>
            <p>ระบบจะส่งอีเมลเชิญผ่าน Supabase และจำกัดสิทธิ์ตามบทบาท</p>
          </div>
        </div>
        <form className="admin-form admin-invite-form" action={inviteAdminUser}>
          <label>
            อีเมล
            <input name="email" type="email" required placeholder="name@company.com" disabled={!hasSupabaseSecretKey()} />
          </label>
          <label>
            สิทธิ์
            <select name="role" defaultValue="editor" disabled={!hasSupabaseSecretKey()}>
              <option value="editor">Editor — จัดการแบรนด์</option>
              <option value="admin">Admin — จัดการแบรนด์และผู้ใช้งาน</option>
            </select>
          </label>
          <button className="admin-primary-button" type="submit" disabled={!hasSupabaseSecretKey()}>ส่งคำเชิญ</button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>บัญชีที่มีสิทธิ์</h2>
            <p>{users?.length ?? 0} บัญชี · การเพิกถอนจะนำสิทธิ์เข้าเว็บออก แต่ไม่ลบบัญชี Supabase</p>
          </div>
        </div>
        <div className="admin-user-list">
          {(users ?? []).map((user) => (
            <article className="admin-user-row" key={user.user_id}>
              <div>
                <strong>{user.email}</strong>
                <span>{user.role === "admin" ? "Admin" : "Editor"}</span>
              </div>
              {user.user_id !== currentAdmin.user.id && hasSupabaseSecretKey() && (
                <form action={removeAdminUser}>
                  <input type="hidden" name="user_id" value={user.user_id} />
                  <button className="admin-danger-button" type="submit">เพิกถอนสิทธิ์</button>
                </form>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
