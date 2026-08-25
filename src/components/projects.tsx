import {
  Section,
  SectionContent,
  SectionHeader,
  SectionNumber,
  SectionSubtitle,
  SectionTitle,
} from "@components/section";
import { CodeIcon, GitBranchIcon } from "@phosphor-icons/react";

type Project = {
  name: string;
  url: string;
  topics: string;
  description: string;
  icon: React.ReactNode;
};

const projects: Project[] = [
  {
    name: "135ify",
    url: "https://github.com/ma-tf/135ify",
    topics: "React · TypeScript · Image Processing",
    description: "Give digital images an analogue look with real 135 film grain scans.",
    icon: <CodeIcon className="size-5" aria-hidden="true" />,
  },
  {
    name: "meta1v",
    url: "https://github.com/ma-tf/meta1v",
    topics: "Go · Metadata · Photography",
    description: "Metadata editor for EFD files pulled from a Canon EOS 1V.",
    icon: <GitBranchIcon className="size-5" aria-hidden="true" />,
  },
  {
    name: "ogle",
    url: "https://github.com/ma-tf/ogle",
    topics: "Go · Docker · TUI",
    description: "TUI for monitoring Docker Compose projects.",
    icon: <CodeIcon className="size-5" aria-hidden="true" />,
  },
  {
    name: "ma-tf",
    url: "https://github.com/ma-tf/ma-tf",
    topics: "Astro · React · TypeScript",
    description: "Personal website built with Astro, React, and Tailwind CSS.",
    icon: <GitBranchIcon className="size-5" aria-hidden="true" />,
  },
];

export function ProjectsPreview() {
  return (
    <Section>
      <SectionHeader>
        <SectionNumber />
        <SectionTitle href="https://github.com/ma-tf">Projects</SectionTitle>
      </SectionHeader>
      <SectionSubtitle>Things I build and ship.</SectionSubtitle>
      <SectionContent>
        <p className="max-w-md indent-8 text-lg text-foreground">
          A selection of projects I have built in my spare time, spanning film photography tools,
          terminal interfaces, and this very site.
        </p>
        <div className="grid grid-cols-4 gap-4">
          {projects.map((project) => (
            <div key={project.name} className="flex flex-col border border-foreground px-3 py-2">
              <a
                href={project.url}
                className="text-2xl underline-offset-4 transition-colors hover:text-foreground/70 hover:underline"
              >
                {project.name}
              </a>
              <span className="text-xs uppercase">{project.topics}</span>
              <span className="mt-2 text-sm text-muted-foreground">{project.description}</span>
              <div className="mt-auto pt-4">{project.icon}</div>
            </div>
          ))}
        </div>
      </SectionContent>
    </Section>
  );
}
