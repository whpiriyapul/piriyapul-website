import type { BrandRow, CategoryRow } from "@/lib/supabase/database.types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type CatalogCategory = Pick<CategoryRow, "id" | "label" | "icon_url" | "sort_order">;
export type CatalogBrand = Pick<BrandRow, "id" | "name" | "category_id" | "logo_url" | "sort_order">;

export const fallbackCategories: CatalogCategory[] = [
  { id: "food-beverage", label: "Food & Beverage", icon_url: "/assets/category-icons/food-beverage.svg", sort_order: 1 },
  { id: "confectionery", label: "Confectionery", icon_url: "/assets/category-icons/confectionery.svg", sort_order: 2 },
  { id: "personal-care", label: "Personal Care", icon_url: "/assets/category-icons/personal-care.svg", sort_order: 3 },
  { id: "other", label: "Other", icon_url: "/assets/category-icons/other.svg", sort_order: 4 },
];

export const fallbackBrands: CatalogBrand[] = [
  { id: "nescafe", name: "Nescafé", category_id: "food-beverage", logo_url: "/assets/brands/nescafe.png", sort_order: 1 },
  { id: "tchibo", name: "Tchibo", category_id: "food-beverage", logo_url: "/assets/brands/tchibo.png", sort_order: 2 },
  { id: "davidoff", name: "Davidoff", category_id: "food-beverage", logo_url: "/assets/brands/davidoff.png", sort_order: 3 },
  { id: "vitasoy", name: "Vitasoy", category_id: "food-beverage", logo_url: "/assets/brands/vitasoy.png", sort_order: 4 },
  { id: "lipton", name: "Lipton", category_id: "food-beverage", logo_url: "/assets/brands/lipton.png", sort_order: 5 },
  { id: "ligo", name: "Ligo", category_id: "food-beverage", logo_url: "/assets/brands/ligo.png", sort_order: 6 },
  { id: "pietro-coricelli", name: "Pietro Coricelli", category_id: "food-beverage", logo_url: "/assets/brands/pietro-coricelli.png", sort_order: 7 },
  { id: "orgran", name: "Orgran", category_id: "food-beverage", logo_url: "/assets/brands/orgran.png", sort_order: 8 },
];

export async function getProductCatalog() {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return { categories: fallbackCategories, brands: fallbackBrands };

  const [categoryResult, brandResult] = await Promise.all([
    supabase.from("categories").select("id,label,icon_url,sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("brands").select("id,name,category_id,logo_url,sort_order").eq("is_active", true).order("sort_order"),
  ]);

  if (categoryResult.error || brandResult.error) {
    console.error("Unable to load the Supabase product catalog.", categoryResult.error ?? brandResult.error);
    return { categories: fallbackCategories, brands: fallbackBrands };
  }

  return {
    categories: categoryResult.data,
    brands: brandResult.data,
  };
}
