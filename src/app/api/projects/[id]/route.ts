import { NextResponse } from "next/server";
import { getOwnedProject } from "@/lib/supabase/authorize-project";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, project: ownedProject } = await getOwnedProject(id);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ownedProject) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: constraint } = await supabase
    .from("constraints")
    .select("*")
    .eq("project_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: artifacts } = await supabase
    .from("artifacts")
    .select("*")
    .eq("project_id", id)
    .order("generated_at", { ascending: false });

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
  const { supabase, user, project } = await getOwnedProject(id);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const updates: { name?: string; description?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };

  if ("name" in input) {
    if (typeof input.name !== "string" || !input.name.trim() || input.name.length > 120) {
      return NextResponse.json({ error: "Name must be between 1 and 120 characters" }, { status: 400 });
    }
    updates.name = input.name.trim();
  }
  if ("description" in input) {
    if (typeof input.description !== "string" || input.description.length > 2000) {
      return NextResponse.json({ error: "Description must be 2000 characters or fewer" }, { status: 400 });
    }
    updates.description = input.description;
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "No supported fields supplied" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Unable to update project" }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, project } = await getOwnedProject(id);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Unable to delete project" }, { status: 500 });
  return NextResponse.json({ success: true });
}
