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
  return (
    <Dialog>
      <DialogTrigger render={<button className={cn("cursor-pointer overflow-clip", className)} />}>
        <img
          src={thumbSrc}
          alt={alt}
          className="size-full object-cover transition-transform duration-150 hover:scale-110 md:animate-fade-in-scroll"
        />
      </DialogTrigger>
      <DialogContent size="media" showCloseButton>
        <DialogHeader>
          <DialogTitle>{children}</DialogTitle>
          <DialogDescription>
            Shot by the {camera} {film ? ` on ${film}` : null}
          </DialogDescription>
        </DialogHeader>
        <LoadableImage src={src} alt={alt} className={`max-h-dvh-85 max-w-dvw-85 object-contain`} />
      </DialogContent>
    </Dialog>
  );
}
