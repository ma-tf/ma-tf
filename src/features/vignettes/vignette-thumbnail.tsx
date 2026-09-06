import { useVignetteThumbnail } from "@features/vignettes/vignette-thumbnail-context";
import { cn } from "@lib/cn";
import { PlayIcon } from "@phosphor-icons/react";

const VIGNETTE_ROW_OFFSET_CLASSES = ["translate-x-0", "translate-x-4", "translate-x-8"];

export function thumbnailUrl(playbackId: string, width: number, height: number) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=${width}&height=${height}&fit_mode=crop`;
}

function VignetteThumbnailButton({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "group flex min-w-0 cursor-pointer items-start gap-2 text-left transition-[transform,color] duration-150 hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function VignetteThumbnailMedia({ children, className, ...props }: React.ComponentProps<"div">) {
  const { isActive } = useVignetteThumbnail();

  return (
    <div
      className={cn(
        "shrink-0 filter-[drop-shadow(0_1px_1px_rgb(0_0_0/0.05))_drop-shadow(2px_0_0_var(--thumb-outline))_drop-shadow(-2px_0_0_var(--thumb-outline))_drop-shadow(0_2px_0_var(--thumb-outline))_drop-shadow(0_-2px_0_var(--thumb-outline))] [--thumb-outline:transparent] group-hover:[--thumb-outline:var(--muted-foreground)] group-focus-visible:[--thumb-outline:var(--muted-foreground)]",
        isActive && "[--thumb-outline:var(--foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function VignetteThumbnailDetails({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("min-w-0 text-sm", className)} {...props}>
      {children}
    </div>
  );
}

function VignetteThumbnailHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  );
}

function VignetteThumbnailSummary({ children, className, ...props }: React.ComponentProps<"span">) {
  const { isActive } = useVignetteThumbnail();

  return (
    <span
      className={cn(
        "block text-[0.625rem] text-muted-foreground lowercase transition-colors duration-200 group-hover:text-foreground",
        isActive && "text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function VignetteThumbnailTitle({ children, className, ...props }: React.ComponentProps<"span">) {
  const { isActive } = useVignetteThumbnail();

  return (
    <span
      className={cn(
        "text-xs font-medium text-muted-foreground lowercase transition-colors duration-150 group-hover:text-foreground",
        isActive && "text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function VignetteThumbnailIcon({ children, className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-3 shrink-0 place-items-center border border-foreground bg-background text-foreground transition-[background-color,color] duration-150 group-hover:bg-foreground group-hover:text-background",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function VignetteThumbnail() {
  const { vignette, index, onSelect, isActive } = useVignetteThumbnail();
  const rowIndex = Math.floor(index / 3);

  return (
    <VignetteThumbnailButton
      className={cn("min-w-0", VIGNETTE_ROW_OFFSET_CLASSES[rowIndex] ?? "translate-x-0")}
      onClick={() => onSelect(index)}
      aria-label={`Show vignette ${vignette.order}`}
      aria-pressed={isActive}
    >
      <VignetteThumbnailMedia>
        <span className="block overflow-hidden [clip-path:polygon(0_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%)]">
          <img
            src={thumbnailUrl(vignette.playbackId, 128, 96)}
            alt={`Vignette ${vignette.order}`}
            loading="lazy"
            className="block aspect-5/3 w-12 object-cover transition-transform duration-200 group-hover:scale-110"
          />
        </span>
      </VignetteThumbnailMedia>
      <VignetteThumbnailDetails>
        <VignetteThumbnailHeader>
          <VignetteThumbnailTitle>{vignette.id}</VignetteThumbnailTitle>
          <VignetteThumbnailIcon>
            <PlayIcon className="size-1.5" weight="fill" />
          </VignetteThumbnailIcon>
        </VignetteThumbnailHeader>
        <VignetteThumbnailSummary>{vignette.summary}</VignetteThumbnailSummary>
      </VignetteThumbnailDetails>
    </VignetteThumbnailButton>
  );
}
