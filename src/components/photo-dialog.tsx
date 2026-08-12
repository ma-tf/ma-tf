import { cn } from "@lib/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { useState } from "react";

function LoadableImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="flex size-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(className, !loaded ? "hidden" : "")}
      />
    </>
  );
}

export function PhotoDialog({
  src,
  thumbSrc,
  alt,
  data,
  className,
  children,
}: {
  src: string;
  thumbSrc: string;
  alt: string;
  data: {
    image: string;
    camera: string;
    film?: string | undefined;
    column: number;
    order: number;
  };
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger
        className={`cursor-pointer overflow-hidden md:animate-fade-in-scroll ${className ?? ""}`}
      >
        <img
          src={thumbSrc}
          alt={alt}
          className="size-full object-cover transition-transform duration-150 hover:scale-110"
        />
      </DialogTrigger>
      <DialogContent className="w-fit max-w-[90dvw] sm:max-w-[90dvw]" showCloseButton>
        <DialogHeader>
          <DialogTitle>{children}</DialogTitle>
          <DialogDescription className="prose">
            Shot by the {data.camera} {data.film ? ` on ${data.film}` : null}
          </DialogDescription>
        </DialogHeader>
        <LoadableImage
          src={src}
          alt={alt}
          className={`max-h-[85dvh] max-w-[85dvw] object-contain`}
        />
      </DialogContent>
    </Dialog>
  );
}
