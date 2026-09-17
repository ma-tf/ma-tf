import {
  agentSkillMarkdown,
  agentSkillsBasePath,
  agentSkillsSchemaUrl,
  buildAgentSkillsIndex,
  isAgentSkillArtifactPath,
  skillUrl,
} from "@features/discovery/documents/agent-skills";
import { describe, expect, it } from "vite-plus/test";

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));

  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

describe("buildAgentSkillsIndex", () => {
  it("declares the v0.2.0 discovery schema", async () => {
    const index = await buildAgentSkillsIndex();

    expect(index.$schema).toBe(agentSkillsSchemaUrl);
    expect(index.skills.length).toBeGreaterThan(0);
  });

  it("gives every skill a conformant entry", async () => {
    const index = await buildAgentSkillsIndex();
    const names = index.skills.map((skill) => skill.name);
    expect(new Set(names).size).toBe(names.length);

    for (const skill of index.skills) {
      expect(skill.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(skill.name.length).toBeLessThanOrEqual(64);
      expect(skill.type).toBe("skill-md");
      expect(skill.description.length).toBeGreaterThan(0);
      expect(skill.description.length).toBeLessThanOrEqual(1024);
      expect(skill.url).toBe(skillUrl(skill.name));
      expect(skill.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
  });

  it("digests the bytes the skill route serves", async () => {
    const index = await buildAgentSkillsIndex();

    for (const skill of index.skills) {
      const markdown = agentSkillMarkdown(skill.name);
      if (!markdown) throw new Error(`Missing SKILL.md for ${skill.name}`);

      expect(skill.digest).toBe(`sha256:${await sha256Hex(markdown)}`);
    }
  });

  it("carries the index name and description in the frontmatter", async () => {
    const index = await buildAgentSkillsIndex();

    for (const skill of index.skills) {
      const markdown = agentSkillMarkdown(skill.name);
      if (!markdown) throw new Error(`Missing SKILL.md for ${skill.name}`);

      expect(markdown.startsWith("---\n")).toBe(true);
      expect(markdown).toContain(`\nname: ${skill.name}\n`);
      expect(markdown).toContain(`\ndescription: ${skill.description}\n`);
    }
  });

  it("returns undefined for an unknown skill", () => {
    expect(agentSkillMarkdown("no-such-skill")).toBeUndefined();
  });
});

describe("isAgentSkillArtifactPath", () => {
  it("matches skill artifact paths and nothing else", () => {
    expect(isAgentSkillArtifactPath(`${agentSkillsBasePath}/retrieve-site-content/SKILL.md`)).toBe(
      true,
    );
    expect(isAgentSkillArtifactPath(`${agentSkillsBasePath}/index.json`)).toBe(false);
    expect(isAgentSkillArtifactPath(`${agentSkillsBasePath}/name/SKILL`)).toBe(false);
    expect(isAgentSkillArtifactPath("/.well-known/ai-catalog.json")).toBe(false);
  });
});
