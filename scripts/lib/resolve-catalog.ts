/**
 * Resolve `catalog:` dependency specs using the workspace catalog.
 *
 * Pure function: returns a new record with every `catalog:…` value replaced by
 * the concrete version string found in `catalog`. Throws on missing entries.
 */
export function resolveCatalogDependencies(
  dependencies: Record<string, string>,
  catalog: Record<string, string>,
  label: string,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(dependencies).map(([name, spec]) => {
      if (typeof spec !== "string" || !spec.startsWith("catalog:")) {
        return [name, spec];
      }

      const catalogKey = spec.slice("catalog:".length).trim();
      const lookupKey = catalogKey.length > 0 ? catalogKey : name;
      const resolved = catalog[lookupKey];

      if (typeof resolved !== "string" || resolved.length === 0) {
        throw new Error(
          `Unable to resolve '${spec}' for ${label} dependency '${name}'. Expected key '${lookupKey}' in root workspace catalog.`,
        );
      }

      return [name, resolved];
    }),
  );
}

/** Fail fast if any dependency spec is not installable from the npm registry (e.g. `catalog:`, `workspace:*`). */
export function assertRegistryDependencySpecs(
  dependencies: Record<string, string>,
  label: string,
): void {
  for (const [name, spec] of Object.entries(dependencies)) {
    if (typeof spec !== "string") {
      throw new Error(`${label}: dependency '${name}' has non-string spec.`);
    }
    if (spec.startsWith("catalog:") || spec.startsWith("workspace:")) {
      throw new Error(
        `${label}: dependency '${name}' still has monorepo spec '${spec}'. Publishing would break npm/bun installs.`,
      );
    }
  }
}
