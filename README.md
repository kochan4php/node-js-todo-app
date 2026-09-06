# Rencana

Todo app — **Express.js 5 + TypeScript (ESM) + EJS**, data centralized in
**MongoDB** via **Mongoose ODM** (single `Todo` schema), with no local data
files, no cache, no accounts.

## Running

```bash
pnpm install
pnpm dev        # development mode (node --watch src/index.ts)
pnpm build      # compile TS to dist/
pnpm start      # run from dist/ (production)
```

You need a running MongoDB (`mongod` locally, Docker, or Atlas). Default port
`3000`; set via env `PORT`. Optional env vars:
`MONGODB_URI` (connection, default `mongodb://127.0.0.1:27017/planner`),
`TODOS_LIMIT` (max number of todos, default 1000), `SITE_URL` (absolute
domain for canonical/sitemap).

## Structure

```
src/
  app.ts                  middleware assembly + routes
  index.ts                MongoDB connection → listen + graceful shutdown
  config/app.ts           env config (PORT, MONGODB_URI, SITE_URL, MAX_TODOS)
  db/connect.ts           connection bootstrap (exit when DB is unreachable)
  routes/                 per-domain routers (todo, seo, main, health, not-found)
  app/controllers/        thin layer: parse request → call service → render
  app/services/           business logic + all MongoDB access (ODM)
  app/models/             single Mongoose schema (Todo) + document mapping
  app/helpers/            render (meta/canonical/asset version), date, API response
  views/                  EJS (layouts, partials, pages)
  logger/                 mini logger (info/warn/error + timestamp)
  interfaces/             Todo type
```

## Technical details

- RESTful routes: `GET /`, `POST /`, `GET /add-todo`, `GET /edit-todo/:id`,
  `POST /toggle/:id`, `PUT /` (update), `DELETE /` (delete), `POST /restore` (undo).
- Backup routes: `GET /api/export` (download JSON), `POST /api/import` (replace data).
- Design tokens: self-hosted Geist/Geist Mono, neutral Bento zinc/slate,
  one desaturated accent. Dark theme persists in `localStorage`.
- Storage: every mutation is a Mongo operation through Mongoose (the schema
  validates the 200-char name, boolean `completed`, priority enum, and `due`);
  `createdAt`/`updatedAt` handled automatically by `timestamps`.
- The app **never writes data to disk** — the server only writes logs.

## Data backup

All data lives in the MongoDB collection (the database on the `MONGODB_URI`
connection). To keep it safe:

- **Download a copy** — the download button on the home page or
  `GET /api/export` produces a `plans.json` file with all todos. Store it in a
  safe place.
- **Restore** — the import button on the home page (pick a `.json` file) or
  `POST /api/import` replaces all current data. Import rejects invalid
  formats or anything over the limit (`MAX_TODOS`) without touching old data.
- Make sure the database itself is backed up (provider-level backup or
  point-in-time from MongoDB); the JSON export is an extra safety net you can
  re-import.

## Deploying & scaling

State lives in MongoDB — the server is fully *stateless*, good enough for a
single user/family or many users via a managed DB provider.

- **VPS/Railway/Fly**: run `pnpm build && pnpm start`, set `PORT`,
  `MONGODB_URI` (e.g. Atlas), and `SITE_URL`; point `GET /api/health-check`
  at an uptime monitor (e.g. UptimeRobot/Cronitor) — the response includes the
  DB connection status (`data.db`). `trust proxy` is set for one reverse
  proxy (Nginx/Caddy).
- **Privacy**: no accounts or cookies — but data now lives in a centralized
  database, not on-device. Adjust your privacy story accordingly.
- **Scaling**: raise `TODOS_LIMIT` via env and use the Mongo indexes defined
  in the schema if needed; no UI changes required.

## Security

- `helmet` enabled: X-Content-Type-Options, CSP `default-src 'self'` + nonce
  for the inline theme script, Strict-Transport-Security, Referrer-Policy,
  and `X-Powered-By` off.
- `Permissions-Policy` denies geolocation/camera/microphone.
- No cookies/sessions — no CSRF surface. No secrets in the repo.
- Input validated: name is a required string, trimmed, double spaces
  collapsed, max 200 chars; `due` checked as `YYYY-MM-DD`; priority only
  low/medium/high. The Mongoose schema repeats those limits as a second layer
  and rejects out-of-enum priority values.
- Body-parser limit 10kb; mutations answered with `Cache-Control: no-store`.
- No data files in the repo — the app writes only logs; DB credentials go
  through the `MONGODB_URI` env, never committed.

## Quality gate

```bash
pnpm lint          # biome check
pnpm typecheck     # tsc --noEmit (src + test)
pnpm test          # node:test (+ pretest: typecheck runs automatically)
pnpm test:coverage # node:test + coverage report (80% src/ line threshold)
pnpm build         # tsc → dist/
```

The `test/` suite uses built-in `node:test` (no extra dependencies) and runs
Node 24 directly on TypeScript requests — covering unit (validator, service,
model schema), HTTP integration (real Express server via `fetch`), Mongoose
schema defaults & enums, max limits, XSS/escaping, Unicode, and a production
smoke test. Each test file uses `mongodb-memory-server` (in-memory MongoDB,
no separate server install) via an internal `<uri>`; `pretest` runs typecheck
first; `test:coverage` fails when `src/` line coverage drops below 80%.

Husky pre-commit runs biome + lint-staged; pre-push runs `pnpm test`.
Commits use conventional style (feat:/fix:/perf:). Release history lives in
[CHANGELOG.md](CHANGELOG.md); contribution guide in
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache-2.0