// This module provides the Shadcn/UI chart wrapper container primitives for charting components.

"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// This type definition configures the visual keys, colors, and labels used in the charts.
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

// This context stores the chart configuration and CSS variables for mapping palette attributes.
const ChartContext = React.createContext<{
  config: ChartConfig;
} | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }
  return context;
}

// This container wrapper sets up the responsive layout and CSS theme variables for Recharts elements.
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, config, children, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line]:stroke-border [&_.recharts-cartesian-grid-vertical_line]:stroke-border [&_.recharts-curve.recharts-line]:stroke-primary [&_.recharts-dot]:stroke-primary [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_path]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_line]:stroke-border [&_.recharts-sector[role='img']]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            #${chartId} {
              ${Object.entries(config)
                .map(([key, val]) => `--color-${key}: ${val.color};`)
                .join("\n")}
            }
          `
        }} />
        <RechartsPrimitive.ResponsiveContainer id={chartId} width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

// This primitive acts as the tooltip portal display layer over active chart slices.
const ChartTooltip = RechartsPrimitive.Tooltip;

// This layout component styles the details text populating chart hover event screens.
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: any[];
    labelKey?: string;
    indicator?: "dot" | "line" | "dashed";
    hideLabel?: boolean;
  }
>(({ className, active, payload, labelKey, indicator = "dot", hideLabel = false, ...props }, ref) => {
  const { config } = useChart();

  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-48 items-start gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-xl backdrop-blur-xs",
        className
      )}
      {...props}
    >
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = item.dataKey || item.name;
          const configItem = config[key];
          const color = item.payload?.fill || item.color || "currentColor";

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-foreground font-medium"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                {indicator === "dot" && (
                  <div
                    className="h-2 w-2 shrink-0 rounded-xs"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span>{configItem?.label || key}</span>
              </div>
              <span className="font-mono text-foreground font-bold">
                {typeof item.value === "number"
                  ? `RM ${item.value.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`
                  : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
