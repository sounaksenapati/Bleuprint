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

  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const { constraintPath, newValue } = input;
  const allowedPaths = new Set([
    "constraints.mechanical.dimensions_mm.x",
    "constraints.mechanical.dimensions_mm.y",
    "constraints.mechanical.dimensions_mm.z",
    "constraints.mechanical.weight_target_g",
    "constraints.mechanical.material",
    "constraints.electrical.controller",
    "constraints.electrical.battery_mah",
    "constraints.electrical.battery_type",
    "constraints.electrical.voltage",
    "constraints.firmware.platform",
    "constraints.cost.target_usd",
  ]);

  if (typeof constraintPath !== "string" || !allowedPaths.has(constraintPath)) {
    return NextResponse.json({ error: "Unsupported constraint path" }, { status: 400 });
  }
  if (
    !(
      typeof newValue === "string" &&
      newValue.length <= 200 ||
      typeof newValue === "number" &&
      Number.isFinite(newValue) &&
      newValue >= 0
    )
  ) {
    return NextResponse.json({ error: "Invalid constraint value" }, { status: 400 });
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
