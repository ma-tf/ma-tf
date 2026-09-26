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

export const faqs = [
  {
    question: "Who are you?",
    answer: `I'm ${profile.name}, a full-stack developer. I started programming in 2013 and have worked professionally since 2018, across public safety, finance, and intellectual property.`,
  },
  {
    question: "How can I contact you?",
    answer:
      "Email me at admin@m4t.tf. It's the only contact channel I publish: there is no contact form, phone number, or second inbox.",
  },
  {
    question: "Can AI agents read this site?",
    answer:
      "Yes. I serve every page as HTML or markdown, and publish an agent guide at /llms.txt, an OpenAPI document at /openapi.json, and a full content archive at /llms-full.txt. There are no API keys, and requests aren't metered.",
  },
] as const;

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

export function siteJsonLd(imageUrl: string, pathname = "/") {
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
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
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
