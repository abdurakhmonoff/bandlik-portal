"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { CaretDown, CaretUp, Check } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export type SelectSize = "xsmall" | "small" | "medium";

const CONTROL_SIZE: Record<SelectSize, string> = {
  xsmall: "h-8 px-2.5 text-paragraph-sm",
  small: "h-9 px-3 text-paragraph-sm",
  medium: "h-10 px-3.5 text-paragraph-md",
};

const controlClasses = [
  "w-full rounded-8 border bg-white-0 text-strong-950 outline-none",
  "transition-colors duration-150 focus-ring",
  "hover:border-sub-300 focus-visible:border-primary-base",
  "disabled:cursor-not-allowed disabled:border-soft-200 disabled:bg-weak-50",
  "disabled:text-disabled-300",
];

/* ------------------------------------------------------------------ */
/* Native select — renders and works without JavaScript                */
/* ------------------------------------------------------------------ */

export type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: SelectSize;
  hasError?: boolean;
};

function NativeSelect({
  className,
  size = "medium",
  hasError = false,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div data-slot="native-select" className="relative w-full">
      <select
        aria-invalid={hasError ? true : undefined}
        className={cn(
          controlClasses,
          CONTROL_SIZE[size],
          "appearance-none pr-9",
          hasError ? "border-error-base hover:border-error-base" : "border-soft-200",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-soft-400"
      >
        <CaretDown size={16} weight="regular" />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Radix select                                                        */
/* ------------------------------------------------------------------ */

export type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root>;

function Select(props: SelectProps) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

export type SelectGroupProps = React.ComponentProps<typeof SelectPrimitive.Group>;

function SelectGroup(props: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export type SelectValueProps = React.ComponentProps<typeof SelectPrimitive.Value>;

function SelectValue(props: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

export type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: SelectSize;
  hasError?: boolean;
};

function SelectTrigger({
  className,
  size = "medium",
  hasError = false,
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        controlClasses,
        CONTROL_SIZE[size],
        "flex items-center justify-between gap-2",
        "data-[placeholder]:text-soft-400",
        "[&>span]:truncate",
        hasError ? "border-error-base hover:border-error-base" : "border-soft-200",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDown
          size={16}
          weight="regular"
          aria-hidden="true"
          className="shrink-0 text-soft-400 transition-transform duration-150"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>;

function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-32",
          "overflow-hidden rounded-12 border border-soft-200 bg-white-0 shadow-regular-md",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-soft-400">
          <CaretUp size={16} weight="regular" aria-hidden="true" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-soft-400">
          <CaretDown size={16} weight="regular" aria-hidden="true" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export type SelectLabelProps = React.ComponentProps<typeof SelectPrimitive.Label>;

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-3 py-1.5 text-label-xs text-soft-400", className)}
      {...props}
    />
  );
}

export type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item>;

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2",
        "rounded-8 py-2 pl-3 pr-8 text-paragraph-sm text-strong-950 outline-none",
        "transition-colors duration-150",
        "data-[highlighted]:bg-weak-50",
        "data-[disabled]:pointer-events-none data-[disabled]:text-disabled-300",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center text-primary-base">
        <Check size={16} weight="regular" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export type SelectSeparatorProps = React.ComponentProps<
  typeof SelectPrimitive.Separator
>;

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-soft-200", className)}
      {...props}
    />
  );
}

export {
  NativeSelect,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
