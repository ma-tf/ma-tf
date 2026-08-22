import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";
import { cn } from "@lib/cn";

export function PhotosPreview() {
  return (
    <Section>
      <SectionHeader>
        <SectionNumber>01</SectionNumber>
        <SectionTitle href="/photos">Photography</SectionTitle>
      </SectionHeader>
      <SectionSubtitle>Photographs in digital and film.</SectionSubtitle>
      <SectionContent>
        <p className="max-w-md indent-8 text-lg text-foreground">
          In my spare time I am an amateur photographer. I shoot on both digital and film, and have
          collected a small family of cameras over the years, each covering a different use case.
        </p>
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
