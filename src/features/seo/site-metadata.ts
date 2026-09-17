import { siteUrl } from "@features/discovery/catalog";

export const siteIdentity = {
  name: "Matt F",
  description: "Personal portfolio and work of Matt F, a full-stack developer.",
  jobTitle: "Full-stack developer",
  email: "admin@m4t.tf",
  github: "https://github.com/ma-tf",
  addressCountry: "LU",
  ogImagePath: "graphics/old house.png",
} as const;

export function siteJsonLd(imageUrl: string) {
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
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: siteIdentity.name,
        description: siteIdentity.description,
        url: siteUrl,
        email: siteIdentity.email,
        jobTitle: siteIdentity.jobTitle,
        sameAs: [siteIdentity.github],
        image: imageUrl,
        address: {
          "@type": "PostalAddress",
          addressCountry: siteIdentity.addressCountry,
        },
      },
    ],
  };
}
