import { siteUrl } from "@features/discovery/catalog";

export const siteIdentity = {
  name: "Matt F",
  description: "Personal portfolio and work of Matt F, a full-stack developer.",
  jobTitle: "Full-stack developer",
  email: "admin@m4t.tf",
  github: "https://github.com/ma-tf",
  ogImagePath: "graphics/old house.png",
} as const;

export function siteJsonLd(logoUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteIdentity.name,
        description: siteIdentity.description,
        publisher: { "@id": `${siteUrl}/#person` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteIdentity.name,
        url: siteUrl,
        logo: logoUrl,
        sameAs: [siteIdentity.github],
        contactPoint: {
          "@type": "ContactPoint",
          email: siteIdentity.email,
          contactType: "customer support",
        },
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: siteIdentity.name,
        description: siteIdentity.description,
        url: siteUrl,
        email: siteIdentity.email,
        jobTitle: siteIdentity.jobTitle,
        sameAs: [siteIdentity.github],
      },
    ],
  };
}
