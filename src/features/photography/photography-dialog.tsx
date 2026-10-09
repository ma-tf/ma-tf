import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { cn } from "cn";
import { useState } from "react";

function LoadableImage({
  src,
  alt,
  className,
  pressed,
  onToggle,
}: {
  src: string;
  alt: string;
  className: string;
  pressed: boolean;
  onToggle: () => void;
}) {
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
        className="flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

export type PhotographyDialogPhoto = {
  src: string;
  thumbSrc: string;
  alt: string;
  camera: string;
  film?: string | undefined;
};

export function PhotographyDialog({
  photo: { src, thumbSrc, alt, camera, film },
  className,
  children,
}: {
  photo: PhotographyDialogPhoto;
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showCaption, setShowCaption] = useState(true);
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setShowCaption(true);
      }}
    >
      <DialogTrigger render={<button className={cn("cursor-pointer overflow-clip", className)} />}>
        <img
          src={thumbSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-150 hover:scale-110 md:animate-fade-in-scroll"
        />
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
          src={src}
          alt={alt}
          pressed={showCaption}
          onToggle={() => setShowCaption((visible) => !visible)}
          className="max-h-dvh-100 max-w-dvw-100 object-contain md:max-h-dvh-85 md:max-w-dvw-85"
        />
      </DialogContent>
    </Dialog>
  );
}
