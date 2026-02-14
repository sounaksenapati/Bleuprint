"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { ListOrdered, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BOMItem {
  component: string;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  supplier: string;
  in_stock: boolean;
}

function parseCSV(csv: string): BOMItem[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    return {
      component: cols[0] || "",
      description: cols[1] || "",
      quantity: parseInt(cols[2]) || 1,
      unit_cost: parseFloat(cols[3]) || 0,
      total_cost: parseFloat(cols[4]) || 0,
      supplier: cols[5] || "",
      in_stock: cols[6]?.toLowerCase() === "yes" || cols[6]?.toLowerCase() === "true",
    };
  });
}

export function BOMViewer() {
  const { artifacts, generatingArtifacts } = useWorkspaceStore();
  const bomCSV = artifacts.bom;
  const isGenerating = generatingArtifacts.has("bom");

  const items = useMemo(() => (bomCSV ? parseCSV(bomCSV) : []), [bomCSV]);
  const total = useMemo(() => items.reduce((s, i) => s + i.total_cost, 0), [items]);

  if (isGenerating) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating BOM...</p>
        </div>
      </div>
    );
  }

  if (!bomCSV) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <ListOrdered className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No BOM generated yet</p>
          <p className="text-xs text-muted-foreground/70">Generate a design to see the bill of materials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">{items.length} components</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(bomCSV);
              toast.success("BOM copied!");
            }}
          >
            <Copy className="h-3 w-3" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => {
              const blob = new Blob([bomCSV], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "bom.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-3 w-3" />
            CSV
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Component</th>
                <th className="pb-2 pr-3 font-medium">Description</th>
                <th className="pb-2 pr-3 font-medium text-center">Qty</th>
                <th className="pb-2 pr-3 font-medium text-right">Unit</th>
                <th className="pb-2 pr-3 font-medium text-right">Total</th>
                <th className="pb-2 pr-3 font-medium">Supplier</th>
                <th className="pb-2 font-medium text-center">Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-2 pr-3 font-medium">{item.component}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{item.description}</td>
                  <td className="py-2 pr-3 text-center">{item.quantity}</td>
                  <td className="py-2 pr-3 text-right">${item.unit_cost.toFixed(2)}</td>
                  <td className="py-2 pr-3 text-right">${item.total_cost.toFixed(2)}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{item.supplier}</td>
                  <td className="py-2 text-center">
                    {item.in_stock ? (
                      <span className="text-emerald-500">&#10003;</span>
                    ) : (
                      <span className="text-amber-500">&#8212;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="pt-3" colSpan={4}>
                  Total ({items.length} items)
                </td>
                <td className="pt-3 text-right text-primary">${total.toFixed(2)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
