# Contributing

Thanks for taking the time to contribute! This project is small and
self-hosted — help us keep it that way.

## Setting up

```bash
pnpm install        # install dependencies
pnpm dev            # run the dev server (auto-reload)
```

## Quality gates

Everything must be green before shipping a change:

| Command | Purpose |
|---|---|
| `pnpm lint` | Biome rules (format + quality). Optional: `pnpm lint:fix`. |
| `pnpm typecheck` | Type checking for `src/` and `test/`. |
| `pnpm test` | `node:test` — unit + integration (runs typecheck first). |
| `pnpm test:coverage` | Same, with an 80% line-coverage threshold. |
| `pnpm build` | Compile TypeScript to `dist/`. |

## Commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(export): add a download button for the JSON copy
fix(accessibility): dialog focus starts on the Cancel button
```

Written in English, one focused change per commit.

## PR checklist

Follow the template in `.github/PULL_REQUEST_TEMPLATE.md`. Most importantly:
your changes pass `pnpm lint`, `pnpm typecheck`, and `pnpm test`, and — when
adding behavior — come with one small test that fails if that behavior breaks.