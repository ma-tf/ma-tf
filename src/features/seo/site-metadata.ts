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
        sameAs: [siteIdentity.github, siteIdentity.linkedin, siteIdentity.bandcamp],
        image: imageUrl,
        address: {
          "@type": "PostalAddress",
          addressCountry: siteIdentity.addressCountry,
        },
      },
    ],
  };
}
