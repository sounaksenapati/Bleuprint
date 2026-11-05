import { NextResponse } from "next/server";
import { getOwnedProject } from "@/lib/supabase/authorize-project";
import { callGemini, extractJSON } from "@/lib/ai/gemini";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(
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

  const message =
    body && typeof body === "object" && "message" in body
      ? (body as { message?: unknown }).message
      : undefined;

  if (typeof message !== "string" || !message.trim() || message.length > 8000) {
    return NextResponse.json(
      { error: "Message must be between 1 and 8000 characters" },
      { status: 400 }
    );
  }

  try {
    const { error: saveUserError } = await supabase.from("chat_messages").insert({
      project_id: id,
      role: "user",
      content: message.trim(),
    });
    if (saveUserError) throw new Error("Unable to save message");

    const { data: constraint } = await supabase
      .from("constraints")
      .select("constraint_data")
      .eq("project_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    const contextPrompt = `Current design state:
${JSON.stringify(constraint?.constraint_data || {}, null, 2)}

Recent conversation:
${(history || [])
  .reverse()
  .map((m) => `${m.role}: ${m.content}`)
  .join("\n")}

User says: ${message.trim()}`;

    const response = await callGemini(contextPrompt, CHAT_SYSTEM_PROMPT);

    const { error: saveAssistantError } = await supabase.from("chat_messages").insert({
      project_id: id,
      role: "assistant",
      content: response,
    });
    if (saveAssistantError) throw new Error("Unable to save assistant response");

    let updates = null;
    try {
      if (response.includes('"updates"')) {
        const jsonPart = extractJSON(response);
        updates = jsonPart.updates;
      }
    } catch {
      // A response without structured updates is still a valid chat response.
    }

    return NextResponse.json({ response, updates });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process message" },
      { status: 500 }
    );
  }
}
