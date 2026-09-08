"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export type TooltipProviderProps = React.ComponentProps<
  typeof TooltipPrimitive.Provider
>;

function TooltipProvider({ delayDuration = 300, ...props }: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

export type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root>;

function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

export type TooltipTriggerProps = React.ComponentProps<
  typeof TooltipPrimitive.Trigger
>;

function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export type TooltipSize = "xsmall" | "small";

const TOOLTIP_SIZE: Record<TooltipSize, string> = {
  xsmall: "px-2 py-1",
  small: "px-2.5 py-1.5",
};

export type TooltipContentProps = React.ComponentProps<
  typeof TooltipPrimitive.Content
> & {
  size?: TooltipSize;
  /** Set to false for a tooltip that should not draw the pointer arrow. */
  withArrow?: boolean;
};

function TooltipContent({
  className,
  size = "small",
  sideOffset = 6,
  withArrow = true,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-64 rounded-6 bg-strong-950 text-label-xs text-static-white",
          "shadow-regular-sm",
          TOOLTIP_SIZE[size],
          className,
        )}
        {...props}
      >
        {children}
        {withArrow ? (
          <TooltipPrimitive.Arrow
            width={10}
            height={5}
            className="fill-strong-950"
          />
        ) : null}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
