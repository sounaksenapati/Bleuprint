"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Settings2, Battery, Cpu, Ruler, DollarSign, Wifi, Zap, type LucideIcon } from "lucide-react";

export function ConstraintPanel({ projectId }: { projectId: string }) {
  const { constraints } = useWorkspaceStore();

  if (!constraints) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center px-4">
          <Settings2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No constraints yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Start chatting to generate project constraints
          </p>
        </div>
      </div>
    );
  }

  const { constraints: c, bom } = constraints;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/50 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Constraints
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {/* Product Info */}
          <div className="rounded-md border border-border/50 p-3">
            <h4 className="mb-1 text-sm font-semibold">{constraints.product_name}</h4>
            <p className="text-xs text-muted-foreground">{constraints.description}</p>
          </div>

          {/* Electrical */}
          {c?.electrical && (
            <ConstraintSection icon={Cpu} title="Electrical">
              <Row label="Controller" value={c.electrical.controller} />
              <Row label="Battery" value={`${c.electrical.battery_mah}mAh ${c.electrical.battery_type}`} />
              <Row label="Voltage" value={`${c.electrical.voltage}V`} />
              {c.electrical.sensors?.length > 0 && (
                <div className="mt-1.5">
                  <span className="text-xs text-muted-foreground">Sensors</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.electrical.sensors.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {c.electrical.actuators?.length > 0 && (
                <div className="mt-1.5">
                  <span className="text-xs text-muted-foreground">Actuators</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.electrical.actuators.map((a, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </ConstraintSection>
          )}

          {/* Mechanical */}
          {c?.mechanical && (
            <ConstraintSection icon={Ruler} title="Mechanical">
              <Row
                label="Dimensions"
                value={`${c.mechanical.dimensions_mm.x} x ${c.mechanical.dimensions_mm.y} x ${c.mechanical.dimensions_mm.z} mm`}
              />
              <Row label="Weight" value={`${c.mechanical.weight_target_g}g`} />
              <Row label="Material" value={c.mechanical.material} />
            </ConstraintSection>
          )}

          {/* Firmware */}
          {c?.firmware && (
            <ConstraintSection icon={Zap} title="Firmware">
              <Row label="Platform" value={c.firmware.platform} />
              {c.firmware.features?.length > 0 && (
                <div className="mt-1.5">
                  <span className="text-xs text-muted-foreground">Features</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.firmware.features.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </ConstraintSection>
          )}

          {/* Cost */}
          {c?.cost && (
            <ConstraintSection icon={DollarSign} title="Cost">
              <Row label="Target" value={`$${c.cost.target_usd}`} />
              {c.cost.current_bom_usd != null && (
                <Row label="Current BOM" value={`$${c.cost.current_bom_usd.toFixed(2)}`} />
              )}
            </ConstraintSection>
          )}

          {/* BOM Summary */}
          {bom && bom.length > 0 && (
            <ConstraintSection icon={Battery} title={`BOM (${bom.length} items)`}>
              {bom.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate text-muted-foreground">{item.component}</span>
                  <span>${item.estimated_cost.toFixed(2)}</span>
                </div>
              ))}
              {bom.length > 6 && (
                <p className="text-[10px] text-muted-foreground">+{bom.length - 6} more</p>
              )}
            </ConstraintSection>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ConstraintSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border/50 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
