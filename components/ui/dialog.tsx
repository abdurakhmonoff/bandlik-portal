"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { IconButton } from "./button";

export type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;

function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>;

function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** Accessible name of the close button. */
  closeLabel?: string;
  showClose?: boolean;
};

function DialogContent({
  className,
  children,
  closeLabel = "Yopish",
  showClose = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className={cn(
          "fixed inset-0 z-50 bg-strong-950/40",
          "data-[state=open]:animate-[overlay-in_200ms_ease-out]",
          "data-[state=closed]:animate-[overlay-out_200ms_ease-out]",
        )}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "relative my-auto w-[calc(100%-2rem)] max-w-lg rounded-16 bg-white-0 p-6",
            "shadow-regular-md outline-none",
            "data-[state=open]:animate-[dialog-in_200ms_ease-out]",
            "data-[state=closed]:animate-[dialog-out_200ms_ease-out]",
            className,
          )}
          {...props}
        >
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
      </div>
    </DialogPrimitive.Portal>
  );
}

export type DialogHeaderProps = React.ComponentProps<"div">;

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pr-10", className)}
      {...props}
    />
  );
}

export type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-title-h6 font-display font-bold text-strong-950", className)}
      {...props}
    />
  );
}

export type DialogDescriptionProps = React.ComponentProps<
  typeof DialogPrimitive.Description
>;

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-paragraph-sm text-sub-600", className)}
      {...props}
    />
  );
}

export type DialogFooterProps = React.ComponentProps<"div">;

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
