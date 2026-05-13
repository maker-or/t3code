import type { ServerProviderSkill } from "@t3tools/contracts";

function normalizePathSeparators(pathValue: string): string {
  return pathValue.replaceAll("\\", "/");
}

const AGENTS_USER_SKILLS_SEGMENT = "/.agents/skills/";

function skillPathUnderProjectRoot(skillPath: string, projectRootAbs: string): boolean {
  const normalizedPath = normalizePathSeparators(skillPath).replace(/\/+$/, "");
  const root = normalizePathSeparators(projectRootAbs).replace(/\/+$/, "");
  if (!root) return false;
  return normalizedPath === root || normalizedPath.startsWith(`${root}/`);
}

/**
 * Skills shown in the `/` composer menu: project/workspace installs and user skills
 * under `~/.agents/skills` (detected via `/.agents/skills/` in the resolved path).
 */
export function filterProviderSkillsForSlashMenu(
  skills: ReadonlyArray<ServerProviderSkill>,
  projectRootAbs: string | null,
): ServerProviderSkill[] {
  return skills.filter((skill) => {
    if (!skill.enabled) return false;

    const normPath = normalizePathSeparators(skill.path);
    if (normPath.includes(AGENTS_USER_SKILLS_SEGMENT)) {
      return true;
    }

    const scope = skill.scope?.trim().toLowerCase();
    if (scope === "project" || scope === "workspace" || scope === "local") {
      return true;
    }

    if (projectRootAbs && skillPathUnderProjectRoot(skill.path, projectRootAbs)) {
      return true;
    }

    return false;
  });
}
