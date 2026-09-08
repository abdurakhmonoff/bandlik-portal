"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export type TabsVariant = "underline" | "segmented";

const TabsVariantContext = React.createContext<TabsVariant>("underline");

export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  variant?: TabsVariant;
};

function Tabs({ className, variant = "underline", ...props }: TabsProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn("flex flex-col", className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

export type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant;
};

function TabsList({ className, variant, ...props }: TabsListProps) {
  const inherited = React.useContext(TabsVariantContext);
  const resolved = variant ?? inherited;

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={resolved}
      className={cn(
        resolved === "underline"
          ? "no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-soft-200"
          : "inline-flex items-center gap-1 rounded-10 bg-weak-50 p-1",
        className,
      )}
      {...props}
    />
  );
}

export type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: TabsVariant;
};

function TabsTrigger({ className, variant, ...props }: TabsTriggerProps) {
  const inherited = React.useContext(TabsVariantContext);
  const resolved = variant ?? inherited;

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={resolved}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap",
        "text-label-sm font-medium text-sub-600 outline-none",
        "transition-colors duration-150 focus-ring",
        "hover:text-strong-950",
        "disabled:pointer-events-none disabled:text-disabled-300",
        "data-[state=active]:text-strong-950",
        resolved === "underline"
          ? [
              "h-10 px-3",
              "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5",
              "after:bg-transparent after:transition-colors after:duration-150",
              "data-[state=active]:after:bg-primary-base",
            ]
          : [
              "h-8 rounded-8 px-3",
              "data-[state=active]:bg-white-0 data-[state=active]:shadow-regular-xs",
            ],
        className,
      )}
      {...props}
    />
  );
}

export type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>;

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-4 outline-none focus-ring", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
