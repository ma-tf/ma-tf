import {
  StillLifeCard,
  StillLifeContent,
  StillLifeHero,
  StillLifeHeroHeader,
} from "@components/still-life-hero";
import { cn } from "cn";

export function Contact({ className, ...props }: React.ComponentProps<"div">) {
  return <StillLifeHero className={className} {...props} />;
}

export function ContactHeader({ className, ...props }: React.ComponentProps<"header">) {
  return <StillLifeHeroHeader className={className} {...props} />;
}

export function ContactTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-parallax-push
      className={cn(
        "animate-fade-in title-fit font-semibold uppercase animation-delay-1200 vertical-text",
        className,
      )}
      {...props}
    />
  );
}

export function ContactContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <StillLifeContent className={className} {...props}>
      {children}
    </StillLifeContent>
  );
}

export function ContactCard({ className, ...props }: React.ComponentProps<"div">) {
  return <StillLifeCard className={className} {...props} />;
}
