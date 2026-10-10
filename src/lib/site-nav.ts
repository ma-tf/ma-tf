import { previews } from "@lib/feature-flags";

export type SiteNavLink = { label: string; href: string };

const explorePages = [
  { label: "Blog", href: "/blog", enabled: previews.blog },
  { label: "Photography", href: "/photography", enabled: previews.photography },
  { label: "Graphics", href: "/graphics", enabled: previews.graphics },
  { label: "Music", href: "/music", enabled: previews.music },
  { label: "Vignettes", href: "/vignettes", enabled: previews.vignettes },
];

export const exploreLinks: SiteNavLink[] = explorePages
  .filter((page) => page.enabled)
  .map(({ label, href }) => ({ label, href }));

export const siteNavLinks: SiteNavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "CV", href: "/cv" },
  ...exploreLinks,
  { label: "Contact", href: "/contact" },
  { label: "Developers", href: "/developers" },
  { label: "Privacy", href: "/privacy" },
];
