import type { ComponentProps } from "react";

import {
  StillLifeCard,
  StillLifeContent,
  StillLifeHero,
  StillLifeHeroHeader,
} from "@components/still-life-hero";
import { cn } from "cn";

export function Privacy({ className, ...props }: ComponentProps<"div">) {
  return <StillLifeHero className={className} {...props} />;
}

export function PrivacyHeader({ className, ...props }: ComponentProps<"header">) {
  return <StillLifeHeroHeader className={className} {...props} />;
}

export function PrivacyTitle({ className, ...props }: ComponentProps<"h1">) {
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

export function PrivacyContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <StillLifeContent className={className} {...props}>
      {children}
    </StillLifeContent>
  );
}

export function PrivacyCard({ className, ...props }: ComponentProps<"div">) {
  return <StillLifeCard className={className} {...props} />;
}
