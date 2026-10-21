import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminCatalogManager } from "@/components/AdminCatalogManager";

type AdminCatalogPageProps = {
  searchParams: Promise<{ category?: string; message?: string; error?: string; embedded?: string }>;
};

export default async function AdminCatalogPage({ searchParams }: AdminCatalogPageProps) {
  const params = await searchParams;
  if (params.embedded !== "1") redirect("/admin/content?section=products");

  const { supabase } = await requireAdmin();
  const [{ data: categories, error: categoriesError }, { data: brands, error: brandsError }] = await Promise.all([
    supabase.from("categories").select("id,label,icon_url,icon_path").order("sort_order"),
    supabase.from("brands").select("id,name,category_id,logo_url,logo_path,sort_order,is_active").order("category_id").order("sort_order"),
  ]);
  const categoryList = categories ?? [];
  const initialCategoryId = categoryList.some((category) => category.id === params.category)
    ? params.category!
    : categoryList[0]?.id ?? "";

  return (
    <main className={params.embedded === "1" ? "cms-catalog-embed-shell" : "admin-shell"}>
      {params.message && <p className="admin-notice" role="status">{params.message}</p>}
      {params.error && <p className="admin-alert" role="alert">{params.error}</p>}
      {(categoriesError || brandsError) ? (
        <p className="admin-alert" role="alert">อ่านข้อมูลหมวดสินค้าและแบรนด์จาก Supabase ไม่สำเร็จ</p>
      ) : (
        <AdminCatalogManager
          key={initialCategoryId}
          categories={categoryList}
          brands={brands ?? []}
          initialCategoryId={initialCategoryId}
          returnTo={params.embedded === "1" ? "embedded" : "admin"}
        />
      )}
    </main>
  );
}
