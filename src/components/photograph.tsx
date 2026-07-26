import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@components/ui/dialog";
import { cn } from "@lib/cn";

type Photo = {
  data: { image: { src: string } };
  body?: string;
};

export function Photograph({
  photo,
  children,
  className,
}: {
  photo: Photo;
  children: React.ReactNode;
  className?: string;
}) {
  const description = photo.body || undefined;

  return (
    <Dialog>
      <DialogTrigger className={cn("overflow-hidden cursor-pointer", className)}>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl" showCloseButton>
        <img
          src={photo.data.image.src}
          alt={description || "Photography"}
          className="w-full h-auto rounded-md"
        />
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogContent>
    </Dialog>
  );
}
