import type { ChangeEvent, ComponentProps, DragEvent, RefObject } from "react";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardFooter } from "@components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@components/ui/empty";
import { useCrt } from "@features/crt/use-crt";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useRef, useState } from "react";

function isImage(file: File | null | undefined): file is File {
  return Boolean(file?.type.startsWith("image/"));
}

export function CrtHeader({ className, ...props }: ComponentProps<"header">) {
  return <header className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function CrtTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1 className={cn("text-2xl font-semibold tracking-wider uppercase", className)} {...props} />
  );
}

export function CrtDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CrtContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-6", className)} {...props} />;
}

export function CrtUpload({
  onFile,
  className,
  ...props
}: Omit<ComponentProps<"div">, "onDrop"> & { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (file: File | null | undefined) => {
    if (isImage(file)) onFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files[0]);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    accept(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <Empty
      variant="dropzone"
      data-dragging={dragging}
      className={className}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      {...props}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UploadSimpleIcon />
        </EmptyMedia>
        <EmptyTitle>Upload an image</EmptyTitle>
        <EmptyDescription>Drop an image, or choose one</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Choose image
        </Button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onChange} />
      </EmptyContent>
    </Empty>
  );
}

export function CrtScreen({
  canvasRef,
  rendering,
  saving,
  onSave,
  onClear,
  className,
  ...props
}: ComponentProps<typeof Card> & {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  rendering: boolean;
  saving: boolean;
  onSave: () => void;
  onClear: () => void;
}) {
  return (
    <Card aria-busy={rendering} className={className} {...props}>
      <CardContent>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            aria-label="CRT rendering of the uploaded image"
            className="block"
          />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" disabled={saving} onClick={onSave}>
            {saving ? "Saving…" : "Save PNG"}
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function Crt({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      data-slot="crt"
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12",
        className,
      )}
      {...props}
    />
  );
}

export function CrtWorkbench() {
  const { canvasRef, loaded, load, clear, save, saving, rendering } = useCrt();

  return loaded ? (
    <CrtScreen
      canvasRef={canvasRef}
      rendering={rendering}
      saving={saving}
      onSave={save}
      onClear={clear}
    />
  ) : (
    <CrtUpload onFile={load} />
  );
}
