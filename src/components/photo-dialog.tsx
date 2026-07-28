import type { ImageMetadata } from "astro";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { Skeleton } from "@ui/skeleton";
import { useState } from "react";

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
    image: ImageMetadata;
    camera: string;
    film?: string | undefined;
    column: number;
    order: number;
  };
  className?: string;
  children?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Dialog>
      <DialogTrigger className={`overflow-hidden cursor-pointer ${className ?? ""}`}>
        <img
          src={thumbSrc}
          alt={alt}
          className="size-full object-cover transition-transform duration-150 hover:scale-110"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90dvw] w-fit max-w-[90dvw]" showCloseButton>
        <DialogHeader>
          <DialogTitle>{children}</DialogTitle>
          <DialogDescription className="prose">
            Shot by the {data.camera} {data.film ? ` on ${data.film}` : null}
          </DialogDescription>
        </DialogHeader>
        {!loaded && <Skeleton className="w-64 aspect-square" />}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`max-h-[85dvh] max-w-[85dvw] object-contain ${!loaded ? "hidden" : ""}`}
        />
      </DialogContent>
    </Dialog>
  );
}
