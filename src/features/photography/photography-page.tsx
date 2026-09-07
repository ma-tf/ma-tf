import type { ReactNode } from "react";

import { NavButton } from "@components/nav-button";
import {
  Photography,
  PhotographyContent,
  PhotographyDescription,
  PhotographyGrid,
  PhotographyHeader,
  PhotographyTitle,
} from "@features/photography/photography";

export function PhotographyPage({ children }: { children: ReactNode }) {
  return (
    <Photography>
      <PhotographyHeader>
        <PhotographyTitle>photography</PhotographyTitle>
        <nav className="flex w-fit flex-col items-stretch gap-1" aria-label="Section navigation">
          <NavButton href="/">Home</NavButton>
          <NavButton href="/photography">Photography</NavButton>
          <NavButton href="/vignettes">Vignettes</NavButton>
          <NavButton href="/music">Music</NavButton>
        </nav>
      </PhotographyHeader>
      <PhotographyContent>
        <PhotographyDescription>
          In my spare time I am an amateur photographer. My photography is in both digital and film
          formats. I have collected many cameras over the last few years. The cameras I use include:
          <ul>
            <li>
              a <span className="italic">Canon EOS-1V</span> as my primary camera with swappable
              lenses;
            </li>
            <li>
              an <span className="italic">Olympus mju mini Digital</span> for when I want retro
              digital shots;
            </li>
            <li>
              a <span className="italic">Ricoh Mirai</span> when I need an all rounder bridge
              camera.
            </li>
          </ul>
          Each one covers a use case of mine, and they have served me well so far.
          <p>
            I am drawn to quiet, overlooked spaces; underground passages, stairwells, empty
            stations, and the city in early morning fog. The places most people pass through without
            looking are often the ones with the most interesting geometry and light.
          </p>
          <p>
            There is a particular satisfaction in film that digital does not quite give me. Every
            frame costs something, so each one has to be intentional, and the anticipation of
            waiting for a roll to come back is part of the appeal.
          </p>
        </PhotographyDescription>
        <PhotographyGrid>{children}</PhotographyGrid>
      </PhotographyContent>
    </Photography>
  );
}
