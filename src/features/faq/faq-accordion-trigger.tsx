import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { cn } from "cn";

export function FaqAccordionTrigger({
  children,
  className,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 cursor-pointer items-start justify-between border border-transparent py-4 text-left text-sm font-medium transition-colors outline-none hover:text-foreground/70 hover:no-underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <CaretDownIcon className="pointer-events-none ml-auto size-4 shrink-0 text-muted-foreground group-hover/accordion-trigger:text-muted-foreground/70 group-aria-expanded/accordion-trigger:hidden" />
        <CaretUpIcon className="pointer-events-none ml-auto hidden size-4 shrink-0 text-muted-foreground group-hover/accordion-trigger:text-muted-foreground/70 group-aria-expanded/accordion-trigger:inline" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
