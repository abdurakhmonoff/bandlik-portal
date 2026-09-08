import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full",
    "border border-transparent font-medium",
  ],
  {
    variants: {
      size: {
        small: "h-5 gap-1 px-2 text-label-xs",
        medium: "h-6 gap-1.5 px-2.5 text-label-xs",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  },
);

export type BadgeVariant = "filled" | "light" | "lighter" | "stroke";

export type BadgeColor =
  | "gray"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "information"
  /** oltin — reserved for the featured marker. */
  | "gold";

const BADGE_TONES: Record<BadgeColor, Record<BadgeVariant, string>> = {
  gray: {
    filled: "bg-sub-600 text-static-white",
    light: "bg-soft-200 text-strong-950",
    lighter: "bg-weak-50 text-sub-600",
    stroke: "border-soft-200 bg-white-0 text-sub-600",
  },
  primary: {
    filled: "bg-primary-base text-static-white",
    light: "bg-primary-alpha-16 text-primary-dark",
    lighter: "bg-primary-alpha-10 text-primary-base",
    stroke: "border-primary-base bg-white-0 text-primary-base",
  },
  success: {
    filled: "bg-success-base text-static-white",
    light: "bg-success-light text-dala-800",
    lighter: "bg-success-lighter text-success-base",
    stroke: "border-success-base bg-white-0 text-success-base",
  },
  warning: {
    filled: "bg-warning-base text-static-white",
    light: "bg-warning-light text-warning-dark",
    lighter: "bg-warning-lighter text-warning-dark",
    stroke: "border-warning-base bg-white-0 text-warning-dark",
  },
  error: {
    filled: "bg-error-base text-static-white",
    light: "bg-error-light text-qizil-800",
    lighter: "bg-error-lighter text-error-base",
    stroke: "border-error-base bg-white-0 text-error-base",
  },
  information: {
    filled: "bg-information-base text-static-white",
    light: "bg-information-light text-strong-950",
    lighter: "bg-information-lighter text-sub-600",
    stroke: "border-sub-300 bg-white-0 text-sub-600",
  },
  gold: {
    filled: "bg-oltin-500 text-static-white",
    light: "bg-oltin-100 text-oltin-800",
    lighter: "bg-oltin-50 text-oltin-700",
    stroke: "border-oltin-300 bg-white-0 text-oltin-800",
  },
};

export type BadgeProps = Omit<React.ComponentProps<"span">, "color"> &
  VariantProps<typeof badgeVariants> & {
    variant?: BadgeVariant;
    color?: BadgeColor;
    /** 6px leading dot in the current text colour. */
    dot?: boolean;
    icon?: React.ReactNode;
  };

function Badge({
  className,
  variant = "light",
  color = "gray",
  size,
  dot = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ size }), BADGE_TONES[color][variant], className)}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      ) : null}
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
