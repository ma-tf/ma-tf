import profile from "@content/profile.json";
import { siteUrl } from "@features/discovery/catalog";

export const siteIdentity = {
  name: profile.name,
  description: profile.description,
  jobTitle: profile.title,
  email: profile.email,
  github: profile.github,
  linkedin: profile.linkedin,
  bandcamp: profile.bandcamp,
  addressCountry: "LU",
  ogImagePath: "graphics/old house.png",
} as const;

export const service = {
  name: "Full-stack software development",
  description:
    "I build across the full stack, from interfaces and APIs to infrastructure and databases, with TypeScript, React, Go, SQL, Azure, Kubernetes, and OpenTofu.",
  contactPath: "/contact",
} as const;

const breadcrumbSegments: Record<string, { name: string; path: string }> = {
  about: { name: "About", path: "/about" },
  blog: { name: "Blog", path: "/blog" },
  contact: { name: "Contact", path: "/contact" },
  cv: { name: "CV", path: "/cv" },
  developers: { name: "Developers", path: "/developers" },
  graphics: { name: "Graphics", path: "/graphics" },
  music: { name: "Music", path: "/music" },
  photography: { name: "Photography", path: "/photography" },
  posts: { name: "Blog", path: "/blog" },
  privacy: { name: "Privacy", path: "/privacy" },
  vignettes: { name: "Vignettes", path: "/vignettes" },
};

export function pageNameFor(pathname: string): string | undefined {
  const [segment] = pathname.split("/").filter(Boolean);

  if (!segment) return "Home";

  return breadcrumbSegments[segment]?.name;
}

function breadcrumbList(pathname: string) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteUrl}/`,
    },
  ];

  const segments = pathname.split("/").filter(Boolean);
  for (const segment of segments) {
    const crumb = breadcrumbSegments[segment];
    if (!crumb) continue;

    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    });
  }

  return items;
}

export function siteJsonLd(
  imageUrl: string,
  pathname = "/",
  faqAnswers: { question: string; text: string }[] = [],
) {
  const personId = `${siteUrl}/#person`;
  const canonicalUrl = new URL(pathname, `${siteUrl}/`).href;
  const isHome = canonicalUrl === `${siteUrl}/`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteIdentity.name,
        description: siteIdentity.description,
        publisher: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: siteIdentity.name,
        description: siteIdentity.description,
        url: siteUrl,
        email: siteIdentity.email,
        jobTitle: siteIdentity.jobTitle,
        sameAs: [siteIdentity.github, siteIdentity.linkedin, siteIdentity.bandcamp],
        image: imageUrl,
        address: {
          "@type": "PostalAddress",
          addressCountry: siteIdentity.addressCountry,
        },
      },
      ...(isHome
        ? [
            {
              "@type": "FAQPage",
              "@id": `${siteUrl}/#faq`,
              mainEntity: faqAnswers.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.text,
                },
              })),
            },
            {
              "@type": "Service",
              "@id": `${siteUrl}/#service`,
              name: service.name,
              description: service.description,
              serviceType: service.name,
              provider: { "@id": personId },
              url: `${siteUrl}${service.contactPath}`,
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbList(pathname),
      },
    ],
  };
}
