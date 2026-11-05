import { NextResponse } from "next/server";
import { getOwnedProject } from "@/lib/supabase/authorize-project";
import { generatePRD } from "@/lib/ai/generators/prd";
import { generateCAD } from "@/lib/ai/generators/cad";
import { generateFirmware } from "@/lib/ai/generators/firmware";
import { generateBOM } from "@/lib/ai/generators/bom";

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

  const intent =
    body && typeof body === "object" && "intent" in body
      ? (body as { intent?: unknown }).intent
      : undefined;

  if (typeof intent !== "string" || !intent.trim() || intent.length > 10000) {
    return NextResponse.json(
      { error: "Intent must be between 1 and 10000 characters" },
      { status: 400 }
    );
  }

  try {
    const prd = await generatePRD(intent.trim());

    if (!prd || typeof prd !== "object" || !prd.product_name || !prd.description) {
      throw new Error("The AI returned an incomplete product specification");
    }

    const { data: latestConstraint, error: latestConstraintError } = await supabase
      .from("constraints")
      .select("version")
      .eq("project_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestConstraintError) throw new Error("Unable to read project version");
    const version = (latestConstraint?.version || 0) + 1;

    const { error: constraintError } = await supabase.from("constraints").insert({
      project_id: id,
      constraint_data: prd,
      version,
    });
    if (constraintError) throw new Error("Unable to save generated constraints");

    const [cadCode, firmwareCode, bomCSV] = await Promise.all([
      generateCAD(prd),
      generateFirmware(prd),
      generateBOM(prd),
    ]);

    const artifactInserts = [
      { project_id: id, constraint_version: version, artifact_type: "prd" as const, content: JSON.stringify(prd, null, 2) },
      { project_id: id, constraint_version: version, artifact_type: "cad" as const, content: cadCode },
      { project_id: id, constraint_version: version, artifact_type: "firmware" as const, content: firmwareCode },
      { project_id: id, constraint_version: version, artifact_type: "bom" as const, content: bomCSV },
    ];

    const { error: artifactsError } = await supabase.from("artifacts").insert(artifactInserts);
    if (artifactsError) throw new Error("Unable to save generated artifacts");

    const { error: projectError } = await supabase
      .from("projects")
      .update({
        name: prd.product_name,
        description: prd.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);
    if (projectError) throw new Error("Unable to update project details");

    const { error: messagesError } = await supabase.from("chat_messages").insert([
      { project_id: id, role: "user", content: intent.trim() },
      {
        project_id: id,
        role: "assistant",
        content: `I've generated a first-pass design for **${prd.product_name}**. Treat generated CAD and firmware as drafts until they have been compiled, simulated, and reviewed by a qualified engineer.`,
      },
    ]);
    if (messagesError) throw new Error("Unable to save project conversation");

    return NextResponse.json({
      success: true,
      prd,
      artifacts: { cad: cadCode, firmware: firmwareCode, bom: bomCSV },
      version,
    });
  } catch (error) {
    console.error("PRD generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate PRD" },
      { status: 500 }
    );
  }
}
