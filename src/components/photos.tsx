import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";
import { Button } from "@components/ui/button";
import { cn } from "@lib/cn";
import { CameraIcon, FilmStripIcon } from "@phosphor-icons/react";

export function PhotosPreview() {
  return (
    <Section className="mx-auto max-w-480 py-24">
      <SectionHeader>
        <SectionNumber />
        <SectionTitle href="/photos">Photography</SectionTitle>
      </SectionHeader>
      <SectionSubtitle>Digital and analogue photographs.</SectionSubtitle>
      <SectionContent>
        <div className="grid grid-cols-3 items-start gap-4">
          <div className="flex flex-col gap-4 indent-8 text-lg">
            <p>
              In my spare time I am an amateur photographer. I shoot on both digital and film, and
              have collected a small family of cameras over the years, each covering a different use
              case.
            </p>
            <p>
              The cameras I use include: a Canon EOS-1V as my primary camera with swappable lenses;
              an Olympus mju mini Digital for when I want retro digital shots; a Ricoh Mirai when I
              need an all rounder bridge camera. They have served me well so far.
            </p>
            <p>
              I scan every roll myself on a Nikon CoolScan V ED using SilverFast, and colour correct
              the frames in SilverFast HDR. It's a slow, hands-on part of the process, but it's
              become as much a part of the craft as the shooting itself.
            </p>
            <Button
              variant="outline"
              render={<a href="/photos">View photographs</a>}
              className="mt-6 w-fit rounded-none border-none bg-foreground indent-0 text-background hover:bg-muted-foreground dark:bg-foreground dark:hover:bg-muted-foreground/80"
              size="lg"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col border border-foreground px-3 py-2">
              <span className="text-2xl">EOS-1V</span>
              <span className="text-xs uppercase">Canon</span>
              <div className="mt-auto pt-4">
                <FilmStripIcon className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="flex flex-col border border-foreground px-3 py-2">
              <span className="text-2xl">Mirai</span>
              <span className="text-xs uppercase">Ricoh</span>
              <div className="mt-auto pt-4">
                <FilmStripIcon className="size-5" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="flex flex-col border border-foreground px-3 py-2">
            <span className="text-2xl">mju mini Digital</span>
            <span className="text-xs uppercase">Olympus</span>
            <div className="mt-auto pt-4">
              <CameraIcon className="size-5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </SectionContent>
    </Section>
  );
}

export function Photos({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid auto-rows-auto grid-cols-1 gap-4 lg:grid-cols-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PhotosHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4 p-4 lg:col-span-2", className)} {...props}>
      {children}
    </div>
  );
}

export function PhotosTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg", className)} {...props}>
      {children}
    </h2>
  );
}

export function PhotosDescription({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("indent-8 text-4xl", className)} {...props}>
      {children}
    </div>
  );
}

export function PhotosContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("lg:col-span-4", className)} {...props}>
      {children}
    </div>
  );
}
