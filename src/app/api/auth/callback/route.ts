import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Upsert profile
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }
    }
  }

  return NextResponse.redirect(new URL("/projects", request.url));
}
