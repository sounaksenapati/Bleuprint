import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generatePRD } from "@/lib/ai/generators/prd";
import { generateCAD } from "@/lib/ai/generators/cad";
import { generateFirmware } from "@/lib/ai/generators/firmware";
import { generateBOM } from "@/lib/ai/generators/bom";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { intent } = await request.json();

  try {
    // 1. Generate PRD
    const prd = await generatePRD(intent);

    // 2. Save constraints
    const { data: constraint } = await supabase
      .from("constraints")
      .insert({
        project_id: id,
        constraint_data: prd,
        version: 1,
      })
      .select()
      .single();

    // 3. Update project name/description from PRD
    await supabase
      .from("projects")
      .update({
        name: prd.product_name,
        description: prd.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // 4. Generate all artifacts in parallel
    const [cadCode, firmwareCode, bomCSV] = await Promise.all([
      generateCAD(prd),
      generateFirmware(prd),
      generateBOM(prd),
    ]);

    // 5. Save artifacts
    const artifactInserts = [
      {
        project_id: id,
        constraint_version: 1,
        artifact_type: "prd" as const,
        content: JSON.stringify(prd, null, 2),
      },
      {
        project_id: id,
        constraint_version: 1,
        artifact_type: "cad" as const,
        content: cadCode,
      },
      {
        project_id: id,
        constraint_version: 1,
        artifact_type: "firmware" as const,
        content: firmwareCode,
      },
      {
        project_id: id,
        constraint_version: 1,
        artifact_type: "bom" as const,
        content: bomCSV,
      },
    ];

    await supabase.from("artifacts").insert(artifactInserts);

    // 6. Save initial chat messages
    await supabase.from("chat_messages").insert([
      { project_id: id, role: "user", content: intent },
      {
        project_id: id,
        role: "assistant",
        content: `I've generated a complete design for **${prd.product_name}**!\n\n${prd.description}\n\nCheck the tabs to see the 3D enclosure, firmware code, and bill of materials. Use the constraint panel on the right to adjust parameters, or chat with me to refine the design.`,
      },
    ]);

    return NextResponse.json({
      success: true,
      prd,
      artifacts: { cad: cadCode, firmware: firmwareCode, bom: bomCSV },
    });
  } catch (error: any) {
    console.error("PRD generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PRD" },
      { status: 500 }
    );
  }
}
