import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAdmin } from "@/app/admin/actions";
import { AdminCatalogManager } from "@/components/AdminCatalogManager";
import { getCurrentAdmin } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminPageProps = {
  searchParams: Promise<{ message?: string; error?: string; category?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;

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

  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) redirect("/admin/login");

  const supabase = await createSupabaseServerClient();
  const [{ data: categories, error: categoriesError }, { data: brands, error: brandsError }] = await Promise.all([
    supabase.from("categories").select("id,label,icon_url,icon_path").order("sort_order"),
    supabase.from("brands").select("id,name,category_id,logo_url,logo_path,sort_order,is_active").order("category_id").order("sort_order"),
  ]);
  const categoryList = categories ?? [];
  const initialCategoryId = categoryList.some((category) => category.id === params.category)
    ? params.category!
    : categoryList[0]?.id ?? "";

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">PIRIYAPUL INTERNATIONAL</p>
          <h1>ระบบจัดการแบรนด์</h1>
        </div>
        <nav className="admin-nav" aria-label="เมนูผู้ดูแล">
          <Link href="/admin/content">จัดการเว็บไซต์</Link>
          <Link className="admin-nav-active" href="/admin">แบรนด์</Link>
          {currentAdmin.membership.role === "admin" && <Link href="/admin/team">ผู้ใช้งาน</Link>}
          <Link href="/" target="_blank">ดูหน้าเว็บ ↗</Link>
          <form action={signOutAdmin}><button className="admin-quiet-button" type="submit">ออกจากระบบ</button></form>
        </nav>
      </header>

      {params.message && <p className="admin-notice" role="status">{params.message}</p>}
      {params.error && <p className="admin-alert" role="alert">{params.error}</p>}
      {(categoriesError || brandsError) && (
        <p className="admin-alert" role="alert">อ่านข้อมูลจาก Supabase ไม่สำเร็จ กรุณาตรวจสอบว่าได้รัน migration แล้ว</p>
      )}

      {!categoriesError && !brandsError && (
        <AdminCatalogManager
          key={initialCategoryId}
          categories={categoryList}
          brands={brands ?? []}
          initialCategoryId={initialCategoryId}
        />
      )}
    </main>
  );
}
