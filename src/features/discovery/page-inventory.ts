import profile from "@content/profile.json";

export type PageKind = "page" | "post" | "tag" | "vignette";

export type PageEntry = {
  path: string;
  title: string;
  description: string;
  kind: PageKind;
  lastmod?: string;
};

export const staticPages: readonly PageEntry[] = [
  {
    path: "/",
    title: "Home",
    description: `overview of ${profile.name} and the site`,
    kind: "page",
  },
  {
    path: "/cv",
    title: "CV",
    description: "experience, technical strengths, education, and projects",
    kind: "page",
  },
  {
    path: "/about",
    title: "About",
    description: "background and purpose of the site",
    kind: "page",
  },
  { path: "/contact", title: "Contact", description: "current contact guidance", kind: "page" },
  { path: "/privacy", title: "Privacy", description: "initial privacy notice", kind: "page" },
  {
    path: "/developers",
    title: "Developers",
    description: "machine-readable endpoints, retrieval quickstart, and error shape",
    kind: "page",
  },
  {
    path: "/blog",
    title: "Blog",
    description: "writing about software development, programming, and tools",
    kind: "page",
  },
  {
    path: "/photography",
    title: "Photography",
    description: "photography collections",
    kind: "page",
  },
  {
    path: "/graphics",
    title: "Graphics",
    description: "graphics and creative coding work",
    kind: "page",
  },
  { path: "/music", title: "Music", description: "music-related projects and media", kind: "page" },
  {
    path: "/vignettes",
    title: "Vignettes",
    description: "short-form creative projects",
    kind: "page",
  },
];

export const routableKinds = ["page", "post", "vignette"] as const satisfies readonly PageKind[];

export type PageInventoryInput = {
  posts: { slug: string; title: string; description: string; publicationDate: Date }[];
  tags: { tag: string }[];
  vignettes: { slug: string; title: string; description: string }[];
};

export function buildPageInventory(input: PageInventoryInput): readonly PageEntry[] {
  return [
    ...staticPages,
    ...input.posts.map((post): PageEntry => ({
      path: `/posts/${encodeURIComponent(post.slug)}`,
      title: post.title,
      description: post.description,
      kind: "post",
      lastmod: post.publicationDate.toISOString(),
    })),
    ...input.tags.map(({ tag }): PageEntry => ({
      path: `/tags/${encodeURIComponent(tag)}`,
      title: tag,
      description: `Posts tagged ${tag}.`,
      kind: "tag",
    })),
    ...input.vignettes.map((vignette): PageEntry => ({
      path: `/vignettes/${encodeURIComponent(vignette.slug)}`,
      title: vignette.title,
      description: vignette.description,
      kind: "vignette",
    })),
  ];
}

export function routableEntries(inventory: readonly PageEntry[]): readonly PageEntry[] {
  return inventory.filter((entry) => (routableKinds as readonly PageKind[]).includes(entry.kind));
}
