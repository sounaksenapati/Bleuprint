import type { ConstraintData } from "@/lib/types";

export function generateBOM(prd: ConstraintData): string {
  const { bom } = prd;

  let csv = "Component,Quantity,Unit Cost,Total Cost,Purpose,Datasheet\n";
  let totalCost = 0;

  for (const item of bom) {
    const lineCost = item.quantity * item.estimated_cost;
    totalCost += lineCost;
    csv += `"${item.component}",${item.quantity},$${item.estimated_cost.toFixed(2)},$${lineCost.toFixed(2)},"${item.purpose}","${item.datasheet_url || "N/A"}"\n`;
  }

  csv += `\nTOTAL,,,$${totalCost.toFixed(2)},,\n`;
  return csv;
}
