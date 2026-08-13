# Contributing

Thanks for your interest. Please follow the process below.

## Before you start

1. Open or find an issue for your change.
2. Ensure the issue carries the `status:approved` label — this signals maintainer approval before writing code.

## Development

1. Branch from `main` with a focused scope.
2. Make your changes.
3. Run `pnpm exec biome check .` and `pnpm run test:unit` — fix all failures.

Useful commands (all from the repository root):

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start the dev server |
| `pnpm exec astro check` | Type check |
| `pnpm exec biome check .` | Lint and format check |
| `pnpm run test:unit` | Unit tests (Vitest) |
| `pnpm run test:e2e` | E2E tests (Playwright, requires `pnpm exec playwright install chromium` first) |
| `pnpm run build` | Production build into `dist/` |

## Pull request

- Reference the issue: `Closes #N`, `Fixes #N`, or `Resolves #N`.
- Apply exactly one type label from the accepted set: `type:bug`, `type:feature`, `type:refactor`, `type:docs`, `type:chore`, `type:breaking-change`.
- Keep the diff at **≤400 lines**. If it must exceed that, add `size:exception` with a brief justification.
