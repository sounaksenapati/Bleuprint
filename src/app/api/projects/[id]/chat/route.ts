import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { callGemini, extractJSON } from "@/lib/ai/gemini";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { message } = await request.json();

  try {
    // Save user message
    await supabase.from("chat_messages").insert({
      project_id: id,
      role: "user",
      content: message,
    });

    // Get current constraint context
    const { data: constraint } = await supabase
      .from("constraints")
      .select("constraint_data")
      .eq("project_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    // Get recent chat history
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

User says: ${message}`;

    const response = await callGemini(contextPrompt, CHAT_SYSTEM_PROMPT);

    // Save assistant response
    await supabase.from("chat_messages").insert({
      project_id: id,
      role: "assistant",
      content: response,
    });

    // Try to extract constraint updates if present
    let updates = null;
    try {
      if (response.includes('"updates"')) {
        const jsonPart = extractJSON(response);
        updates = jsonPart.updates;
      }
    } catch {
      // No updates in response
    }

    return NextResponse.json({ response, updates });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process message" },
      { status: 500 }
    );
  }
}
