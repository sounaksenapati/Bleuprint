"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { Code2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
      <div className="text-sm text-muted-foreground">Loading editor...</div>
    </div>
  ),
});

export function FirmwareViewer() {
  const { artifacts, generatingArtifacts } = useWorkspaceStore();
  const firmware = artifacts.firmware;
  const isGenerating = generatingArtifacts.has("firmware");

  if (isGenerating) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating firmware...</p>
        </div>
      </div>
    );
  }

  if (!firmware) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <Code2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No firmware generated yet</p>
          <p className="text-xs text-muted-foreground/70">Generate a design to see firmware code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">main.cpp</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(firmware);
              toast.success("Code copied!");
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
              const blob = new Blob([firmware], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "main.cpp";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-3 w-3" />
            .ino
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language="cpp"
          theme="vs-dark"
          value={firmware}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 8 },
          }}
        />
      </div>
    </div>
  );
}
