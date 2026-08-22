import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";
import { cn } from "@lib/cn";

export function MusicPreview() {
  return (
    <Section>
      <SectionHeader>
        <SectionNumber>04</SectionNumber>
        <SectionTitle href="/music">Music</SectionTitle>
      </SectionHeader>
      <SectionSubtitle>Original compositions, remixes, and live recordings.</SectionSubtitle>
      <SectionContent>
        <p className="max-w-md indent-8 text-lg text-foreground">
          Music made and recorded in the gaps. Drum and bass, ambient, and DJ sets, captured on tape
          and pressed to the internet.
        </p>
      </SectionContent>
    </Section>
  );
}

export function Music({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col justify-center", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid grid-cols-1 gap-6 md:grid-cols-3", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-right text-9xl md:text-[240px]", className)} {...props}>
      {children}
    </h2>
  );
}

export function MusicHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function MusicDescription({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("indent-8 text-2xl", className)} {...props}>
      {children}
    </p>
  );
}
