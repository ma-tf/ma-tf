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
  onClick,
}: {
  src: string;
  alt: string;
  className: string;
  onClick?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center md:static md:size-64">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        className={cn(className, !loaded ? "hidden" : "")}
      />
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
            "absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-popover via-popover/80 to-transparent p-4 transition-opacity duration-150 md:static md:bg-none md:p-0 md:opacity-100",
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
          onClick={() => setShowCaption((visible) => !visible)}
          className="max-h-full max-w-full object-contain md:max-h-dvh-85 md:max-w-dvw-85"
        />
      </DialogContent>
    </Dialog>
  );
}
