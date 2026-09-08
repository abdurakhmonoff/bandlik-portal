"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const fieldVariants = cva(
  [
    "w-full rounded-8 border bg-white-0 text-strong-950 outline-none",
    "transition-colors duration-150 focus-ring",
    "placeholder:text-soft-400",
    "hover:border-sub-300 focus-visible:border-primary-base",
    "disabled:cursor-not-allowed disabled:border-soft-200 disabled:bg-weak-50",
    "disabled:text-disabled-300 disabled:placeholder:text-disabled-300",
    "read-only:bg-weak-50",
  ],
  {
    variants: {
      size: {
        xsmall: "h-8 px-2.5 text-paragraph-sm",
        small: "h-9 px-3 text-paragraph-sm",
        medium: "h-10 px-3.5 text-paragraph-md",
      },
      hasError: {
        true: "border-error-base hover:border-error-base focus-visible:border-error-base",
        false: "border-soft-200",
      },
    },
    defaultVariants: {
      size: "medium",
      hasError: false,
    },
  },
);

export type InputSize = "xsmall" | "small" | "medium";

export type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof fieldVariants> & {
    leadingIcon?: React.ReactNode;
    /** Trailing affordance: unit, clear button, password toggle… */
    trailingSlot?: React.ReactNode;
    hasError?: boolean;
  };

function Input({
  className,
  size,
  hasError = false,
  leadingIcon,
  trailingSlot,
  ...props
}: InputProps) {
  const control = (
    <input
      data-slot="input"
      aria-invalid={hasError ? true : undefined}
      className={cn(
        fieldVariants({ size, hasError }),
        leadingIcon && "pl-9",
        trailingSlot && "pr-10",
        className,
      )}
      {...props}
    />
  );

  if (!leadingIcon && !trailingSlot) {
    return control;
  }

  return (
    <div data-slot="input-wrapper" className="relative w-full">
      {leadingIcon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-soft-400"
        >
          {leadingIcon}
        </span>
      ) : null}
      {control}
      {trailingSlot ? (
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-soft-400">
          {trailingSlot}
        </span>
      ) : null}
    </div>
  );
}

export type TextareaProps = React.ComponentProps<"textarea"> & {
  hasError?: boolean;
  /** Grow with the content instead of showing a scrollbar. */
  autoResize?: boolean;
  /** Upper bound for `autoResize`, in rows. */
  maxRows?: number;
};

function Textarea({
  className,
  hasError = false,
  autoResize = false,
  maxRows = 8,
  rows = 3,
  onChange,
  ref,
  value,
  ...props
}: TextareaProps) {
  const innerRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement, []);

  const resize = React.useCallback(() => {
    const el = innerRef.current;
    if (!el || !autoResize) return;

    el.style.height = "auto";

    const styles = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
    const paddingY =
      Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const borderY =
      Number.parseFloat(styles.borderTopWidth) +
      Number.parseFloat(styles.borderBottomWidth);

    // `scrollHeight` covers content + padding; border-box height needs the border too.
    const needed = el.scrollHeight + borderY;
    const max = lineHeight * maxRows + paddingY + borderY;

    el.style.height = `${Math.min(needed, max)}px`;
    el.style.overflowY = needed > max ? "auto" : "hidden";
  }, [autoResize, maxRows]);

  React.useEffect(() => {
    resize();
  }, [resize, value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
    resize();
  };

  return (
    <textarea
      data-slot="textarea"
      ref={innerRef}
      rows={rows}
      value={value}
      onChange={handleChange}
      aria-invalid={hasError ? true : undefined}
      className={cn(
        "w-full rounded-8 border bg-white-0 px-3.5 py-2.5 text-paragraph-md text-strong-950",
        "outline-none transition-colors duration-150 focus-ring",
        "placeholder:text-soft-400",
        "hover:border-sub-300 focus-visible:border-primary-base",
        "disabled:cursor-not-allowed disabled:border-soft-200 disabled:bg-weak-50",
        "disabled:text-disabled-300 disabled:placeholder:text-disabled-300",
        hasError ? "border-error-base hover:border-error-base" : "border-soft-200",
        autoResize ? "resize-none" : "resize-y",
        className,
      )}
      {...props}
    />
  );
}

export type LabelProps = React.ComponentProps<"label"> & {
  /** Quiet trailing note, e.g. "ixtiyoriy". */
  hint?: React.ReactNode;
  /** Adds a required marker after the label text. */
  required?: boolean;
};

function Label({ className, children, hint, required = false, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-label-sm text-strong-950",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {required ? (
        <span aria-hidden="true" className="text-primary-base">
          *
        </span>
      ) : null}
      {hint ? <span className="text-soft-400">{hint}</span> : null}
    </label>
  );
}

export type HelperTextProps = React.ComponentProps<"p"> & {
  variant?: "default" | "error" | "success";
};

function HelperText({ className, variant = "default", ...props }: HelperTextProps) {
  return (
    <p
      data-slot="helper-text"
      className={cn(
        "text-paragraph-xs",
        variant === "error" && "text-error-base",
        variant === "success" && "text-success-base",
        variant === "default" && "text-sub-600",
        className,
      )}
      {...props}
    />
  );
}

export { Input, Textarea, Label, HelperText, fieldVariants };
