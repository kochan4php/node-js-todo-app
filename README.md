# Rencana

Aplikasi todo 100% lokal — **Express.js 5 + TypeScript (ESM) + EJS**, data
tersimpan di `data/todos.json` tanpa database, cache, atau akun.

## Menjalankan

```bash
pnpm install
pnpm dev        # mode pengembangan (node --watch src/index.ts)
pnpm build      # kompilasi TS ke dist/
pnpm start      # jalankan dari dist/ (produksi)
```

Port default `3000`; atur lewat env `PORT`. Env opsional:
`DATA_PATH` (lokasi file data), `TODOS_LIMIT` (batas maksimum rencana,
default 1000), `SITE_URL` (domain absolut untuk canonical/sitemap).

## Struktur

```
src/
  app.ts                  perakitan middleware + rute
  index.ts                listen + graceful shutdown
  config/app.ts           konfigurasi env (PORT, DATA_PATH, SITE_URL, MAX_TODOS)
  routes/                 router per domain (todo, seo, main, health, not-found)
  app/controllers/        lapisan tipis: parse request → call service → render
  app/services/           logika bisnis + soal persistence
  app/store/              read/write JSON (muat ke memori, simpan atomic)
  app/helpers/            render (meta/canonical/asset version), date, respon API
  views/                  EJS (layouts, partials, halaman)
  logger/                 logger mini (info/warn/error + timestamp)
  interfaces/             type Todo
```

## Detail teknis

- Rute RESTful: `GET /`, `POST /`, `GET /add-todo`, `GET /edit-todo/:id`,
  `POST /toggle/:id`, `PUT /` (update), `DELETE /` (hapus), `POST /restore` (undo).
- Variabel design: Geist/Geist Mono self-host, Bento neutral zinc/slate,
  satu aksen teal. Tema gelap persist di `localStorage`.
- Storage: JSON dimuat sekali ke memori, mutasi ditulis atomic (tmp + rename);
  file dibuat otomatis saat run pertama; korup dicadangkan ke `.bak`.

## Keamanan

- `helmet` aktif: X-Content-Type-Options, CSP `default-src 'self'` + nonce untuk
  script inline tema, Strict-Transport-Security, Referrer-Policy, dan
  `X-Powered-By` dimatikan.
- `Permissions-Policy` menolak geolokasi/kamera/mikro.
- Tidak ada cookie/session — risiko CSRF tidak ada. Tidak ada secret di repo.
- Input divalidasi: nama wajib string, di-trim, digabung spasi ganda, maks 200
  karakter; due dicek format `YYYY-MM-DD`; prioritas hanya low/medium/high.
- Body parser limit 10kb; mutasi direspon `Cache-Control: no-store`.
- `data/todos.json` (berisi data pribadi) tidak ikut git; cuma `public/` yang
  dilayani static. Saat JSON korup, disalin ke `.bak` lalu mulai dari kosong.

## Quality gate

```bash
pnpm lint          # biome check
pnpm typecheck     # tsc --noEmit (src + test)
pnpm test          # node:test (+ pretest: typecheck otomatis)
pnpm test:coverage # node:test + laporan coverage (threshold 80% baris src/)
pnpm build         # tsc → dist/
```

Suite `test/` memakai `node:test` bawaan (tanpa dependency tambahan) dan
menjalankan Node 24 langsung untuk request TypeScript — mencakup unit
(validator, service, store), integrasi HTTP (sever Express sungguhan via
`fetch`), korupsi JSON, batas maksimum, XSS/escape, Unicode, dan smoke
produksi. `pretest` menjalankan typecheck dulu; `test:coverage` gagal bila
cakupan garis `src/` di bawah 80%.

Husky pre-commit menjalankan biome + lint-staged. Commit memakai
conventional (feat:/fix:/perf:).

## Lisensi

Apache-2.0