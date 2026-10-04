import { useMotionControl } from "@hooks/use-motion-control";
import { ArrowCounterClockwiseIcon, FastForwardIcon } from "@phosphor-icons/react";
import { cn } from "cn";

const ICON_BASE =
  "col-start-1 row-start-1 transition-[opacity,translate,scale] duration-150 ease-out motion-reduce:transition-none";

export function MotionControlButton() {
  const { mode, skip, reset } = useMotionControl();

  if (mode === "hidden") return null;

  const action =
    mode === "reset"
      ? {
          label: "Reset animations",
          onClick: reset,
          fastForward: "-translate-y-1 scale-90 opacity-0",
          arrow: "translate-y-0 scale-100 opacity-100",
        }
      : {
          label: "Skip animations",
          onClick: skip,
          fastForward: "translate-y-0 scale-100 opacity-100",
          arrow: "translate-y-1 scale-90 opacity-0",
        };

  return (
    <button
      type="button"
      onClick={action.onClick}
      aria-label={action.label}
      title={action.label}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-muted-foreground",
        "hover:text-foreground",
      )}
    >
      <FastForwardIcon size={16} weight="bold" className={cn(ICON_BASE, action.fastForward)} />
      <ArrowCounterClockwiseIcon size={16} weight="bold" className={cn(ICON_BASE, action.arrow)} />
    </button>
  );
}
