"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { Plus } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root>;

function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

export type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-soft-200", className)}
      {...props}
    />
  );
}

export type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
>;

function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex w-full items-center justify-between gap-4 py-4 text-left",
          "text-label-md font-medium text-strong-950 outline-none",
          "transition-colors duration-150 focus-ring",
          "hover:text-primary-base",
          "disabled:pointer-events-none disabled:text-disabled-300",
          className,
        )}
        {...props}
      >
        {children}
        <Plus
          size={20}
          weight="regular"
          aria-hidden="true"
          className={cn(
            "shrink-0 text-soft-400 transition-transform duration-200 ease-out",
            "group-hover:text-primary-base",
            "group-data-[state=open]:rotate-45",
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>;

function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden",
        "data-[state=open]:animate-[accordion-down_200ms_ease-out]",
        "data-[state=closed]:animate-[accordion-up_200ms_ease-out]",
      )}
      {...props}
    >
      <div className={cn("pb-4 pr-8 text-paragraph-md text-sub-600", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
