"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { FileText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";

export function PRDViewer() {
  const { artifacts, generatingArtifacts } = useWorkspaceStore();
  const prdRaw = artifacts.prd;
  const isGenerating = generatingArtifacts.has("prd");

  const prd = useMemo(() => {
    if (!prdRaw) return null;
    try {
      return JSON.parse(prdRaw);
    } catch {
      return null;
    }
  }, [prdRaw]);

  if (isGenerating) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating PRD...</p>
        </div>
      </div>
    );
  }

  if (!prd) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No PRD generated yet</p>
          <p className="text-xs text-muted-foreground/70">Chat to generate a product requirements document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">Product Requirements Document</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(prd, null, 2));
            toast.success("PRD copied!");
          }}
        >
          <Copy className="h-3 w-3" />
          Copy JSON
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4 text-sm">
          {prd.product_name && (
            <div>
              <h3 className="font-semibold">{prd.product_name}</h3>
              {prd.description && <p className="mt-1 text-muted-foreground">{prd.description}</p>}
            </div>
          )}

          {prd.core_specs && (
            <Section title="Core Specifications">
              <KeyValueList data={prd.core_specs} />
            </Section>
          )}

          {prd.features && Array.isArray(prd.features) && (
            <Section title="Features">
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                {prd.features.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </Section>
          )}

          {prd.constraints && (
            <Section title="Constraints">
              <KeyValueList data={prd.constraints} />
            </Section>
          )}

          {prd.power_budget && (
            <Section title="Power Budget">
              <KeyValueList data={prd.power_budget} />
            </Section>
          )}

          {/* Fallback: render any other top-level keys */}
          {Object.entries(prd)
            .filter(
              ([k]) =>
                !["product_name", "description", "core_specs", "features", "constraints", "power_budget"].includes(k)
            )
            .map(([key, value]) => (
              <Section key={key} title={key.replace(/_/g, " ")}>
                {typeof value === "object" ? (
                  <pre className="overflow-x-auto rounded bg-muted/50 p-2 text-xs">{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  <p className="text-muted-foreground">{String(value)}</p>
                )}
              </Section>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/50 p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {children}
    </div>
  );
}

function KeyValueList({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{k.replace(/_/g, " ")}</span>
          <span className="font-medium">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}
