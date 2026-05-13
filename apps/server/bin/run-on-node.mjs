#!/usr/bin/env node
/**
 * Package bins point here so `bunx @polarish/agent` still runs on **Node**.
 * Bun executing `dist/bin.mjs` directly breaks Effect internals (`asEffect`, etc.)
 * because the bundle targets `@effect/platform-node` and Node APIs.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(__dirname, "..", "dist", "bin.mjs");
const result = spawnSync("node", [entry, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
  shell: false,
});
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
