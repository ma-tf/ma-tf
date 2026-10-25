import { createContext, useContext, type PropsWithChildren } from "react";

export type PhotographyDialogPhoto = {
  src: string;
  thumbSrc: string;
  alt: string;
  camera: string;
  film?: string | undefined;
};

type PhotographyColumnItemContextValue = {
  orientation: "portrait" | "square";
  photo: PhotographyDialogPhoto;
};

const PhotographyColumnItemContext = createContext<PhotographyColumnItemContextValue | null>(null);

export function PhotographyColumnItemProvider({
  children,
  ...value
}: PropsWithChildren<PhotographyColumnItemContextValue>) {
  return (
    <PhotographyColumnItemContext.Provider value={value}>
      {children}
    </PhotographyColumnItemContext.Provider>
  );
}

export function usePhotographyColumnItem() {
  const context = useContext(PhotographyColumnItemContext);
  if (!context) {
    throw new Error("usePhotographyColumnItem must be used within PhotographyColumnItemProvider");
  }

  return context;
}
