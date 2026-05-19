# polarish

polarish is a minimal web GUI for coding agents (currently Codex, Claude, and OpenCode, more coming soon).

## Installation

> [!WARNING]
> polarish currently supports Codex, Claude, and OpenCode.
> Install and authenticate at least one provider before use:
>
> - Codex: install [Codex CLI](https://developers.openai.com/codex/cli) and run `codex login`
> - Claude: install [Claude Code](https://claude.com/product/claude-code) and run `claude auth login`
> - OpenCode: install [OpenCode](https://opencode.ai) and run `opencode auth login`

### Run without installing

Requires **Node.js 22.19+** on your PATH. The CLI always runs on Node (use `npx` or `bunx`; the published `bin` re-execs Node so `bunx` is safe).

```bash
npx @polarish/agent
# or
bunx @polarish/agent
```

## Some notes

We are very very early in this project. Expect bugs.

We are not accepting contributions yet.

Observability guide: [docs/observability.md](./docs/observability.md)

Need support? Join the [Discord](https://discord.gg/S928NjYv).
