import type { PhotographyDialogPhoto } from "@features/photography/photography-column-item-context";
import type { ReactNode } from "react";

import { PhotographyColumnItemProvider } from "@features/photography/photography-column-item-context";
import { PhotographyDialog } from "@features/photography/photography-dialog";

export function PhotographyColumnItem({
  photo,
  orientation,
  children,
}: {
  photo: PhotographyDialogPhoto;
  orientation: "portrait" | "square";
  children?: ReactNode;
}) {
  return (
    <PhotographyColumnItemProvider orientation={orientation} photo={photo}>
      <PhotographyDialog>{children}</PhotographyDialog>
    </PhotographyColumnItemProvider>
  );
}
