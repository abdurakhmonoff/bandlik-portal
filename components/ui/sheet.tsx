"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { IconButton } from "./button";

export type SheetSide = "bottom" | "right";

export type SheetProps = React.ComponentProps<typeof DialogPrimitive.Root>;

function Sheet(props: SheetProps) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

export type SheetTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;

function SheetTrigger(props: SheetTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export type SheetCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>;

function SheetClose(props: SheetCloseProps) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

const SHEET_SIDE: Record<SheetSide, string> = {
  bottom: [
    "inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-20 pb-[env(safe-area-inset-bottom)]",
    "data-[state=open]:animate-[sheet-in-bottom_200ms_ease-out]",
    "data-[state=closed]:animate-[sheet-out-bottom_200ms_ease-out]",
  ].join(" "),
  right: [
    "inset-y-0 right-0 h-full w-full sm:max-w-md",
    "data-[state=open]:animate-[sheet-in-right_200ms_ease-out]",
    "data-[state=closed]:animate-[sheet-out-right_200ms_ease-out]",
  ].join(" "),
};

export type SheetContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: SheetSide;
  /** Accessible name of the close button. */
  closeLabel?: string;
  showClose?: boolean;
};

function SheetContent({
  className,
  children,
  side = "bottom",
  closeLabel = "Yopish",
  showClose = true,
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="sheet-overlay"
        className={cn(
          "fixed inset-0 z-50 bg-strong-950/40",
          "data-[state=open]:animate-[overlay-in_200ms_ease-out]",
          "data-[state=closed]:animate-[overlay-out_200ms_ease-out]",
        )}
      />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col bg-white-0 shadow-regular-md outline-none",
          SHEET_SIDE[side],
          className,
        )}
        {...props}
      >
        {side === "bottom" ? (
          <span
            aria-hidden="true"
            className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-sub-300"
          />
        ) : null}
        {children}
        {showClose ? (
          <DialogPrimitive.Close asChild>
            <IconButton
              variant="neutral"
              mode="ghost"
              size="xsmall"
              aria-label={closeLabel}
              className="absolute right-4 top-4"
            >
              <X size={20} weight="regular" aria-hidden="true" />
            </IconButton>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export type SheetHeaderProps = React.ComponentProps<"div">;

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex shrink-0 flex-col gap-1 px-5 pb-3 pt-4 pr-14", className)}
      {...props}
    />
  );
}

export type SheetBodyProps = React.ComponentProps<"div">;

/** Scrollable region between the header and the footer. */
function SheetBody({ className, ...props }: SheetBodyProps) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-4", className)}
      {...props}
    />
  );
}

export type SheetTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-title-h6 font-display font-bold text-strong-950", className)}
      {...props}
    />
  );
}

export type SheetDescriptionProps = React.ComponentProps<
  typeof DialogPrimitive.Description
>;

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-paragraph-sm text-sub-600", className)}
      {...props}
    />
  );
}

export type SheetFooterProps = React.ComponentProps<"div">;

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t border-soft-200 px-5 py-4",
        "sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
