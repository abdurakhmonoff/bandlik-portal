import * as React from "react";

import { cn } from "@/lib/utils";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "line" | "text";
export type DividerSpacing = "sm" | "md" | "lg";

const HORIZONTAL_SPACING: Record<DividerSpacing, string> = {
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
};

const VERTICAL_SPACING: Record<DividerSpacing, string> = {
  sm: "mx-2",
  md: "mx-4",
  lg: "mx-6",
};

export type DividerProps = React.ComponentProps<"div"> & {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: DividerSpacing;
};

function Divider({
  className,
  orientation = "horizontal",
  variant = "line",
  spacing = "md",
  children,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        data-slot="divider"
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "w-px self-stretch bg-soft-200",
          VERTICAL_SPACING[spacing],
          className,
        )}
        {...props}
      />
    );
  }

  if (variant === "text") {
    // No `role="separator"` here: a non-focusable separator makes its children
    // presentational, which would hide the label from assistive tech.
    return (
      <div
        data-slot="divider"
        className={cn(
          "flex w-full items-center gap-3",
          HORIZONTAL_SPACING[spacing],
          className,
        )}
        {...props}
      >
        <span aria-hidden="true" className="h-px flex-1 bg-soft-200" />
        <span className="text-subheading-xs text-soft-400">{children}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-soft-200" />
      </div>
    );
  }

  return (
    <div
      data-slot="divider"
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "h-px w-full bg-soft-200",
        HORIZONTAL_SPACING[spacing],
        className,
      )}
      {...props}
    />
  );
}

export { Divider };
