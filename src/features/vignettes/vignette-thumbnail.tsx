import { useVignetteThumbnail } from "@features/vignettes/vignette-thumbnail-context";
import { CaretRightIcon, PlayIcon } from "@phosphor-icons/react";
import { cn } from "cn";

const VIGNETTE_DESKTOP_OFFSET_CLASSES = [
  "md:translate-x-0",
  "md:translate-x-4",
  "md:translate-x-8",
];

export function thumbnailUrl(playbackId: string, width: number, height: number) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=${width}&height=${height}&fit_mode=crop`;
}

function VignetteThumbnailButton({ children, className, ...props }: React.ComponentProps<"a">) {
  const { isActive } = useVignetteThumbnail();

  return (
    <a
      className={cn(
        "group block min-w-0 cursor-pointer text-left max-md:w-full max-md:border-b max-md:border-foreground/20 max-md:px-4 max-md:py-3",
        isActive && "max-md:bg-foreground max-md:text-background",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3 transition-transform duration-150 md:items-start md:gap-2 md:group-hover:-translate-y-0.5">
        {children}
      </div>
    </a>
  );
}

function VignetteThumbnailMedia({ children, className, ...props }: React.ComponentProps<"div">) {
  const { isActive } = useVignetteThumbnail();

  return (
    <div
      className={cn(
        "shrink-0 vignette-thumb-outline thumb-outline-transparent group-hover:thumb-outline-muted-foreground group-focus-visible:thumb-outline-muted-foreground",
        isActive && "thumb-outline-foreground max-md:thumb-outline-background",
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
        "block text-sm text-muted-foreground lowercase transition-colors duration-150 group-hover:text-foreground md:text-2xs",
        isActive && "text-foreground max-md:text-background",
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
        "text-base font-medium text-muted-foreground lowercase transition-colors duration-150 group-hover:text-foreground md:text-xs",
        isActive && "text-foreground max-md:text-background",
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
        "grid size-4 shrink-0 place-items-center border border-foreground bg-background text-foreground transition-colors duration-150 group-hover:bg-foreground group-hover:text-background md:size-3",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function VignetteThumbnail() {
  const { vignette, index, isActive } = useVignetteThumbnail();
  const rowIndex = Math.floor(index / 3);

  return (
    <VignetteThumbnailButton
      href={`/vignettes/${vignette.slug}`}
      className={VIGNETTE_DESKTOP_OFFSET_CLASSES[rowIndex]}
      aria-label={`Show vignette ${vignette.order}`}
      aria-current={isActive ? "page" : undefined}
    >
      <VignetteThumbnailMedia>
        <span className="block overflow-hidden cut-corner">
          <img
            src={thumbnailUrl(vignette.playbackId, 128, 96)}
            alt={`Vignette ${vignette.order}`}
            loading="lazy"
            className="block aspect-5/3 w-24 object-cover transition-transform duration-150 group-hover:scale-110 md:w-12"
          />
        </span>
      </VignetteThumbnailMedia>
      <VignetteThumbnailDetails>
        <VignetteThumbnailHeader>
          <VignetteThumbnailTitle>{vignette.id}</VignetteThumbnailTitle>
          <VignetteThumbnailIcon>
            <PlayIcon className="size-2 md:size-1.5" weight="fill" />
          </VignetteThumbnailIcon>
        </VignetteThumbnailHeader>
        <VignetteThumbnailSummary>{vignette.summary}</VignetteThumbnailSummary>
      </VignetteThumbnailDetails>
      <CaretRightIcon
        size={16}
        weight="bold"
        aria-hidden="true"
        className="ml-auto shrink-0 md:hidden"
      />
    </VignetteThumbnailButton>
  );
}
