import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get latest constraint
  const { data: constraint } = await supabase
    .from("constraints")
    .select("*")
    .eq("project_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  // Get latest artifacts
  const { data: artifacts } = await supabase
    .from("artifacts")
    .select("*")
    .eq("project_id", id)
    .order("generated_at", { ascending: false });

  // Get chat messages
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    project,
    constraint,
    artifacts: artifacts || [],
    messages: messages || [],
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("projects")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
