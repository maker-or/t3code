#!/usr/bin/env node
/**
 * Blocks accidental `npm publish` / `npm pack` from the workspace manifest.
 * Publishing must use `node apps/server/scripts/cli.ts publish`, which rewrites
 * `catalog:` / `workspace:*` to registry-safe versions and strips devDependencies.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, "../package.json"), "utf8"));

function bad(spec) {
  return typeof spec === "string" && (spec.startsWith("catalog:") || spec.startsWith("workspace:"));
}

for (const [name, spec] of Object.entries(pkg.dependencies ?? {})) {
  if (bad(spec)) {
    console.error(
      `[publish] apps/server has dependencies['${name}'] = '${spec}' — npm cannot install that.\n` +
        `[publish] Publish only via: node apps/server/scripts/cli.ts publish`,
    );
    process.exit(1);
  }
}
