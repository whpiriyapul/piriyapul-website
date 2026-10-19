"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signInAdmin(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=not-configured");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/admin/login?error=missing-fields");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=invalid-credentials");

  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = user
    ? await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle()
    : { data: null };

  if (!membership) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-authorized");
  }

  redirect("/admin");
}
