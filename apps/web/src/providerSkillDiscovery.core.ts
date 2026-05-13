import type { EnvironmentApi, ServerProviderSkill } from "@t3tools/contracts";

type SkillDiscoveryRoot = {
  readonly partialPath: string;
  readonly scope: "project" | "user";
  readonly shortDescription: string;
  readonly nestedSkillsDirectory?: boolean;
};

const SKILL_DISCOVERY_ROOTS: ReadonlyArray<SkillDiscoveryRoot> = [
  { partialPath: ".agents/skills", scope: "project", shortDescription: "Project skill" },
  { partialPath: ".codex/skills", scope: "project", shortDescription: "Project skill" },
  { partialPath: "~/.agents/skills", scope: "user", shortDescription: "User skill" },
  { partialPath: "~/.codex/skills", scope: "user", shortDescription: "User skill" },
  {
    partialPath: ".agents/plugins",
    scope: "project",
    shortDescription: "Project skill",
    nestedSkillsDirectory: true,
  },
  {
    partialPath: ".codex/plugins",
    scope: "project",
    shortDescription: "Project skill",
    nestedSkillsDirectory: true,
  },
  {
    partialPath: "~/.agents/plugins",
    scope: "user",
    shortDescription: "User skill",
    nestedSkillsDirectory: true,
  },
  {
    partialPath: "~/.codex/plugins",
    scope: "user",
    shortDescription: "User skill",
    nestedSkillsDirectory: true,
  },
];

function normalizeSkillPath(path: string): string {
  return path.replaceAll("\\", "/").replace(/\/+$/, "");
}

function mergeSkillEntry(
  existing: ServerProviderSkill,
  next: ServerProviderSkill,
): ServerProviderSkill {
  return {
    ...existing,
    ...next,
    enabled: existing.enabled && next.enabled,
    displayName: existing.displayName ?? next.displayName,
    description: existing.description ?? next.description,
    shortDescription: existing.shortDescription ?? next.shortDescription,
    scope: existing.scope ?? next.scope,
  };
}

function skillIdentity(skill: Pick<ServerProviderSkill, "path">): string {
  return normalizeSkillPath(skill.path);
}

export function mergeProviderSkills(
  providerSkills: ReadonlyArray<ServerProviderSkill>,
  discoveredSkills: ReadonlyArray<ServerProviderSkill>,
): ServerProviderSkill[] {
  const merged = new Map<string, ServerProviderSkill>();

  for (const skill of providerSkills) {
    merged.set(skillIdentity(skill), skill);
  }

  for (const skill of discoveredSkills) {
    const key = skillIdentity(skill);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, mergeSkillEntry(existing, skill));
      continue;
    }
    merged.set(key, skill);
  }

  return [...merged.values()];
}

async function browseSkillsInDirectory(
  api: EnvironmentApi,
  directoryPath: string,
  cwd: string | undefined,
  root: SkillDiscoveryRoot,
): Promise<ServerProviderSkill[]> {
  try {
    const directoryResult = await api.filesystem.browse({
      partialPath: directoryPath,
      ...(directoryPath.startsWith("~") ? {} : cwd ? { cwd } : {}),
    });

    const discovered = directoryResult.entries.map(
      (entry) =>
        ({
          name: entry.name,
          path: entry.fullPath,
          enabled: true,
          scope: root.scope,
          shortDescription: root.shortDescription,
        }) satisfies ServerProviderSkill,
    );

    return discovered.flatMap((skill) => (skill ? [skill] : []));
  } catch {
    return [];
  }
}

async function browseSkillsAtRoot(
  api: EnvironmentApi,
  root: SkillDiscoveryRoot,
  cwd: string | undefined,
): Promise<ServerProviderSkill[]> {
  if (root.nestedSkillsDirectory) {
    try {
      const rootResult = await api.filesystem.browse({
        partialPath: root.partialPath,
        ...(root.partialPath.startsWith("~") ? {} : cwd ? { cwd } : {}),
      });

      const nested = await Promise.all(
        rootResult.entries.map(async (entry) =>
          browseSkillsInDirectory(api, `${entry.fullPath}/skills`, undefined, root),
        ),
      );

      return nested.flat();
    } catch {
      return [];
    }
  }

  return browseSkillsInDirectory(api, root.partialPath, cwd, root);
}

export async function discoverLocalProviderSkills(
  api: EnvironmentApi,
  cwd: string | undefined,
): Promise<ServerProviderSkill[]> {
  const results = await Promise.all(
    SKILL_DISCOVERY_ROOTS.map((root) => browseSkillsAtRoot(api, root, cwd)),
  );
  return results.flat();
}
