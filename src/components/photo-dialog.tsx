import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { Skeleton } from "@ui/skeleton";
import { useState } from "react";

export function PhotoDialog({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Dialog>
      <DialogTrigger className="overflow-hidden cursor-pointer">{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90dvw] w-fit max-w-[90dvw]" showCloseButton>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        {!loaded && <Skeleton className="w-64 aspect-square" />}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className="max-h-[85dvh] max-w-[85dvw] object-contain"
          style={{ display: loaded ? undefined : "none" }}
        />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
