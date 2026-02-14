import { callGemini, extractCode } from "../gemini";
import { CAD_SYSTEM_PROMPT } from "../prompts";
import type { ConstraintData } from "@/lib/types";

export async function generateCAD(prd: ConstraintData): Promise<string> {
  const { constraints, bom, product_name } = prd;
  const { dimensions_mm } = constraints.mechanical;
  const { controller, battery_mah } = constraints.electrical;

  const prompt = `Generate OpenSCAD code for: ${product_name}

REQUIREMENTS:
- External dimensions: ${dimensions_mm.x}mm x ${dimensions_mm.y}mm x ${dimensions_mm.z}mm
- Controller: ${controller}
- Battery: ${battery_mah}mAh (${constraints.electrical.battery_type})
- Material: ${constraints.mechanical.material}
- Components to fit:
${bom.map((item) => `  - ${item.component} (x${item.quantity})`).join("\n")}

Create a complete, 3D-printable enclosure with cable management and assembly features. Output ONLY the OpenSCAD code.`;

  const response = await callGemini(prompt, CAD_SYSTEM_PROMPT);
  return extractCode(response, "openscad") || extractCode(response);
}
