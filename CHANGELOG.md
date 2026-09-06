# Changelog

Project changelog — follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) & [SemVer](https://semver.org/).

## [0.3.0] — 2026-09-06

Storage moved fully from local JSON files to **MongoDB via Mongoose ODM**.
The app no longer touches any data on disk — when deployed, all data lives in
the database pointed to by `MONGODB_URI`.

### Added

- Single Mongoose `Todo` schema (`name` 200 chars, `completed`, `priority`
  enum, `due`, automatic `createdAt`/`updatedAt`) in `src/app/models/`.
- Connection bootstrap `src/db/connect.ts` in index: the app refuses to start
  when MongoDB is unreachable, and closes the connection on termination
  signals.
- `GET /api/health-check` now reports the DB connection status (`data.db`).
- Tests use `mongodb-memory-server` (in-memory MongoDB per test process, no
  server to install locally); CI caches the mongod binary and allows the
  build script via `pnpm-workspace.yaml`.

### Changed

- Service and controller became async; all data access goes through the
  Mongoose model (`getAll` sorted by `createdAt` desc, `MAX_TODOS` computed
  via `countDocuments`); ids changed from UUID strings to ObjectId hex (24
  chars) — mapped automatically to `id` in controller/view.
- Export/import still uses the `todos.json` file as the backup format; import
  replaces the whole collection and preserves `createdAt`/`updatedAt` from
  the backup.
- `src/app/store/todo.store.ts` (JSON read/write + buffer + `.bak`) removed,
  along with its two file-storage tests; replaced with schema default & enum
  tests.
- README/package.json updated: `MONGODB_URI` (default
  `mongodb://127.0.0.1:27017/rencana`), `mongodb`/`mongoose` keywords, 0.3.0.

### Fixed

- The delete-confirmation dialog now renders exactly centered in the viewport
  at every screen width (full-width grid shell + centered card; before, the
  440px card drifted left because the shell shrank to the description text's
  width).

## [0.2.0] — 2026-09-06

First stable version — every revision section completed: performance, SEO,
security, accessibility, testing, and project governance.

### Added

- Client interactions: search, sort (newest / A–Z / Z–A), status filter,
  done toggle, back-to-top button, keyboard shortcuts (`/` search, `n` new).
- Time rendered in native `<time>` + `datetime` placeholders, no framework.
- Optimal cache values (immutable 1 year · revalidation 1 hour) and stable
  list storage in `data/todos.json`.
- Friendly `404` and `500` pages, consistent `lang="id"`, plus `robots`
  `noindex` on non-content pages.
- `sitemap.xml` and `robots.txt` route maps.
- Light/dark theme pill synced with `localStorage` + `prefers-color-scheme`.
- Smooth GSAP transitions honoring `prefers-reduced-motion`.
- Data protection: corrupt JSON backed up to `.bak`, a hard `MAX_TODOS`
  capacity, impossible deadlines rejected at the date node (UTC).
- Security: nonce-based CSP, standard headers (helmet), `Permissions-Policy`,
  `X-Frame-Options`, centralized error handling, logs not flooding on health.
- `GET /api/export` and `POST /api/import` routes for JSON data backups.
- Accessibility: skip link, confirm-dialog focus on the "Batal" button,
  native form validation (`required`), `aria-live` for the list and recap,
  fully keyboard-operable search and filter.
- Testing: `node:test` with zero extra dependencies — 29 test cases (validator
  unit tests, service, corrupt storage, HTTP integration), 80% line-coverage
  threshold.
- GitHub Actions CI (lint, typecheck, build, test, audit) and Husky pre-push
  gates.

### Changed

- Storage is loaded once into memory and written atomically (write to `.tmp`
  then rename), fixing latency and file consistency.
- `package.json` uses `"type": "module"`; dev `node --watch src/index.ts`,
  test `node --test "test/*.test.ts"`.

### Fixed

- Modal actions use `<button>` instead of `<a>` — no navigation triggered.
- Status filter uses `BG` & `Set-Cookie` refreshed only when it changes.
- Masthead form description no longer jitters because of `content-visibility`.
- Recap numbers in the markup are stable (no GSAP animations mutating initial
  text).
- Corrupt storage on the first run writes the `.bak` before starting empty.

### Security

- Dependencies free of known vulnerabilities (`pnpm audit` clean).
- All data stored locally on-device — no accounts, no cross-user leakage.

## [0.1.0] — project start

- Scaffolded from `express-ts-starter`: Express + TypeScript + EJS +
  express-ejs-layouts.