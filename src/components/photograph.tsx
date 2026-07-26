import { cn } from "@lib/cn";
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@ui/dialog";

export function Photograph({
  photo,
  children,
  className,
}: {
  photo: {
    data: { image: { src: string } };
    body?: string;
  };
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

export function PhotographDescriptionHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg", className)} {...props}>
      {children}
    </h2>
  );
}

export function PhotographDescriptionContent({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-4xl prose", className)} {...props}>
      {children}
    </p>
  );
}
