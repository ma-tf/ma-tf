import { cn } from "@lib/cn";

export function MusicPreview() {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center">
        <span>Preview and link for music content</span>
      </div>
    </div>
  );
}

export function Music({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("w-480", className)} {...props}>
      {children}
    </div>
  );
}
