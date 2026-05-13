import { describe, expect, it, vi } from "vitest";
import type { EnvironmentApi, ServerProviderSkill } from "@t3tools/contracts";

import { discoverLocalProviderSkills, mergeProviderSkills } from "./providerSkillDiscovery.core";

function makeSkill(partial: Partial<ServerProviderSkill> & Pick<ServerProviderSkill, "name" | "path">) {
  return {
    enabled: true,
    ...partial,
  } satisfies ServerProviderSkill;
}

function browseResult(parentPath: string, entries: Array<{ name: string; fullPath: string }>) {
  return { parentPath, entries };
}

describe("mergeProviderSkills", () => {
  it("keeps local skills when providers do not report them", () => {
    const merged = mergeProviderSkills(
      [],
      [makeSkill({ name: "review", path: "/repo/.agents/skills/review/SKILL.md" })],
    );

    expect(merged.map((skill) => skill.name)).toEqual(["review"]);
  });

  it("merges provider metadata into matching local skills", () => {
    const merged = mergeProviderSkills(
      [
        makeSkill({
          name: "review",
          path: "/repo/.agents/skills/review/SKILL.md",
          displayName: "Review Follow-up",
          shortDescription: "Provider summary",
        }),
      ],
      [
        makeSkill({
          name: "review",
          path: "/repo/.agents/skills/review/SKILL.md",
          scope: "project",
        }),
      ],
    );

    expect(merged).toEqual([
      expect.objectContaining({
        name: "review",
        path: "/repo/.agents/skills/review/SKILL.md",
        displayName: "Review Follow-up",
        shortDescription: "Provider summary",
        scope: "project",
      }),
    ]);
  });
});

describe("discoverLocalProviderSkills", () => {
  it("discovers project and user skills from local filesystem browse results", async () => {
    const browse = vi.fn(async (input: { partialPath: string; cwd?: string }) => {
      const key = `${input.cwd ?? ""}::${input.partialPath}`;
      switch (key) {
        case "/repo::.agents/skills":
          return browseResult("/repo/.agents/skills", [
            {
              name: "review",
              fullPath: "/repo/.agents/skills/review",
            },
          ]);
        case "::/repo/.agents/skills/review":
          return browseResult("/repo/.agents/skills/review", [
            {
              name: "SKILL.md",
              fullPath: "/repo/.agents/skills/review/SKILL.md",
            },
          ]);
        case "::~/.agents/skills":
          return browseResult("/Users/test/.agents/skills", [
            {
              name: "agent-browser",
              fullPath: "/Users/test/.agents/skills/agent-browser",
            },
          ]);
        case "::/Users/test/.agents/skills/agent-browser":
          return browseResult("/Users/test/.agents/skills/agent-browser", [
            {
              name: "SKILL.json",
              fullPath: "/Users/test/.agents/skills/agent-browser/SKILL.json",
            },
          ]);
        case "/repo::.codex/skills":
        case "::~/.codex/skills":
        case "/repo::.agents/plugins":
        case "/repo::.codex/plugins":
        case "::~/.agents/plugins":
        case "::~/.codex/plugins":
          return browseResult(input.partialPath, []);
        default:
          throw new Error(`Unexpected browse call: ${key}`);
      }
    });

    const api = { filesystem: { browse } } as unknown as EnvironmentApi;
    const skills = await discoverLocalProviderSkills(api, "/repo");

    expect(skills).toEqual([
      expect.objectContaining({
        name: "review",
        path: "/repo/.agents/skills/review",
        scope: "project",
        shortDescription: "Project skill",
        enabled: true,
      }),
      expect.objectContaining({
        name: "agent-browser",
        path: "/Users/test/.agents/skills/agent-browser",
        scope: "user",
        shortDescription: "User skill",
        enabled: true,
      }),
    ]);
  });
});
