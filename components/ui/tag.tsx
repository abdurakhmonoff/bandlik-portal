"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

const tagVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-8",
    "border font-medium outline-none transition-colors duration-150 focus-ring",
    "disabled:pointer-events-none disabled:border-transparent disabled:bg-weak-50",
    "disabled:text-disabled-300",
  ],
  {
    variants: {
      size: {
        small: "h-7 gap-1 px-2.5 text-label-xs",
        medium: "h-8 gap-1.5 px-3 text-label-sm",
      },
      selected: {
        true: "border-transparent bg-strong-950 text-static-white hover:bg-surface-800",
        false:
          "border-soft-200 bg-white-0 text-sub-600 hover:border-sub-300 hover:text-strong-950",
      },
    },
    defaultVariants: {
      size: "medium",
      selected: false,
    },
  },
);

export type TagProps = Omit<React.ComponentProps<"span">, "onSelect"> &
  VariantProps<typeof tagVariants> & {
    label: React.ReactNode;
    /** Renders the remove button when provided. */
    onRemove?: () => void;
    /** Accessible name for the remove button, e.g. "Filtrni olib tashlash". */
    removeLabel?: string;
    /** Render the child element instead of a `span` (Radix `Slot`). */
    asChild?: boolean;
    icon?: React.ReactNode;
  };

function Tag({
  className,
  label,
  onRemove,
  removeLabel = "Olib tashlash",
  asChild = false,
  icon,
  size,
  selected,
  children,
  ...props
}: TagProps) {
  const iconSize = size === "small" ? 12 : 16;

  const iconNode = icon ? (
    <span key="icon" aria-hidden="true" className="inline-flex shrink-0 items-center">
      {icon}
    </span>
  ) : null;

  const labelNode = (
    <span key="label" className="truncate">
      {label}
    </span>
  );

  if (asChild) {
    return (
      <Slot.Root
        data-slot="tag"
        className={cn(tagVariants({ size, selected }), className)}
        {...props}
      >
        {iconNode}
        {labelNode}
        <Slot.Slottable>{children}</Slot.Slottable>
      </Slot.Root>
    );
  }

  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ size, selected }), className)}
      {...props}
    >
      {iconNode}
      {labelNode}
      {children}
      {onRemove ? (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className={cn(
            "-mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
            "outline-none transition-colors duration-150 focus-ring",
            selected
              ? "text-static-white hover:bg-strong-950"
              : "text-soft-400 hover:bg-weak-50 hover:text-strong-950",
          )}
        >
          <X size={iconSize} weight="regular" aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

export { Tag, tagVariants };
