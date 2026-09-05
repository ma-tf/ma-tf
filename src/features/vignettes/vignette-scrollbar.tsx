import { cn } from "@lib/cn";

type VignetteScrollbarProps = {
  progress: number;
  className?: string;
};

export function VignetteScrollbar({ progress, className }: VignetteScrollbarProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-y-1 right-0 w-3", className)}
      aria-hidden="true"
    >
      <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-zinc-50/40" />
      <div
        className="absolute left-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-50"
        style={{ top: `${progress * 100}%` }}
      />
    </div>
  );
}
