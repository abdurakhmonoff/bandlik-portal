import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type AvatarSize = "xsmall" | "small" | "medium" | "large";
export type AvatarShape = "circle" | "square";

const AVATAR_PX: Record<AvatarSize, number> = {
  xsmall: 24,
  small: 32,
  medium: 40,
  large: 56,
};

const AVATAR_BOX: Record<AvatarSize, string> = {
  xsmall: "size-6 text-subheading-2xs",
  small: "size-8 text-label-xs",
  medium: "size-10 text-label-sm",
  large: "size-14 text-label-lg",
};

/** Deterministic tints, picked by hashing the name so a person keeps a colour. */
const AVATAR_TINTS = [
  "bg-qum-200 text-qum-900",
  "bg-tepa-100 text-tepa-800",
  "bg-dala-100 text-dala-800",
  "bg-qizil-100 text-qizil-800",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return words
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

export type AvatarProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Used for the initials, the colour hash and the default alt text. */
  name: string;
  src?: string;
  alt?: string;
  /** Overrides the initials derived from `name`. */
  fallback?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
};

function Avatar({
  className,
  name,
  src,
  alt,
  fallback,
  size = "medium",
  shape = "circle",
  ...props
}: AvatarProps) {
  const initials = fallback ?? initialsFrom(name);
  const tint = AVATAR_TINTS[hashString(name) % AVATAR_TINTS.length];
  const px = AVATAR_PX[size];

  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden",
        "font-medium",
        AVATAR_BOX[size],
        shape === "circle" ? "rounded-full" : "rounded-8",
        src ? "bg-weak-50" : tint,
        className,
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? name}
          width={px}
          height={px}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
      {src ? null : <span className="sr-only">{alt ?? name}</span>}
    </span>
  );
}

export { Avatar };
