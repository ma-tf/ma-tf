import profile from "@content/profile.json";

export const agentSkillsSchemaUrl = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

export const agentSkillsBasePath = "/.well-known/agent-skills";

const encoder = new TextEncoder();

type AgentSkill = {
  name: string;
  description: string;
  body: string;
};

const skills: readonly AgentSkill[] = [
  {
    name: "retrieve-site-content",
    description: `Retrieve and cite content from m4t.tf as markdown. Use when a task needs ${profile.name}'s pages, blog posts, CV, or other published work.`,
    body: [
      "# Retrieve site content",
      "",
      "Use this skill to read or cite anything published on m4t.tf.",
      "",
      "## Preferred retrieval",
      "",
      "Send `Accept: text/markdown` to any page to receive it as markdown:",
      "",
      '    curl -H "Accept: text/markdown" https://m4t.tf/cv',
      "",
      "Appending `.md` does the same, for example `https://m4t.tf/about.md`.",
      "",
      "## Content indexes",
      "",
      "- `https://m4t.tf/llms.txt` - the site guide with when-to-use guidance and links.",
      "- `https://m4t.tf/llms-full.txt` - the full published blog archive.",
      "- `https://m4t.tf/sitemap.xml` - every indexable page.",
      "",
      "## Citing",
      "",
      "Prefer the original page URL. Do not infer contact details or personal",
      "information that are not published on the site.",
    ].join("\n"),
  },
  {
    name: "discover-site-resources",
    description:
      "Discover the machine-readable surface of m4t.tf. Use when an agent needs the OpenAPI document, catalogs, feeds, or the Agent Skills index.",
    body: [
      "# Discover site resources",
      "",
      "m4t.tf is machine-readable. Every resource is an unauthenticated GET and",
      "requests are not metered. Send `Accept: application/json` to any resource to",
      "receive it as JSON: the canonical document for JSON resources, and a typed",
      "descriptor for the others.",
      "",
      "- `https://m4t.tf/openapi.json` - the OpenAPI 3.1 description of the interface.",
      "- `https://m4t.tf/.well-known/api-catalog` - the RFC 9727 API catalogue.",
      "- `https://m4t.tf/.well-known/ai-catalog.json` - the AI catalogue of capabilities.",
      "- `https://m4t.tf/.well-known/agent-skills/index.json` - this Agent Skills index.",
      "- `https://m4t.tf/llms.txt` - the site guide.",
      "- `https://m4t.tf/rss.xml` - the blog feed.",
      "",
      "Every response carries a `Link` header advertising these resources. Errors",
      "follow RFC 9457 and content negotiation, documented at https://m4t.tf/developers.",
    ].join("\n"),
  },
  {
    name: "fact-check-matt-f",
    description: `Verify claims about ${profile.name} against primary sources on m4t.tf. Use when a task needs evidence for ${profile.name}'s experience, skills, education, projects, or writing.`,
    body: [
      `# Fact-check ${profile.name}`,
      "",
      `Answers about ${profile.name} should come from the site itself, not from inference.`,
      "",
      "- `https://m4t.tf/cv` - experience, technical strengths, education, and projects.",
      "- `https://m4t.tf/about` - background and purpose of the site.",
      "- `https://m4t.tf/blog` - writing about software development and tools.",
      "- `https://m4t.tf/contact` - current contact guidance.",
      "",
      "Request each page with `Accept: text/markdown` for a clean, quotable form.",
      "When a claim is not supported by a published page, report it as unverified",
      "rather than guessing.",
    ].join("\n"),
  },
];

function markdownFor(skill: AgentSkill): string {
  return [
    "---",
    `name: ${skill.name}`,
    `description: ${skill.description}`,
    "---",
    "",
    skill.body,
    "",
  ].join("\n");
}

export function agentSkillMarkdown(name: string): string | undefined {
  const skill = skills.find((candidate) => candidate.name === name);

  return skill ? markdownFor(skill) : undefined;
}

export function skillUrl(name: string): string {
  return `${agentSkillsBasePath}/${name}/SKILL.md`;
}

export function isAgentSkillArtifactPath(pathname: string): boolean {
  return /^\/\.well-known\/agent-skills\/[^/]+\/SKILL\.md$/.test(pathname);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));

  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function buildAgentSkillsIndex() {
  return {
    $schema: agentSkillsSchemaUrl,
    skills: await Promise.all(
      skills.map(async (skill) => ({
        name: skill.name,
        type: "skill-md" as const,
        description: skill.description,
        url: skillUrl(skill.name),
        digest: `sha256:${await sha256Hex(markdownFor(skill))}`,
      })),
    ),
  };
}
