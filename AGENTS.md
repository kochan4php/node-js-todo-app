# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex, Cursor, …) when working with code in
this repository. It is the single source of truth; `CLAUDE.md` points here.

## Commands

```bash
pnpm dev                            # node --watch src/index.ts (needs a live MongoDB)
pnpm lint / pnpm lint:fix           # biome check
pnpm typecheck                      # tsc --noEmit for src/ and test/
pnpm test                           # node:test, all of test/*.test.ts (pretest runs typecheck)
pnpm test:coverage                  # same + 80% line threshold on src/
pnpm build && pnpm start            # tsc → dist/, then run dist/index.js

node --test test/http.test.ts                         # one file (skips the pretest typecheck)
node --test --test-name-pattern="archive" test/*.ts   # one test by name
```

`pnpm` only (lockfile + pinned `packageManager`). Node >= 24. Pre-commit runs lint-staged;
pre-push runs `pnpm test`. CI runs lint → typecheck → test → build → `pnpm audit --prod`.

## Runtime shape

TypeScript ESM executed **directly by Node** (type stripping, no ts-node in the dev/test path).
Consequences that break things if ignored:

- Relative imports must carry the `.ts` extension (`./app/helpers/render.ts`). `tsc` rewrites them for `dist/`.
- No enums, no decorators, no `namespace` — only erasable syntax.
- `src/index.ts` awaits `connectDb()` and *then* `await import('./app.ts')`. That dynamic import is
  load-bearing: [auth.ts](src/app/auth/auth.ts) grabs `mongoose.connection.db` at module top level and
  throws if the connection isn't up. Never convert it to a static import.

## Request pipeline ([src/app.ts](src/app.ts))

Order is deliberate — read the comments there before inserting middleware:

1. CSP nonce → `helmet` → Permissions-Policy → compression → static.
2. `app.all('/api/auth/*splat', toNodeHandler(auth))` **before** the body parsers; a parser that drains
   the stream breaks Better Auth.
3. `express.json({limit:'10kb'})`, skipped for `/api/import` and `/api/reorder` (their routes mount their own 1mb parser).
4. Routes: `seo` → `/api/health-check` → `auth` → **`app.use(requireAuth)`** → `todo` → `/api` → 404 → error handler.
   Anything mounted after that `requireAuth` line is session-gated; anything before it is public.

`requireAuth` puts the Better Auth session on `res.locals.session` for views.

## Layers

`routes/` → `app/controllers/` (parse + shape response) → `app/services/` (business logic, the only
place that touches Mongoose) → `app/models/` (schema + `toTodo()` document→DTO mapping).

- **Every controller renders through [`render()`](src/app/helpers/render.ts)**, never `res.render` directly —
  it injects title/description/canonical/og/`assetVersion` and the `no-cache` header.
- `renderPartial()` renders one EJS partial to a string so JSON responses can ship the same markup the
  full page uses. Keep item markup in `views/partials/`, not duplicated in JS.
- `resSuccess`/`resFailed` ([response.helper.ts](src/app/helpers/response.helper.ts)) are only used by the
  `/api` index and health check. The todo endpoints use their own `{ok, ...}` / `{success, ...}` shapes — match the neighbouring handler rather than unifying.

## Cross-cutting contracts (change one place, change the other)

- **Dual response.** Mutation controllers branch on `req.accepts(['html','json']) === 'json'`: JSON for
  fetch callers, `res.redirect('/?flash=<key>')` for no-JS forms. A new flash key must be added in **both**
  the `flashOf()` allowlist in [todo.controller.ts](src/app/controllers/todo.controller.ts) and the
  `FLASH_MESSAGES` map in [layouts/main.ejs](src/views/layouts/main.ejs), or it silently shows nothing.
- **Filter/sort is implemented twice.** `readView`/`hiddenBy`/`viewTodos` in the controller server-render
  the `?f=&s=&q=&c=` state so deep links and no-JS work; [public/js/app.js](public/js/app.js) recomputes the
  same predicate on the client. Both must stay identical.
- **Validation is duplicated on purpose.** [helpers/validate.ts](src/app/helpers/validate.ts) sanitizes input;
  the Mongoose schema repeats the same limits/enums as a second layer. Add a field to both.
- **Inline scripts need the nonce** (`nonce="<%= cspNonce %>"`), or CSP blocks them. External scripts must be
  self-hosted under `public/` — `default-src 'self'`.

## Client side

Two files, loaded on every page from the layout:

- [spa.js](public/js/spa.js) — Turbo-style navigation: intercepts same-origin GET links, fetches the page,
  swaps only `#main-content` plus head metadata and JSON-LD, then dispatches `spa:ready`.
- [app.js](public/js/app.js) — one IIFE whose `runPage()` re-binds every page-scoped handler; it runs once
  at load and again on each `spa:ready`.

So: **no per-page `<script>` blocks and no one-shot `DOMContentLoaded` handlers for page content.** New
behavior goes inside `runPage()` and must be idempotent (re-running it on a fresh DOM must not double-bind).
Handlers that must survive a swap (header, toasts, scroll-top) live outside `runPage()`.

## Data model

Single `Todo` schema in the `plans` collection: name, completed, priority enum, `due` as a `YYYY-MM-DD`
string, category, notes, `sortOrder`, `archived`, `repeat` enum, and an embedded `subtasks` array
(max 20, enforced in the service).

**Todos carry no owner field.** Auth gates *access* to the app; it does not scope data — every signed-in
account reads and writes the same shared list. Adding per-user todos means a `userId` on the schema plus
a filter in every `todo.service.ts` query. Better Auth owns its own collections (`user`, `session`,
`account`, `verification`) in the same database, plus app-owned `devices` and auth-event collections.

`TodoModel.create` is capped at `MAX_TODOS` inside `insertOne` — it returns `null` when full, and callers
translate that to a `full` flash / 400.

## Tests

`node:test` + `mongodb-memory-server`, no framework. [test/helpers/mongo.ts](test/helpers/mongo.ts) starts a
**replica set** (`MongoMemoryReplSet`) — Better Auth wraps writes in transactions that standalone mongod
rejects — and sets `NODE_ENV=production` + `BETTER_AUTH_SECRET` *before* any src module is imported, since
[config/app.ts](src/config/app.ts) reads env at import time. Each test file gets its own process and its own
server. `test/http.test.ts` boots a real Express server and drives it with `fetch`.

## Conventions

- Biome: 4-space indent, 140 columns, single quotes, trailing commas, `noExplicitAny: error`.
- UI copy and flash text are **Indonesian**; code, comments and commit messages are English.
- Comments often cite a numeric requirement id (`/* 1080 — P2: … */`). Keep the id when touching that code.
- `ponytail:` comments mark deliberate shortcuts with their ceiling — read before "fixing" them.
- Conventional Commits (`feat:`/`fix:`/`perf:`), one focused change per commit; CHANGELOG.md is maintained.
- `assetVersion` in asset URLs comes from `package.json` `version` — bump it to bust the CSS/JS cache.
- `dist/`, `data/` and `*.log` are gitignored; the app never writes app data to disk.

See [README.md](README.md) for env vars, routes, deployment and backup/restore, and
[CONTRIBUTING.md](CONTRIBUTING.md) for the PR checklist.
