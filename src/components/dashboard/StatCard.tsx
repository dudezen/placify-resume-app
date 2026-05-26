import { Card } from "@/components/ui/card";
import type { ComponentType, ReactNode } from "react";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: "primary" | "blue" | "green" | "amber" | "red";
}) {
  const colorMap: Record<NonNullable<typeof accent>, string> = {
    primary: "var(--primary)",
    blue: "oklch(0.75 0.18 240)",
    green: "oklch(0.7 0.17 155)",
    amber: "oklch(0.8 0.18 75)",
    red: "oklch(0.7 0.22 25)",
  };
  const hue = colorMap[accent ?? "primary"];

  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: hue }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklab, ${hue} 18%, transparent)`, color: hue }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative mt-3 text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="relative mt-1 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}
