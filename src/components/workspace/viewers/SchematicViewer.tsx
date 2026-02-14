"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { CircuitBoard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";

export function SchematicViewer() {
  const { constraints, generatingArtifacts } = useWorkspaceStore();
  const isGenerating = generatingArtifacts.has("schematic");

  const elec = constraints?.constraints?.electrical;
  const controllerName = elec?.controller || "MCU";

  const connections = useMemo(() => {
    if (!constraints?.constraints?.electrical) return [];
    const e = constraints.constraints.electrical;
    const ctrl = e.controller || "MCU";
    const conns: { from: string; to: string; bus: string }[] = [];

    if (e.sensors) {
      e.sensors.forEach((s: string) => {
        conns.push({ from: ctrl, to: s, bus: "I2C/SPI" });
      });
    }
    if (e.battery_mah) {
      conns.push({ from: `Battery ${e.battery_mah}mAh`, to: "LDO/Regulator", bus: "Power" });
      conns.push({ from: "LDO/Regulator", to: ctrl, bus: `${e.voltage}V` });
    }
    if (e.actuators) {
      e.actuators.forEach((a: string) => {
        conns.push({ from: ctrl, to: a, bus: "GPIO/PWM" });
      });
    }
    return conns;
  }, [constraints]);

  if (isGenerating) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating schematic...</p>
        </div>
      </div>
    );
  }

  if (!constraints || connections.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <CircuitBoard className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No schematic data yet</p>
          <p className="text-xs text-muted-foreground/70">Generate a design to see the block diagram</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/50 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">Block Diagram / Connection Map</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <svg viewBox="0 0 600 400" className="w-full" style={{ maxHeight: "calc(100% - 16px)" }}>
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="600" height="400" fill="url(#grid)" />

            {/* Controller block in center */}
            <rect x="230" y="160" width="140" height="60" rx="8" fill="hsl(var(--primary)/0.15)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x="300" y="195" textAnchor="middle" className="fill-foreground text-xs font-semibold">
              {controllerName}
            </text>

            {/* Connection blocks */}
            {connections.map((conn, i) => {
              const total = connections.length;
              const isLeft = i < total / 2;
              const sideIndex = isLeft ? i : i - Math.ceil(total / 2);
              const sideTotal = isLeft ? Math.ceil(total / 2) : total - Math.ceil(total / 2);
              const yOffset = 80 + (sideIndex * 260) / Math.max(sideTotal, 1);
              const blockX = isLeft ? 20 : 440;
              const blockW = 130;
              const blockH = 40;
              const blockY = yOffset;

              const lineX1 = isLeft ? blockX + blockW : blockX;
              const lineX2 = isLeft ? 230 : 370;

              return (
                <g key={i}>
                  <rect x={blockX} y={blockY} width={blockW} height={blockH} rx="6" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
                  <text x={blockX + blockW / 2} y={blockY + blockH / 2 + 4} textAnchor="middle" className="fill-foreground" style={{ fontSize: "10px" }}>
                    {conn.from === controllerName ? conn.to : conn.from}
                  </text>
                  <line x1={lineX1} y1={blockY + blockH / 2} x2={lineX2} y2={190} stroke="hsl(var(--primary)/0.5)" strokeWidth="1" strokeDasharray="4 2" />
                  <text
                    x={(lineX1 + lineX2) / 2}
                    y={(blockY + blockH / 2 + 190) / 2 - 4}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: "8px" }}
                  >
                    {conn.bus}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </ScrollArea>
    </div>
  );
}
