"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const LOGO_BUCKET = "brand-logos";
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const MAX_CATEGORY_ICON_SIZE = 2 * 1024 * 1024;

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

type CatalogReturnTo = "admin" | "embedded";

function errorRedirect(message: string, categoryId?: string, returnTo: CatalogReturnTo = "admin"): never {
  const params = new URLSearchParams({ error: message });
  if (categoryId) params.set("category", categoryId);
  const destination = returnTo === "embedded" ? "/admin/catalog?embedded=1" : "/admin";
  const separator = destination.includes("?") ? "&" : "?";
  redirect(`${destination}${separator}${params.toString()}`);
}

function successRedirect(message: string, categoryId?: string, returnTo: CatalogReturnTo = "admin"): never {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/content");
  const params = new URLSearchParams({ message });
  if (categoryId) params.set("category", categoryId);
  const destination = returnTo === "embedded" ? "/admin/catalog?embedded=1" : "/admin";
  const separator = destination.includes("?") ? "&" : "?";
  redirect(`${destination}${separator}${params.toString()}`);
}

function getLogoExtension(file: File) {
  const extensions: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };
  return extensions[file.type];
}

async function uploadLogo(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, file: File) {
  const extension = getLogoExtension(file);
  if (!extension) throw new Error("อัปโหลดได้เฉพาะไฟล์ PNG, JPG หรือ WebP");
  if (file.size > MAX_LOGO_SIZE) throw new Error("ไฟล์โลโก้ต้องมีขนาดไม่เกิน 2 MB");

  const path = `brands/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error("อัปโหลดโลโก้ไม่สำเร็จ กรุณาตรวจสอบ Storage policy");

  return {
    path,
    url: supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl,
  };
}

async function validateCategoryIcon(file: File) {
  if (file.size > MAX_CATEGORY_ICON_SIZE) throw new Error("ไฟล์ไอคอนต้องมีขนาดไม่เกิน 2 MB");

  if (file.type === "image/png") {
    const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    if (!pngSignature.every((byte, index) => signature[index] === byte)) {
      throw new Error("ไฟล์ PNG ไม่ถูกต้อง");
    }
    return "png";
  }

  if (file.type !== "image/svg+xml") throw new Error("อัปโหลดได้เฉพาะไฟล์ SVG หรือ PNG");

  let svg = (await file.text()).trim().replace(/^<\?xml[^>]*>\s*/i, "").replace(/<!--[\s\S]*?-->/g, "");
  if (!/^<svg\b/i.test(svg) || !/<\/svg>\s*$/i.test(svg)) throw new Error("ไฟล์ SVG ไม่ถูกต้อง");
  if (/<!DOCTYPE|<!ENTITY|<\s*(script|foreignObject|iframe|object|embed|style|image|use)\b|\son[a-z]+\s*=|\b(?:href|src)\s*=|\burl\s*\(|javascript\s*:/i.test(svg)) {
    throw new Error("ไฟล์ SVG มีเนื้อหาที่ไม่รองรับ กรุณาใช้ไฟล์ไอคอนแบบพื้นฐาน");
  }

  const allowedTags = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "title", "desc"]);
  for (const match of svg.matchAll(/<\/?\s*([a-z][\w-]*)\b[^>]*>/gi)) {
    if (!allowedTags.has(match[1].toLowerCase())) throw new Error("ไฟล์ SVG มีรูปแบบที่ไม่รองรับ");
  }

  const allowedAttributes = new Set([
    "xmlns", "version", "viewBox", "width", "height", "fill", "stroke", "stroke-width",
    "stroke-linecap", "stroke-linejoin", "fill-rule", "clip-rule", "opacity", "fill-opacity",
    "stroke-opacity", "transform", "d", "x", "y", "x1", "x2", "y1", "y2", "cx", "cy",
    "r", "rx", "ry", "points", "id", "class",
  ]);
  for (const match of svg.matchAll(/\s([a-zA-Z_:][\w:.-]*)\s*=/g)) {
    if (!allowedAttributes.has(match[1])) throw new Error("ไฟล์ SVG มีรูปแบบที่ไม่รองรับ");
  }

  if (/\b(?:javascript|data):/i.test(svg)) throw new Error("ไฟล์ SVG มีลิงก์ที่ไม่รองรับ");
  return "svg";
}

async function uploadCategoryIcon(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  file: File,
) {
  const extension = await validateCategoryIcon(file);
  const path = `categories/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error("อัปโหลดไอคอนไม่สำเร็จ กรุณาตรวจสอบ Storage policy");

  return {
    path,
    url: supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl,
  };
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function addCategory(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const returnTo = field(formData, "return_to") === "embedded" ? "embedded" : "admin";
  const fail = (message: string, categoryId?: string): never => errorRedirect(message, categoryId, returnTo);
  const succeed = (message: string, categoryId?: string): never => successRedirect(message, categoryId, returnTo);
  const label = field(formData, "label");
  const iconValue = formData.get("icon");
  const iconFile = iconValue instanceof File && iconValue.size > 0 ? iconValue : null;
  const selectedCategoryId = field(formData, "filter_category_id");

  if (!label) fail("กรุณากรอกชื่อหมวดสินค้า", selectedCategoryId);
  if (label.length > 60) fail("ชื่อหมวดสินค้าต้องไม่เกิน 60 ตัวอักษร", selectedCategoryId);
  if (!iconFile) fail("กรุณาเลือกไฟล์ไอคอนหมวดสินค้า", selectedCategoryId);

  const { data: categories, error: readError } = await supabase
    .from("categories")
    .select("id,label,sort_order")
    .order("sort_order");

  if (readError) fail("อ่านหมวดสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง", selectedCategoryId);
  const categoryRows = categories ?? [];
  if (categoryRows.length >= 4) fail("เพิ่มได้สูงสุด 4 หมวดสินค้า", selectedCategoryId);
  if (categoryRows.some((category) => category.label.toLocaleLowerCase() === label.toLocaleLowerCase())) {
    fail("มีหมวดสินค้านี้อยู่แล้ว", selectedCategoryId);
  }

  const sortOrder = categoryRows.reduce((max, category) => Math.max(max, category.sort_order), 0) + 1;
  const id = `category-${crypto.randomUUID()}`;
  let uploaded!: { path: string; url: string };
  try {
    uploaded = await uploadCategoryIcon(supabase, iconFile!);
  } catch (error) {
    fail(error instanceof Error ? error.message : "อัปโหลดไอคอนไม่สำเร็จ", selectedCategoryId);
  }

  const { error } = await supabase.from("categories").insert({
    id,
    label,
    icon_url: uploaded.url,
    icon_path: uploaded.path,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) {
    await supabase.storage.from(LOGO_BUCKET).remove([uploaded.path]);
    console.error("Unable to create category", { userId: user.id, error });
    const message = error.message.includes("Maximum of four product categories")
      ? "เพิ่มได้สูงสุด 4 หมวดสินค้า"
      : "เพิ่มหมวดสินค้าไม่สำเร็จ กรุณาตรวจสอบชื่อแล้วลองอีกครั้ง";
    fail(message, selectedCategoryId);
  }

  succeed("เพิ่มหมวดสินค้าแล้ว", id);
}

export async function updateCategory(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const returnTo = field(formData, "return_to") === "embedded" ? "embedded" : "admin";
  const fail = (message: string, categoryId?: string): never => errorRedirect(message, categoryId, returnTo);
  const succeed = (message: string, categoryId?: string): never => successRedirect(message, categoryId, returnTo);
  const id = field(formData, "id");
  const iconValue = formData.get("icon");
  const iconFile = iconValue instanceof File && iconValue.size > 0 ? iconValue : null;
  const selectedCategoryId = field(formData, "filter_category_id") || id;

  if (!id) fail("ไม่พบหมวดสินค้าที่ต้องการแก้ไข", selectedCategoryId);
  if (!iconFile) fail("กรุณาเลือกไฟล์ไอคอนใหม่ก่อนบันทึก", selectedCategoryId);

  const { data: existing, error: readError } = await supabase
    .from("categories")
    .select("id,icon_path")
    .eq("id", id)
    .maybeSingle();
  if (readError || !existing) fail("ไม่พบหมวดสินค้าที่ต้องการแก้ไข", selectedCategoryId);
  const existingCategory = existing!;

  let uploaded!: { path: string; url: string };
  try {
    uploaded = await uploadCategoryIcon(supabase, iconFile!);
  } catch (error) {
    fail(error instanceof Error ? error.message : "อัปโหลดไอคอนไม่สำเร็จ", selectedCategoryId);
  }

  const { error } = await supabase.from("categories").update({ icon_url: uploaded.url, icon_path: uploaded.path }).eq("id", id);
  if (error) {
    await supabase.storage.from(LOGO_BUCKET).remove([uploaded.path]);
    console.error("Unable to update category icon", { userId: user.id, categoryId: id, error });
    fail("บันทึกรูปไอคอนหมวดสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง", selectedCategoryId);
  }

  if (existingCategory.icon_path) await supabase.storage.from(LOGO_BUCKET).remove([existingCategory.icon_path]);

  succeed("บันทึกรูปไอคอนหมวดสินค้าแล้ว", selectedCategoryId);
}

export async function deleteCategory(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const returnTo = field(formData, "return_to") === "embedded" ? "embedded" : "admin";
  const fail = (message: string, categoryId?: string): never => errorRedirect(message, categoryId, returnTo);
  const succeed = (message: string, categoryId?: string): never => successRedirect(message, categoryId, returnTo);
  const id = field(formData, "id");
  const selectedCategoryId = field(formData, "filter_category_id");
  if (!id) fail("ไม่พบหมวดสินค้าที่ต้องการลบ", selectedCategoryId);

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id,label,icon_path")
    .eq("id", id)
    .maybeSingle();
  if (categoryError || !category) fail("ไม่พบหมวดสินค้าที่ต้องการลบ", selectedCategoryId);
  const categoryToDelete = category!;

  const { count, error: brandCountError } = await supabase
    .from("brands")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if (brandCountError) fail("ตรวจสอบแบรนด์ในหมวดนี้ไม่สำเร็จ", selectedCategoryId);
  if ((count ?? 0) > 0) fail("ลบหมวดนี้ไม่ได้ กรุณาย้ายหรือลบแบรนด์ในหมวดก่อน", selectedCategoryId);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("Unable to delete category", { userId: user.id, categoryId: id, error });
    fail("ลบหมวดสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง", selectedCategoryId);
  }

  if (categoryToDelete.icon_path) await supabase.storage.from(LOGO_BUCKET).remove([categoryToDelete.icon_path]);

  const { data: remainingCategories } = await supabase
    .from("categories")
    .select("id")
    .order("sort_order")
    .limit(1);
  succeed("ลบหมวดสินค้าแล้ว", remainingCategories?.[0]?.id);
}

export async function addBrand(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const returnTo = field(formData, "return_to") === "embedded" ? "embedded" : "admin";
  const fail = (message: string, categoryId?: string): never => errorRedirect(message, categoryId, returnTo);
  const succeed = (message: string, categoryId?: string): never => successRedirect(message, categoryId, returnTo);
  const name = field(formData, "name");
  const categoryId = field(formData, "category_id");
  const sortOrder = Number(field(formData, "sort_order") || 0);
  const file = formData.get("logo");
  const logoFile = file instanceof File ? file : null;

  if (!name || !categoryId) fail("กรุณากรอกชื่อแบรนด์และเลือกหมวดสินค้า", categoryId);
  if (!logoFile || logoFile.size === 0) errorRedirect("กรุณาเลือกไฟล์โลโก้", categoryId, returnTo);
  if (!Number.isInteger(sortOrder) || sortOrder < 0) fail("ลำดับต้องเป็นเลขศูนย์หรือจำนวนเต็มบวก", categoryId);

  let uploaded!: { path: string; url: string };
  try {
    uploaded = await uploadLogo(supabase, logoFile);
  } catch (error) {
    fail(error instanceof Error ? error.message : "อัปโหลดโลโก้ไม่สำเร็จ", categoryId);
  }

  const { error } = await supabase.from("brands").insert({
    name,
    category_id: categoryId,
    logo_url: uploaded.url,
    logo_path: uploaded.path,
    sort_order: sortOrder,
    is_active: field(formData, "is_active") === "on",
  });

  if (error) {
    await supabase.storage.from(LOGO_BUCKET).remove([uploaded.path]);
    console.error("Unable to create brand", { userId: user.id, error });
    fail("บันทึกแบรนด์ไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง", categoryId);
  }

  succeed("เพิ่มแบรนด์แล้ว", categoryId);
}

export async function updateBrand(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const returnTo = field(formData, "return_to") === "embedded" ? "embedded" : "admin";
  const fail = (message: string, categoryId?: string): never => errorRedirect(message, categoryId, returnTo);
  const succeed = (message: string, categoryId?: string): never => successRedirect(message, categoryId, returnTo);
  const id = field(formData, "id");
  const name = field(formData, "name");
  const categoryId = field(formData, "category_id");
  const filterCategoryId = field(formData, "filter_category_id");
  const sortOrder = Number(field(formData, "sort_order") || 0);
  const file = formData.get("logo");

  if (!id || !name || !categoryId) fail("ข้อมูลแบรนด์ไม่ครบ", filterCategoryId);
  if (!Number.isInteger(sortOrder) || sortOrder < 0) fail("ลำดับต้องเป็นเลขศูนย์หรือจำนวนเต็มบวก", filterCategoryId);

  const { data: existing, error: readError } = await supabase
    .from("brands")
    .select("id,logo_path")
    .eq("id", id)
    .maybeSingle();

  if (readError || !existing) fail("ไม่พบแบรนด์ที่ต้องการแก้ไข", filterCategoryId);
  const existingBrand = existing!;

  let uploaded: { path: string; url: string } | null = null;
  if (file instanceof File && file.size > 0) {
    try {
      uploaded = await uploadLogo(supabase, file);
    } catch (error) {
      fail(error instanceof Error ? error.message : "อัปโหลดโลโก้ไม่สำเร็จ", filterCategoryId);
    }
  }

  const updateData = {
    name,
    category_id: categoryId,
    sort_order: sortOrder,
    is_active: field(formData, "is_active") === "on",
    ...(uploaded ? { logo_url: uploaded.url, logo_path: uploaded.path } : {}),
  };

  const { error } = await supabase.from("brands").update(updateData).eq("id", id);
  if (error) {
    if (uploaded) await supabase.storage.from(LOGO_BUCKET).remove([uploaded.path]);
    console.error("Unable to update brand", { userId: user.id, error });
    fail("แก้ไขแบรนด์ไม่สำเร็จ กรุณาลองอีกครั้ง", filterCategoryId);
  }

  if (uploaded && existingBrand.logo_path) {
    await supabase.storage.from(LOGO_BUCKET).remove([existingBrand.logo_path]);
  }

  succeed("บันทึกการแก้ไขแล้ว", categoryId);
}

export async function deleteBrand(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const returnTo = field(formData, "return_to") === "embedded" ? "embedded" : "admin";
  const fail = (message: string, categoryId?: string): never => errorRedirect(message, categoryId, returnTo);
  const succeed = (message: string, categoryId?: string): never => successRedirect(message, categoryId, returnTo);
  const id = field(formData, "id");
  const filterCategoryId = field(formData, "filter_category_id");
  if (!id) fail("ไม่พบรหัสแบรนด์", filterCategoryId);

  const { data: existing, error: readError } = await supabase
    .from("brands")
    .select("id,logo_path")
    .eq("id", id)
    .maybeSingle();

  if (readError || !existing) fail("ไม่พบแบรนด์ที่ต้องการลบ", filterCategoryId);
  const existingBrand = existing!;

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) {
    console.error("Unable to delete brand", { userId: user.id, error });
    fail("ลบแบรนด์ไม่สำเร็จ กรุณาลองอีกครั้ง", filterCategoryId);
  }

  if (existingBrand.logo_path) {
    await supabase.storage.from(LOGO_BUCKET).remove([existingBrand.logo_path]);
  }

  succeed("ลบแบรนด์แล้ว", filterCategoryId);
}
