"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check, Minus } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer inline-flex size-5 shrink-0 items-center justify-center rounded-4",
        "border border-sub-300 bg-white-0 outline-none",
        "transition-colors duration-150 focus-ring",
        "hover:border-primary-base",
        "data-[state=checked]:border-primary-base data-[state=checked]:bg-primary-base",
        "data-[state=indeterminate]:border-primary-base data-[state=indeterminate]:bg-primary-base",
        "disabled:cursor-not-allowed disabled:border-soft-200 disabled:bg-weak-50",
        "disabled:data-[state=checked]:border-soft-200 disabled:data-[state=checked]:bg-soft-200",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-static-white"
      >
        <Check
          size={14}
          weight="regular"
          aria-hidden="true"
          className="hidden group-data-[state=checked]:block"
        />
        <Minus
          size={14}
          weight="regular"
          aria-hidden="true"
          className="hidden group-data-[state=indeterminate]:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export type CheckboxFieldProps = CheckboxProps & {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Quiet trailing figure, e.g. the number of matching vacancies. */
  count?: React.ReactNode;
  /** Class list for the clickable row, not the box. */
  fieldClassName?: string;
};

function CheckboxField({
  label,
  description,
  count,
  className,
  fieldClassName,
  id,
  disabled,
  ...props
}: CheckboxFieldProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;
  const labelId = `${checkboxId}-label`;
  const descriptionId = description ? `${checkboxId}-description` : undefined;

  return (
    // The wrapping label keeps the whole row clickable: the Radix root is a
    // `button`, which is a labelable element.
    <label
      data-slot="checkbox-field"
      htmlFor={checkboxId}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-8 px-2 py-1.5",
        "transition-colors duration-150",
        disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-weak-50",
        fieldClassName,
      )}
    >
      <Checkbox
        id={checkboxId}
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

export { Checkbox, CheckboxField };
