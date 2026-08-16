const flag = (name: string): boolean => import.meta.env[name] === "true";

export const previews = {
  blog: flag("PUBLIC_PREVIEW_BLOG"),
  projects: flag("PUBLIC_PREVIEW_PROJECTS"),
  photos: flag("PUBLIC_PREVIEW_PHOTOS"),
  vignettes: flag("PUBLIC_PREVIEW_VIGNETTES"),
  graphics: flag("PUBLIC_PREVIEW_GRAPHICS"),
  music: flag("PUBLIC_PREVIEW_MUSIC"),
};
