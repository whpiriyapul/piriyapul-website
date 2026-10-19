"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function messageRedirect(message: string): never {
  redirect(`/admin/team?message=${encodeURIComponent(message)}`);
}

function errorRedirect(message: string): never {
  redirect(`/admin/team?error=${encodeURIComponent(message)}`);
}

async function requireOwnerAdmin() {
  const admin = await requireAdmin();
  if (admin.membership.role !== "admin") redirect("/admin");
  return admin;
}

export async function inviteAdminUser(formData: FormData) {
  await requireOwnerAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "editor");
  if (!/^\S+@\S+\.\S+$/.test(email)) errorRedirect("กรุณากรอกอีเมลให้ถูกต้อง");
  if (role !== "admin" && role !== "editor") errorRedirect("ไม่พบสิทธิ์ผู้ใช้งานที่เลือก");

  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch {
    errorRedirect("ยังไม่ได้ตั้งค่า SUPABASE_SECRET_KEY ใน .env.local");
  }

  const { data: existing } = await supabase.from("admin_users").select("user_id").ilike("email", email).maybeSingle();
  if (existing) errorRedirect("อีเมลนี้มีสิทธิ์ในระบบแล้ว");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl.replace(/\/$/, "")}/admin/login`,
  });

  if (error || !data.user) {
    console.error("Unable to invite admin user", error);
    errorRedirect("ส่งคำเชิญไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าอีเมลใน Supabase");
  }

  const { error: insertError } = await supabase.from("admin_users").insert({
    user_id: data.user.id,
    email,
    role,
  });

  if (insertError) {
    console.error("Unable to save invited admin user", insertError);
    errorRedirect("ส่งคำเชิญแล้ว แต่บันทึกสิทธิ์ไม่สำเร็จ กรุณาตรวจสอบตาราง admin_users");
  }

  revalidatePath("/admin/team");
  messageRedirect("ส่งคำเชิญแล้ว ผู้ใช้จะได้รับอีเมลจาก Supabase");
}

export async function removeAdminUser(formData: FormData) {
  const current = await requireOwnerAdmin();
  const userId = String(formData.get("user_id") ?? "").trim();
  if (!userId) errorRedirect("ไม่พบผู้ใช้งานที่เลือก");
  if (userId === current.user.id) errorRedirect("ไม่สามารถลบสิทธิ์บัญชีที่กำลังใช้งานอยู่ได้");

  const supabase = createSupabaseServiceClient();
  const { count, error: countError } = await supabase
    .from("admin_users")
    .select("user_id", { count: "exact", head: true });

  if (countError) errorRedirect("ตรวจสอบรายชื่อผู้ดูแลไม่สำเร็จ");
  if ((count ?? 0) <= 1) errorRedirect("ต้องเหลือผู้ดูแลอย่างน้อยหนึ่งบัญชี");

  const { error } = await supabase.from("admin_users").delete().eq("user_id", userId);
  if (error) errorRedirect("เพิกถอนสิทธิ์ไม่สำเร็จ กรุณาลองอีกครั้ง");

  revalidatePath("/admin/team");
  messageRedirect("เพิกถอนสิทธิ์เข้าเว็บแล้ว บัญชี Supabase Auth ยังอยู่และสามารถเชิญกลับได้");
}
