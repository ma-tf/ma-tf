import { cn } from "@lib/cn";
export function TagLink({ children, className, ...props }: React.ComponentProps<"a">) {
  return (
    <span
      className={cn(
        "relative inline-block [--cut-color:var(--border)] hover:[--cut-color:var(--foreground)]",
        className,
      )}
    >
      <a
        className={cn(
          "block border border-(--cut-color) bg-background/90 px-3 py-1 text-sm [transition:--cut-color_150ms_ease]",
          "[clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)]",
        )}
        {...props}
      >
        {children}
      </a>
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-2.5 w-2.5 bg-[linear-gradient(-45deg,transparent_calc(50%-0.5px),var(--cut-color)_calc(50%-0.5px),var(--cut-color)_calc(50%+0.5px),transparent_calc(50%+0.5px))] [transition:--cut-color_150ms_ease]"
      />
    </span>
  );
}
