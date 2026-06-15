// src/components/ui/tabs.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Create context to coordinate selected tab keys dynamically.
const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

// This component coordinates tab container wrapper nodes.
export function Tabs({
  value,
  onValueChange,
  defaultValue,
  children,
  className
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [localValue, setLocalValue] = React.useState(defaultValue || "");
  const activeValue = value !== undefined ? value : localValue;
  const handleValueChange = onValueChange || setLocalValue;

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// This component defines layout bars enclosing tab triggers.
export function TabsList({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex h-11 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground w-full sm:w-auto", className)}>
      {children}
    </div>
  );
}

// This component represents individual click triggers which swap view parameters.
export function TabsTrigger({
  value,
  children,
  className
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
        isActive 
          ? "bg-white dark:bg-card text-[#002060] shadow-sm ring-1 ring-[#002060]/10" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-card/30"
      )}
    >
      {children}
    </button>
  );
}

// This component contains layout sections displayed conditionally.
export function TabsContent({
  value,
  children,
  className
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;

  return (
    <div className={cn("mt-4 w-full animate-in fade-in duration-200", className)}>
      {children}
    </div>
  );
}
