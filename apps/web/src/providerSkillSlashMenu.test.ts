import { describe, expect, it } from "vitest";

import type { ServerProviderSkill } from "@t3tools/contracts";

import { filterProviderSkillsForSlashMenu } from "./providerSkillSlashMenu";

function skill(partial: Partial<ServerProviderSkill> & Pick<ServerProviderSkill, "name" | "path">) {
  return {
    enabled: true,
    ...partial,
  } satisfies ServerProviderSkill;
}

describe("filterProviderSkillsForSlashMenu", () => {
  it("includes skills under ~/.agents/skills", () => {
    const skills = [
      skill({
        name: "agent-browser",
        path: "/Users/test/.agents/skills/agent-browser/SKILL.md",
        scope: "user",
      }),
    ];
    expect(filterProviderSkillsForSlashMenu(skills, null).map((s) => s.name)).toEqual([
      "agent-browser",
    ]);
  });

  it("includes project-scoped skills", () => {
    const skills = [
      skill({
        name: "review",
        path: "/proj/.codex/skills/review/SKILL.md",
        scope: "project",
      }),
    ];
    expect(filterProviderSkillsForSlashMenu(skills, "/proj").map((s) => s.name)).toEqual([
      "review",
    ]);
  });

  it("includes skills whose path is inside the project root", () => {
    const skills = [
      skill({
        name: "local-skill",
        path: "/repo/foo/.agents/skills/local-skill/SKILL.md",
      }),
    ];
    expect(filterProviderSkillsForSlashMenu(skills, "/repo/foo").map((s) => s.name)).toEqual([
      "local-skill",
    ]);
  });

  it("excludes system plugin-only skills that are not under project or user agents skills", () => {
    const skills = [
      skill({
        name: "imagegen",
        path: "/usr/local/share/codex/skills/imagegen/SKILL.md",
        scope: "system",
      }),
    ];
    expect(filterProviderSkillsForSlashMenu(skills, "/repo")).toEqual([]);
  });

  it("excludes disabled skills", () => {
    const skills = [
      skill({
        name: "off",
        path: "/Users/test/.agents/skills/off/SKILL.md",
        enabled: false,
      }),
    ];
    expect(filterProviderSkillsForSlashMenu(skills, null)).toEqual([]);
  });
});
