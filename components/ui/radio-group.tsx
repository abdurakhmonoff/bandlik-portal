"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>;

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-1", className)}
      {...props}
    />
  );
}

export type RadioGroupItemProps = React.ComponentProps<
  typeof RadioGroupPrimitive.Item
>;

function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
        "border border-sub-300 bg-white-0 outline-none",
        "transition-colors duration-150 focus-ring",
        "hover:border-primary-base",
        "data-[state=checked]:border-primary-base",
        "disabled:cursor-not-allowed disabled:border-soft-200 disabled:bg-weak-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span
          aria-hidden="true"
          className="size-2.5 rounded-full bg-primary-base"
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export type RadioFieldProps = RadioGroupItemProps & {
  label: React.ReactNode;
  description?: React.ReactNode;
  count?: React.ReactNode;
  /** Class list for the clickable row, not the circle. */
  fieldClassName?: string;
};

function RadioField({
  label,
  description,
  count,
  className,
  fieldClassName,
  id,
  disabled,
  ...props
}: RadioFieldProps) {
  const generatedId = React.useId();
  const itemId = id ?? generatedId;
  const labelId = `${itemId}-label`;
  const descriptionId = description ? `${itemId}-description` : undefined;

  return (
    <label
      data-slot="radio-field"
      htmlFor={itemId}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-8 px-2 py-1.5",
        "transition-colors duration-150",
        disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-weak-50",
        fieldClassName,
      )}
    >
      <RadioGroupItem
        id={itemId}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        disabled={disabled}
        className={className}
        {...props}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          id={labelId}
          className={cn(
            "text-label-sm",
            disabled ? "text-disabled-300" : "text-strong-950",
          )}
        >
          {label}
        </span>
        {description ? (
          <span
            id={descriptionId}
            className={cn(
              "text-paragraph-xs",
              disabled ? "text-disabled-300" : "text-sub-600",
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
      {count !== undefined && count !== null ? (
        <span className="tabular shrink-0 text-label-xs text-soft-400">{count}</span>
      ) : null}
    </label>
  );
}

export { RadioGroup, RadioGroupItem, RadioField };
