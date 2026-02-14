"use client";

import { useWorkspaceStore, type ViewerTab } from "@/store/workspace-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Code2, ListOrdered, CircuitBoard, FileText, type LucideIcon } from "lucide-react";
import { CADViewer } from "./viewers/CADViewer";
import { FirmwareViewer } from "./viewers/FirmwareViewer";
import { BOMViewer } from "./viewers/BOMViewer";
import { PRDViewer } from "./viewers/PRDViewer";
import { SchematicViewer } from "./viewers/SchematicViewer";

const tabs: { value: ViewerTab; label: string; icon: LucideIcon }[] = [
  { value: "3d", label: "3D Model", icon: Box },
  { value: "firmware", label: "Firmware", icon: Code2 },
  { value: "bom", label: "BOM", icon: ListOrdered },
  { value: "schematic", label: "Schematic", icon: CircuitBoard },
  { value: "prd", label: "PRD", icon: FileText },
];

export function ViewerTabs() {
  const { activeTab, setActiveTab, generatingArtifacts } =
    useWorkspaceStore();

  return (
    <div className="flex h-full flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ViewerTab)}
        className="flex h-full flex-col"
      >
        <div className="border-b border-border/50 px-2">
          <TabsList className="h-10 bg-transparent">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5 text-xs data-[state=active]:bg-accent"
                >
                  <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {generatingArtifacts.has(
                  tab.value === "3d" ? "cad" : tab.value
                ) && (
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                )}
              </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="3d" className="mt-0 h-full">
            <CADViewer />
          </TabsContent>
          <TabsContent value="firmware" className="mt-0 h-full">
            <FirmwareViewer />
          </TabsContent>
          <TabsContent value="bom" className="mt-0 h-full">
            <BOMViewer />
          </TabsContent>
          <TabsContent value="schematic" className="mt-0 h-full">
            <SchematicViewer />
          </TabsContent>
          <TabsContent value="prd" className="mt-0 h-full">
            <PRDViewer />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
