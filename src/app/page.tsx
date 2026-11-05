import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LandingClient } from "@/components/landing/LandingClient";

export default async function HomePage() {
  // Public marketing content should render even before a Supabase project is connected.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <LandingClient />;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/projects");

  return <LandingClient />;
}
