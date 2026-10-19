import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminSiteContentManager } from "@/components/AdminSiteContentManager";
import { defaultSiteContent, parseSiteContent } from "@/lib/site-content";

type AdminContentPageProps = {
  searchParams: Promise<{ section?: string }>;
};

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: draft, error }, { data: published }] = await Promise.all([
    supabase.from("site_content").select("content,updated_at").eq("id", "draft").maybeSingle(),
    supabase.from("site_content").select("content,updated_at").eq("id", "published").maybeSingle(),
  ]);
  const initialContent = parseSiteContent(draft?.content) ?? parseSiteContent(published?.content) ?? defaultSiteContent;

  return (
    <main className="admin-shell content-admin-shell">
      <header className="admin-topbar content-admin-topbar">
        <div>
          <p className="admin-kicker">PIRIYAPUL INTERNATIONAL</p>
          <h1>จัดการเนื้อหาเว็บไซต์</h1>
          <p className="content-admin-intro">เลือกส่วนจากตัวอย่างเพื่อแก้ข้อความ รูป หรือปุ่มที่เกี่ยวข้อง</p>
        </div>
        <nav className="admin-nav" aria-label="เมนูผู้ดูแล">
          <Link href="/admin/content" className="admin-nav-active">จัดการเว็บไซต์</Link>
          <Link href="/admin/content?section=products">สินค้าและแบรนด์</Link>
          <Link href="/admin/team">ผู้ใช้งาน</Link>
          <Link href="/" target="_blank">ดูหน้าเว็บ ↗</Link>
        </nav>
      </header>

      {error ? (
        <section className="admin-panel content-setup-warning">
          <h2>ยังไม่ได้เตรียมระบบจัดการเนื้อหา</h2>
          <p>ต้องสร้างตาราง <code>site_content</code> และ Storage bucket <code>site-media</code> ก่อน จึงจะบันทึกข้อมูลได้</p>
          <p>ให้รันไฟล์ <code>supabase/migrations/202610190002_site_content.sql</code> ใน Supabase SQL Editor แล้วรีเฟรชหน้านี้</p>
        </section>
      ) : (
        <AdminSiteContentManager initialContent={initialContent} publishedAt={published?.updated_at ?? null} initialSection={params.section === "products" ? "products" : "hero"} />
      )}
    </main>
  );
}
