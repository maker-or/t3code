import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/bin.ts"],
  format: ["esm"],
  checks: {
    legacyCjs: false,
  },
  outDir: "dist",
  sourcemap: true,
  clean: true,
  /**
   * Inline Effect into one runtime (avoid duplicate `effect` on npm installs).
   * Keep `@effect/sql-sqlite-bun` **external**: it imports `bun:sqlite` and cannot be bundled for Node.
   */
  noExternal: (id) => {
    if (id === "@effect/sql-sqlite-bun" || id.startsWith("@effect/sql-sqlite-bun/")) {
      return false;
    }
    return (
      id.startsWith("@t3tools/") ||
      id.startsWith("effect-acp") ||
      id === "effect" ||
      id.startsWith("effect/") ||
      id.startsWith("@effect/")
    );
  },
  inlineOnly: false,
  banner: {
    js: "#!/usr/bin/env node\n",
  },
});
