# Changelog

Project changelog — follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) & [SemVer](https://semver.org/).

## [Unreleased]

### Added

- **SPA-style navigation** (Turbo/Hotwire approach): `public/js/spa.js` intercepts
  internal same-origin GET links and swaps only the `<main>` region + matching
  head metadata (`<title>`, description, canonical, OpenGraph/Twitter) into the
  current document, so the chrome (header, theme, toasts, footer) never reloads
  and navigation feels instant with no page flash. Every navigation re-fetches a
  fresh full HTML document and the per-page `spa:ready` event re-binds the page
  scripts; Back/Forward restore instantly from a small LRU cache and restore
  scroll position per page. Errors, redirects (e.g. session expiry) and missing
  `<main>` fall back to a normal full navigation; forms still submit natively.
- **Navigation progress bar** (follows the accent color, `scaleX`-animated,
  respects `prefers-reduced-motion`): shown during every SPA page fetch and as
  a short flash on cache hits.

### P0 — motivation layer (track progress, sort & tag your plans)

- **Category**: optional free-text tag (max 40 chars, sanitized) on every plan.
  - Badge shown on list items, accent-tinted.
  - Category `<select>` filter in the toolbar (client-side, syncs to `?c=` in
    the URL like search/filter/sort); the add/edit forms offer existing
    categories via a `<datalist>`. Quick-add inherits the selected category.
- **Completion history (`completedAt`)** → **daily streak + 7-day mini chart**:
  toggling a plan done/undone stamps/clears `completedAt`; the ledger now shows
  "N hari berturut-turut" and a last-7-days bar chart (accessible `role="img"`,
  per-day tooltips, zero days rendered muted).
- **Quick-add**: inline "Tambahkan rencana cepat…" field on the home page.
  Without JS it posts normally (full reload); with JS it appends the rendered
  item server-side (`POST /` returns `{ok, todo, html}` over JSON — the
  `partials/todo-item` view is the single source of item markup via a new
  `renderPartial()` helper in `render.ts`), re-wiring toggle/edit/delete on the
  new node without a reload.
- **Manual order + drag & drop**: each plan stores `sortOrder`; the list sorts
  by `{ completed, sortOrder, createdAt }`. A drag handle reorders the visible
  list (delegated on the container) and `POST /api/reorder` persists the new
  order in one `bulkWrite` (≤1mb JSON body, exempt from the global 10kb limit
  like `/api/import`). Reordering is only offered when the *whole* list is
  visible (no search/filter/sort/category) so a partial view never reorders
  against a misleading subset.
### P1 — notes & archive (keep context, retire plans)

- **Notes**: optional free-text note (max 2000 chars, sanitized) on every plan.
  Rendered as a muted second line under the name with note HTML escaped; written
  in the add/edit forms; sent through `POST /` (quick-add too), `PUT /`, and
  preserved by delete-undo (`POST /restore`) and `api/export`/`api/import`.
- **Archive**: "arsipkan" sets a plan aside without deleting it.
  - `POST /archive/:id` toggles `archived` (same button restores it); a new
    "Arsip" filter chip shows the archived count and lists retired plans.
  - Archived plans are hidden from the default list and **excluded from the
    ledger** (total/active/done, streak, 7-day chart — `statsOf` now computes
    over live plans only; `stats.archived` feeds the chip count).
  - Archived plans stay in the DOM (`data-archived`, `is-archived`, server-side
    `hidden`) so the Arsip filter runs client-side with no server round-trip;
    they are never draggable, never counted, and still exportable.
- **Authentication** via [Better Auth](https://better-auth.com) (email +
  password, MongoDB adapter sharing the Mongoose connection):
  - `POST /register` & `POST /login` (Indonesian UI), `POST /logout`;
    protected todo pages + `/api` backup endpoints redirect to `/login`.
  - Session cookies (`rencana.*`), 7-day expiry with 24h sliding update, rate
    limiting per sign-in/sign-up endpoint, `BETTER_AUTH_SECRET` required in
    production.
  - `GET /account` page (account + security; legacy `/security` URL aliases
    still work): shows account details, a change-password form, login
    devices, and the auth activity trail. Every login records the client IP,
    IP version, browser, browser version, rendering engine, OS, OS version,
    device model, vendor, browser language, auth method, and a stable
    `deviceHash` fingerprint in a `devices` collection; `userId` is a real
    ObjectId reference to the `user` collection (Mongoose `UserModel`
    pass-through). Active sessions can be revoked individually or all at once.
  - Full authentication audit trail in an `authEvents` collection: each
    sign-up, sign-in (success or failure with reason), sign-out, password
    change, session revoke (single or all) stores the complete device client
    context + outcome, shown chronologically on `GET /account` as "Aktivitas
    login".
  - Login & register pages redesigned to the same full-width layout as the
    home page (two-column hero: copy + form card), with benefits list and
    inline security/device copy.
  - `/api/auth/*` handled by Better Auth's Node handler, mounted before the
    body parsers.

### P2 — recurring plans, subtasks, bulk actions & deep-linkable filters

- **Recurring plans ("lagi-lagi")**: optional `daily`/`weekly`/`monthly`
  repeat on every plan (dropdown in add/edit + quick-add). Completing a plan
  with a repeat stamps it done like any other *and* spawns the next occurrence
  server-side — same name/priority/category/notes/streak-piece, due advanced
  (`+1 day`, `+7 days`, or same day-of-month clamped to the last day of the
  target month, leap-year aware), fresh checklist. Un-completing never spawns;
  the store rate-limits spawns at `MAX_TODOS` silently. The list item shows a
  "Harian · lagi-lagi" badge. Repeat survives edit, delete-undo (`POST
  /restore`) and `api/export`/`api/import`. Bulk complete intentionally does
  **not** spawn (documented in `todo.service.ts`).
- **Subtasks ("langkah-langkah kecil")**: an embedded checklist (max 20 rows,
  names trimmed to the same rules as plan names) on every plan. Added/toggled/
  removed across one `POST /api/subtasks` (`{id, action, index, text}`), which
  re-renders the shared `partials/subtask-rows` for the JSON path and the
  edit page for no-JS; rows render on the list item with "X dari Y langkah
  selesai", and the full editor lives on `GET /edit-todo/:id`. Undo/delete
  round-trips subtasks via hidden fields; export/import carry them.
- **Bulk actions**: a per-item checkbox (`.todo-select`) enables a sticky
  action bar ("Selesaikan / Arsipkan / Hapus / Batal"). `POST /api/bulk`
  (`{ids, action}`) validates the action, keeps only valid ObjectIds, and
  applies it idempotently (`updateMany $set` / `deleteMany`); 400 on an empty
  set or unknown action.
- **Server-rendered view state (deep links)**: `GET /` now honors `?f=`
  (`all|active|done|archive`), `?s=` (`newest|az|za`), `?q=` (search) and
  `?c=` (category) server-side with the same predicate the client applies
  (`hiddenBy`/`viewTodos` in the controller), so no-JS access and deep/shared
  links render the correct list. The toolbar is a GET form (`id="toolbar"`
  with preselected controls); JSON-LD ItemList and the empty-filtered state
  use the server-filtered set. JS keeps working client-side with zero
  requests — the DOM retains every item (`hidden` attr only) so stats and
  counts stay consistent.

### Changed

- Navbar decluttered: signed-in header now shows a one-letter user avatar
  (link to `/account`), an accent-filled "Tambah" pill, and a hairline divider
  before the theme/logout circles — the old name chip and mixed icon buttons
  are gone. The header island keeps the exact `--content-w` column as the page
  content (one shared width token).
- Footer redesigned: brand + tagline and contextual links ("Beranda", plus
  "Akun & keamanan" when signed in or "Masuk"/"Daftar" for guests) aligned to
  the same content column, with a separated meta line; previously a single
  centered line across the full viewport.
- `GET /account` page redesigned so no card is stretched and no empty space
  is left dangling inside or between cards: "Detail akun" and "Sesi aktif"
  share the top row, the "Ganti kata sandi" form is kept compact with its two
  new-password fields side by side (half its old height), and "Pintasan"
  becomes a full-width horizontal action bar instead of a sparse column.

- Database + collection renamed to fully English: default `MONGODB_URI` is now
  `mongodb://127.0.0.1:27017/planner` (was `…/rencana`); test database
  `planner-test`; collection `todos` → `plans`; exported backup file
  `todos.json` → `plans.json`. Schema field names and enums were already
  English (`name`, `completed`, `priority`, `due`, `createdAt`/`updatedAt`,
  priorities `low`/`medium`/`high`).
  Note: an existing local `rencana` database is not migrated automatically —
  rename it or start fresh.

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