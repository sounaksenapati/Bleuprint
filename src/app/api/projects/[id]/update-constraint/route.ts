import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { propagateConstraintChange } from "@/lib/constraint-engine/propagate";
import { generateCAD } from "@/lib/ai/generators/cad";
import { generateFirmware } from "@/lib/ai/generators/firmware";
import { generateBOM } from "@/lib/ai/generators/bom";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { constraintPath, newValue } = await request.json();

  try {
    // 1. Fetch current constraints
    const { data: currentConstraint } = await supabase
      .from("constraints")
      .select("*")
      .eq("project_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (!currentConstraint) {
      return NextResponse.json({ error: "No constraints found" }, { status: 404 });
    }

    const currentPRD = currentConstraint.constraint_data;

    // 2. Get old value
    const keys = constraintPath.split(".");
    let oldValue: any = currentPRD;
    for (const key of keys) oldValue = oldValue?.[key];

    // 3. Propagate
    const result = propagateConstraintChange(currentPRD, {
      path: constraintPath,
      oldValue,
      newValue,
    });

    // 4. Save new version
    const newVersion = currentConstraint.version + 1;
    await supabase.from("constraints").insert({
      project_id: id,
      constraint_data: result.updatedConstraints,
      version: newVersion,
    });

    // 5. Regenerate affected artifacts
    const regenerated: Record<string, string> = {};

    const promises: Promise<void>[] = [];
    if (result.affectedArtifacts.includes("cad")) {
      promises.push(
        generateCAD(result.updatedConstraints).then((code) => {
          regenerated.cad = code;
        })
      );
    }
    if (result.affectedArtifacts.includes("firmware")) {
      promises.push(
        generateFirmware(result.updatedConstraints).then((code) => {
          regenerated.firmware = code;
        })
      );
    }
    if (result.affectedArtifacts.includes("bom")) {
      regenerated.bom = generateBOM(result.updatedConstraints);
    }

    await Promise.all(promises);

    // 6. Save artifacts
    const inserts = Object.entries(regenerated).map(([type, content]) => ({
      project_id: id,
      constraint_version: newVersion,
      artifact_type: type,
      content,
    }));
    if (inserts.length > 0) await supabase.from("artifacts").insert(inserts);

    // Update project timestamp
    await supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      updatedConstraints: result.updatedConstraints,
      regeneratedArtifacts: regenerated,
      affectedArtifacts: result.affectedArtifacts,
    });
  } catch (error: any) {
    console.error("Constraint update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update constraint" },
      { status: 500 }
    );
  }
}
