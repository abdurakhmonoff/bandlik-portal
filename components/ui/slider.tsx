"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Turns each thumb value into an `aria-valuetext`, e.g. "4 000 000 so'm". */
  formatValue?: (value: number) => string;
  /** Accessible name per thumb; falls back to `aria-label` on the root. */
  thumbLabels?: string[];
};

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  formatValue,
  thumbLabels,
  ...props
}: SliderProps) {
  const values = React.useMemo(
    () => value ?? defaultValue ?? [min],
    [value, defaultValue, min],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-60",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-soft-200"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-primary-base"
        />
      </SliderPrimitive.Track>
      {values.map((thumbValue, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          aria-label={thumbLabels?.[index]}
          aria-valuetext={formatValue ? formatValue(thumbValue) : undefined}
          className={cn(
            "block size-5 shrink-0 rounded-full border-2 border-primary-base bg-white-0",
            "shadow-regular-sm outline-none transition-colors duration-150 focus-ring",
            "hover:border-primary-dark",
            "data-[disabled]:border-sub-300",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
