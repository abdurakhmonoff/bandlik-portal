import * as React from "react";

import { cn } from "@/lib/utils";

export type SkeletonShape = "text" | "rect" | "circle";

const SKELETON_SHAPE: Record<SkeletonShape, string> = {
  text: "h-4 w-full rounded-6",
  rect: "rounded-8",
  circle: "aspect-square rounded-full",
};

export type SkeletonProps = React.ComponentProps<"div"> & {
  shape?: SkeletonShape;
};

function Skeleton({ className, shape = "rect", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("skeleton block", SKELETON_SHAPE[shape], className)}
      {...props}
    />
  );
}

export type SkeletonTextProps = React.ComponentProps<"div"> & {
  lines?: number;
};

function SkeletonText({ className, lines = 3, ...props }: SkeletonTextProps) {
  return (
    <div
      data-slot="skeleton-text"
      aria-hidden="true"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    >
      {Array.from({ length: Math.max(1, lines) }, (_, index) => (
        <Skeleton
          key={index}
          shape="text"
          className={index === lines - 1 && lines > 1 ? "w-2/3" : undefined}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
