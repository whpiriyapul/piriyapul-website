import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentAdmin() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("role,email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) return null;

  return { supabase, user, membership };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
