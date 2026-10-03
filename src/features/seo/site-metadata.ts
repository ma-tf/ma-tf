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

type PageSection = { name: string; path: string; description: string };

const blogSection: PageSection = {
  name: "Blog",
  path: "/blog",
  description: "Writing about web development, creative coding, and things learned along the way.",
};

const pageSections: Record<string, PageSection> = {
  about: {
    name: "About",
    path: "/about",
    description:
      "About Matt Fehrenbach, a full-stack developer, and the work and interests collected on this site.",
  },
  blog: blogSection,
  contact: {
    name: "Contact",
    path: "/contact",
    description:
      "How to contact Matt Fehrenbach about his work, projects, or professional experience.",
  },
  cv: {
    name: "CV",
    path: "/cv",
    description:
      "The curriculum vitae of Matt Fehrenbach: professional experience, technical strengths, projects, and education.",
  },
  developers: {
    name: "Developers",
    path: "/developers",
    description:
      "The machine-readable interface of m4t.tf: its discovery resources, API behaviour, errors, and versioning for developers and agents.",
  },
  graphics: {
    name: "Graphics",
    path: "/graphics",
    description: "Graphic design and visual work by Matt Fehrenbach.",
  },
  music: {
    name: "Music",
    path: "/music",
    description:
      "Music by Matt Fehrenbach, including DJ recordings and released tracks, with notes on how they were made.",
  },
  photography: {
    name: "Photography",
    path: "/photography",
    description:
      "Photography by Matt Fehrenbach of quiet, overlooked places, shot on film and digital cameras.",
  },
  posts: blogSection,
  privacy: {
    name: "Privacy",
    path: "/privacy",
    description:
      "How m4t.tf handles privacy: no first-party analytics or tracking, and the third-party services embedded in some pages.",
  },
  vignettes: {
    name: "Vignettes",
    path: "/vignettes",
    description: "Short films and video vignettes by Matt Fehrenbach.",
  },
};

export function pageNameFor(pathname: string): string | undefined {
  const [segment] = pathname.split("/").filter(Boolean);

  if (!segment) return "Home";

  return pageSections[segment]?.name;
}

export function pageDescriptionFor(pathname: string): string | undefined {
  const [segment] = pathname.split("/").filter(Boolean);

  if (!segment) {
    return "The personal site of Matt Fehrenbach, a full-stack developer, collecting his software projects, writing, photography, graphics, and music.";
  }

  return pageSections[segment]?.description;
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
    const crumb = pageSections[segment];
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
