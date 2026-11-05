import { NextResponse } from "next/server";
import { getOwnedProject } from "@/lib/supabase/authorize-project";
import { propagateConstraintChange } from "@/lib/constraint-engine/propagate";
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

  const input = body && typeof body === "object" && !Array.isArray(body)
    ? body as Record<string, unknown>
    : {};
  const { constraintPath, newValue } = input;

  const textLimits: Record<string, number> = {
    "constraints.mechanical.material": 120,
    "constraints.electrical.controller": 120,
    "constraints.electrical.battery_type": 120,
    "constraints.firmware.platform": 120,
  };
  const numericLimits: Record<string, { min: number; max: number }> = {
    "constraints.mechanical.dimensions_mm.x": { min: 1, max: 10000 },
    "constraints.mechanical.dimensions_mm.y": { min: 1, max: 10000 },
    "constraints.mechanical.dimensions_mm.z": { min: 1, max: 10000 },
    "constraints.mechanical.weight_target_g": { min: 1, max: 10000000 },
    "constraints.electrical.battery_mah": { min: 1, max: 1000000 },
    "constraints.electrical.voltage": { min: 0.1, max: 1000 },
    "constraints.cost.target_usd": { min: 0, max: 10000000 },
  };

  if (typeof constraintPath !== "string") {
    return NextResponse.json({ error: "A constraint path is required" }, { status: 400 });
  }

  const textLimit = textLimits[constraintPath];
  const numericLimit = numericLimits[constraintPath];
  if (!textLimit && !numericLimit) {
    return NextResponse.json({ error: "Unsupported constraint path" }, { status: 400 });
  }

  if (textLimit && (typeof newValue !== "string" || !newValue.trim() || newValue.length > textLimit)) {
    return NextResponse.json({ error: "Invalid text value for this constraint" }, { status: 400 });
  }
  if (numericLimit && (
    typeof newValue !== "number" ||
    !Number.isFinite(newValue) ||
    newValue < numericLimit.min ||
    newValue > numericLimit.max
  )) {
    return NextResponse.json({ error: "Numeric value is outside the permitted range" }, { status: 400 });
  }

  try {
    const { data: currentConstraint, error: constraintReadError } = await supabase
      .from("constraints")
      .select("*")
      .eq("project_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (constraintReadError) throw new Error("Unable to load current constraints");
    if (!currentConstraint) {
      return NextResponse.json({ error: "No constraints found" }, { status: 404 });
    }

    const currentPRD = currentConstraint.constraint_data;
    const keys = constraintPath.split(".");
    let oldValue: any = currentPRD;
    for (const key of keys) oldValue = oldValue?.[key];
    if (oldValue === undefined || typeof oldValue !== typeof newValue) {
      return NextResponse.json({ error: "Constraint does not exist or has an incompatible value type" }, { status: 400 });
    }

    const result = propagateConstraintChange(currentPRD, {
      path: constraintPath,
      oldValue,
      newValue,
    });

    const newVersion = currentConstraint.version + 1;
    const { error: versionError } = await supabase.from("constraints").insert({
      project_id: id,
      constraint_data: result.updatedConstraints,
      version: newVersion,
    });
    if (versionError) throw new Error("Unable to save updated constraints");

    const regenerated: Record<string, string> = {};
    const promises: Promise<void>[] = [];

    if (result.affectedArtifacts.includes("cad")) {
      promises.push(generateCAD(result.updatedConstraints).then((code) => { regenerated.cad = code; }));
    }
    if (result.affectedArtifacts.includes("firmware")) {
      promises.push(generateFirmware(result.updatedConstraints).then((code) => { regenerated.firmware = code; }));
    }
    if (result.affectedArtifacts.includes("bom")) {
      regenerated.bom = generateBOM(result.updatedConstraints);
    }

    await Promise.all(promises);

    const inserts = Object.entries(regenerated).map(([type, content]) => ({
      project_id: id,
      constraint_version: newVersion,
      artifact_type: type,
      content,
    }));
    if (inserts.length > 0) {
      const { error: artifactError } = await supabase.from("artifacts").insert(inserts);
      if (artifactError) throw new Error("Unable to save regenerated artifacts");
    }

    await supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      updatedConstraints: result.updatedConstraints,
      regeneratedArtifacts: regenerated,
      affectedArtifacts: result.affectedArtifacts,
      version: newVersion,
    });
  } catch (error) {
    console.error("Constraint update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update constraint" },
      { status: 500 }
    );
  }
}
