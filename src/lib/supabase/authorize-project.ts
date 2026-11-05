import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Resolves the current authenticated user and verifies ownership of a project.
 * Call this from every project-scoped API route before reading or mutating data.
 */
export async function getOwnedProject(projectId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, project: null };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, project };
}
