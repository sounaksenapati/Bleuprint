import type { ConstraintData } from "@/lib/types";

export interface ConstraintUpdate {
  path: string;
  oldValue: any;
  newValue: any;
}

export interface PropagationResult {
  updatedConstraints: ConstraintData;
  affectedArtifacts: string[];
  regenerationNeeded: boolean;
}

export function propagateConstraintChange(
  currentPRD: ConstraintData,
  update: ConstraintUpdate
): PropagationResult {
  const updatedPRD: ConstraintData = JSON.parse(JSON.stringify(currentPRD));

  // Apply update
  const keys = update.path.split(".");
  let obj: any = updatedPRD;
  for (let i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = update.newValue;

  // Determine affected artifacts
  const affected = new Set<string>();

  if (update.path.startsWith("constraints.mechanical")) {
    affected.add("cad");
  }

  if (update.path.startsWith("constraints.electrical")) {
    affected.add("cad");
    affected.add("firmware");
    affected.add("bom");
  }

  if (update.path.startsWith("constraints.firmware")) {
    affected.add("firmware");
  }

  if (update.path.includes("battery")) {
    affected.add("cad");
    affected.add("firmware");
    affected.add("bom");
  }

  if (update.path.includes("cost")) {
    affected.add("bom");
  }

  // Secondary constraints: battery size affects enclosure
  if (update.path === "constraints.electrical.battery_mah") {
    const factor = update.newValue / update.oldValue;
    if (factor > 1.5) {
      updatedPRD.constraints.mechanical.dimensions_mm.x = Math.ceil(
        updatedPRD.constraints.mechanical.dimensions_mm.x * 1.2
      );
      updatedPRD.constraints.mechanical.dimensions_mm.z = Math.ceil(
        updatedPRD.constraints.mechanical.dimensions_mm.z * 1.15
      );
    } else if (factor < 0.5) {
      updatedPRD.constraints.mechanical.dimensions_mm.x = Math.ceil(
        updatedPRD.constraints.mechanical.dimensions_mm.x * 0.85
      );
    }
  }

  // Recalculate BOM cost
  let totalCost = 0;
  for (const item of updatedPRD.bom) {
    totalCost += item.quantity * item.estimated_cost;
  }
  updatedPRD.constraints.cost.current_bom_usd = totalCost;

  const affectedArtifacts = Array.from(affected);

  return {
    updatedConstraints: updatedPRD,
    affectedArtifacts,
    regenerationNeeded: affectedArtifacts.length > 0,
  };
}
