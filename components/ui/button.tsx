"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleNotch } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap",
    "border border-transparent font-medium outline-none",
    "transition-colors duration-150 focus-ring",
    "disabled:pointer-events-none disabled:border-transparent disabled:bg-weak-50",
    "disabled:text-disabled-300 disabled:shadow-none",
  ],
  {
    variants: {
      variant: {
        primary: "",
        neutral: "",
        error: "",
      },
      mode: {
        filled: "",
        stroke: "border-soft-200 bg-white-0 hover:bg-weak-50",
        lighter: "",
        ghost: "bg-transparent hover:bg-weak-50",
      },
      size: {
        xxsmall: "h-7 gap-1 rounded-6 px-2 text-label-xs",
        xsmall: "h-8 gap-1.5 rounded-6 px-2.5 text-label-sm",
        small: "h-9 gap-1.5 rounded-8 px-3 text-label-sm",
        medium: "h-10 gap-2 rounded-8 px-4 text-label-sm",
      },
    },
    compoundVariants: [
      // filled
      {
        variant: "primary",
        mode: "filled",
        class: "bg-primary-base text-static-white hover:bg-primary-dark",
      },
      {
        variant: "neutral",
        mode: "filled",
        class: "bg-strong-950 text-static-white hover:bg-surface-800",
      },
      {
        variant: "error",
        mode: "filled",
        class: "bg-error-base text-static-white hover:bg-qizil-700",
      },
      // stroke
      { variant: "primary", mode: "stroke", class: "text-primary-base" },
      { variant: "neutral", mode: "stroke", class: "text-strong-950" },
      { variant: "error", mode: "stroke", class: "text-error-base" },
      // lighter
      {
        variant: "primary",
        mode: "lighter",
        class: "bg-primary-alpha-10 text-primary-base hover:bg-primary-alpha-16",
      },
      {
        variant: "neutral",
        mode: "lighter",
        class: "bg-weak-50 text-strong-950 hover:bg-soft-200",
      },
      {
        variant: "error",
        mode: "lighter",
        class: "bg-error-lighter text-error-base hover:bg-error-light",
      },
      // ghost
      { variant: "primary", mode: "ghost", class: "text-primary-base" },
      { variant: "neutral", mode: "ghost", class: "text-strong-950" },
      { variant: "error", mode: "ghost", class: "text-error-base" },
    ],
    defaultVariants: {
      variant: "primary",
      mode: "filled",
      size: "medium",
    },
  },
);

export type ButtonSize = "xxsmall" | "xsmall" | "small" | "medium";

const ICON_SIZE: Record<ButtonSize, 16 | 20> = {
  xxsmall: 16,
  xsmall: 16,
  small: 16,
  medium: 20,
};

const ICON_BUTTON_SIZE: Record<ButtonSize, string> = {
  xxsmall: "size-7 p-0",
  xsmall: "size-8 p-0",
  small: "size-9 p-0",
  medium: "size-10 p-0",
};

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariantProps & {
    /** Render the child element instead of a `button` (Radix `Slot`). */
    asChild?: boolean;
    /** Swaps the label for a spinner without changing the button width. */
    isLoading?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  };

function Button({
  className,
  variant,
  mode,
  size,
  asChild = false,
  isLoading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const resolvedSize: ButtonSize = size ?? "medium";

  const leading = leadingIcon ? (
    <span
      key="leading"
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center", isLoading && "invisible")}
    >
      {leadingIcon}
    </span>
  ) : null;

  const trailing = trailingIcon ? (
    <span
      key="trailing"
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center", isLoading && "invisible")}
    >
      {trailingIcon}
    </span>
  ) : null;

  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        className={cn(buttonVariants({ variant, mode, size }), className)}
        {...props}
      >
        {leading}
        <Slot.Slottable>{children}</Slot.Slottable>
        {trailing}
      </Slot.Root>
    );
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, mode, size }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? true : undefined}
      {...props}
    >
      {isLoading ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <CircleNotch
            size={ICON_SIZE[resolvedSize]}
            weight="regular"
            aria-hidden="true"
            className="animate-spin"
          />
        </span>
      ) : null}
      {leading}
      <span className={cn("inline-flex items-center", isLoading && "invisible")}>
        {children}
      </span>
      {trailing}
    </button>
  );
}

export type IconButtonProps = Omit<
  ButtonProps,
  "leadingIcon" | "trailingIcon"
> & {
  /** Icon-only buttons always need an accessible name. */
  "aria-label": string;
};

function IconButton({
  className,
  size,
  isLoading = false,
  disabled,
  children,
  asChild = false,
  variant,
  mode,
  ...props
}: IconButtonProps) {
  const resolvedSize: ButtonSize = size ?? "medium";

  if (asChild) {
    return (
      <Slot.Root
        data-slot="icon-button"
        className={cn(
          buttonVariants({ variant, mode, size }),
          ICON_BUTTON_SIZE[resolvedSize],
          className,
        )}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      data-slot="icon-button"
      className={cn(
        buttonVariants({ variant, mode, size }),
        ICON_BUTTON_SIZE[resolvedSize],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? true : undefined}
      {...props}
    >
      {isLoading ? (
        <CircleNotch
          size={ICON_SIZE[resolvedSize]}
          weight="regular"
          aria-hidden="true"
          className="animate-spin"
        />
      ) : (
        children
      )}
    </button>
  );
}

export { Button, IconButton, buttonVariants };
