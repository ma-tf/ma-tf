import type { ReactNode } from "react";

import { usePhotographyColumnItem } from "@features/photography/photography-column-item-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { Skeleton } from "@ui/skeleton";
import { cn } from "cn";
import { useState } from "react";

function LoadableImage({
  className,
  pressed,
  onToggle,
}: {
  className: string;
  pressed: boolean;
  onToggle: () => void;
}) {
  const {
    photo: { src, alt },
  } = usePhotographyColumnItem();
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center md:static md:size-64">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      )}
      <button
        type="button"
        aria-label="Caption"
        aria-pressed={pressed}
        onClick={onToggle}
        className="flex cursor-pointer items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={cn(className, !loaded ? "hidden" : "")}
        />
      </button>
    </>
  );
}

function Thumbnail() {
  const {
    photo: { thumbSrc, alt },
  } = usePhotographyColumnItem();
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <Skeleton aria-hidden="true" className="absolute inset-0" />}
      <img
        src={thumbSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className="relative size-full cursor-pointer object-cover transition-transform duration-150 hover:scale-110"
      />
    </>
  );
}

export function PhotographyDialog({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showCaption, setShowCaption] = useState(true);
  const {
    orientation,
    photo: { camera, film },
  } = usePhotographyColumnItem();

  return (
    <div
      className={cn(
        "grid overflow-clip",
        orientation === "portrait" ? "aspect-auto" : "aspect-square",
        className,
      )}
    >
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) setShowCaption(true);
        }}
      >
        <DialogTrigger render={<button className="relative size-full" />}>
          <Thumbnail />
        </DialogTrigger>
        <DialogContent
          size="media"
          showCloseButton
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-popover via-popover/80 to-transparent p-4 transition-opacity duration-150 md:static md:bg-none md:p-0",
              !showCaption && "pointer-events-none opacity-0",
            )}
          >
            <DialogHeader>
              <DialogTitle>{children}</DialogTitle>
              <DialogDescription>
                Shot by the {camera} {film ? ` on ${film}` : null}
              </DialogDescription>
            </DialogHeader>
          </div>
          <LoadableImage
            pressed={showCaption}
            onToggle={() => setShowCaption((visible) => !visible)}
            className="max-h-dvh max-w-dvw object-contain md:max-h-dvh-85 md:max-w-dvw-85"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
