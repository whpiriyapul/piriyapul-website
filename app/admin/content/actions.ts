"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { toDatabaseJson } from "@/lib/site-content";
import { validateSiteContentJson } from "@/lib/validate-site-content";

const SITE_MEDIA_BUCKET = "site-media";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function fileExtension(mimeType: string) {
  const extensions: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };
  return extensions[mimeType];
}

export async function createSiteImageUploadToken(
  mimeType: string,
  fileSize: number,
  section: string,
): Promise<{ ok: boolean; url?: string; path?: string; token?: string; message: string }> {
  const { supabase } = await requireAdmin();
  const extension = fileExtension(mimeType);
  const validSection = /^[a-z-]{1,50}$/.test(section) ? section : "content";
  if (!extension) return { ok: false, message: "รองรับเฉพาะรูป PNG, JPG หรือ WebP" };
  if (!Number.isFinite(fileSize) || fileSize <= 0) return { ok: false, message: "ไฟล์รูปภาพว่างเปล่า" };
  if (fileSize > MAX_IMAGE_BYTES) return { ok: false, message: "รูปต้องมีขนาดไม่เกิน 10 MB" };

  const path = `${validSection}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage.from(SITE_MEDIA_BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error || !data) {
    console.error("Unable to create signed site image upload", error);
    return { ok: false, message: "อัปโหลดรูปไม่สำเร็จ กรุณาตรวจสอบ Storage policy" };
  }

  return {
    ok: true,
    url: supabase.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl,
    path: data.path,
    token: data.token,
    message: "ได้ลิงก์อัปโหลดแล้ว",
  };
}

export async function saveSiteDraft(raw: string): Promise<{ ok: boolean; message: string }> {
  const { supabase, user } = await requireAdmin();
  let content;
  try {
    content = validateSiteContentJson(raw);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "ข้อมูลไม่ถูกต้อง" };
  }

  const { error } = await supabase.from("site_content").upsert({
    id: "draft",
    content: toDatabaseJson(content),
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Unable to save site content draft", error);
    return { ok: false, message: "บันทึกร่างไม่สำเร็จ กรุณาตรวจสอบว่าได้สร้างตาราง site_content แล้ว" };
  }

  revalidatePath("/admin/content");
  return { ok: true, message: "บันทึกร่างแล้ว" };
}

export async function publishSiteDraft(raw: string): Promise<{ ok: boolean; message: string }> {
  const { supabase, user } = await requireAdmin();
  let content;
  try {
    content = validateSiteContentJson(raw);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "ข้อมูลไม่ถูกต้อง" };
  }

  const payload = {
    content: toDatabaseJson(content),
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };
  const { error: draftError } = await supabase.from("site_content").upsert({ id: "draft", ...payload });
  if (draftError) {
    console.error("Unable to save draft before publishing", draftError);
    return { ok: false, message: "บันทึกร่างไม่สำเร็จ จึงยังเผยแพร่ไม่ได้" };
  }

  const { error: publishError } = await supabase.from("site_content").upsert({ id: "published", ...payload });
  if (publishError) {
    console.error("Unable to publish site content", publishError);
    return { ok: false, message: "บันทึกร่างแล้ว แต่เผยแพร่ไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/content");
  return { ok: true, message: "เผยแพร่เว็บไซต์แล้ว" };
}
