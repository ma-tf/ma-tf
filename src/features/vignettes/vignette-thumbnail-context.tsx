import type { CollectionEntry } from "astro:content";

import { createContext, useContext, type PropsWithChildren } from "react";

type VignetteThumbnailContextValue = {
  vignette: CollectionEntry<"vignettes">["data"];
  index: number;
  isActive: boolean;
};

const VignetteThumbnailContext = createContext<VignetteThumbnailContextValue | null>(null);

export function VignetteThumbnailProvider({
  children,
  ...value
}: PropsWithChildren<VignetteThumbnailContextValue>) {
  return (
    <VignetteThumbnailContext.Provider value={value}>{children}</VignetteThumbnailContext.Provider>
  );
}

export function useVignetteThumbnail() {
  const context = useContext(VignetteThumbnailContext);
  if (!context) {
    throw new Error("useVignetteThumbnail must be used within VignetteThumbnailProvider");
  }

  return context;
}
