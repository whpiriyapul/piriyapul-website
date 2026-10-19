import { redirect } from "next/navigation";
import { SiteContentPreview } from "@/components/SiteContentPreview";
import { getProductCatalog } from "@/lib/catalog";
import { defaultSiteContent } from "@/lib/site-content";
import { getCurrentAdmin } from "@/lib/admin";

export default async function SitePreviewPage() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) redirect("/admin/login");
  const catalog = await getProductCatalog();
  return <SiteContentPreview initialContent={defaultSiteContent} categories={catalog.categories} brands={catalog.brands} />;
}
