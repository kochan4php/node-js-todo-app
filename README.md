# Rencana

Aplikasi todo — **Express.js 5 + TypeScript (ESM) + EJS**, data tersentral di
**MongoDB** lewat **Mongoose ODM** (skema tunggal `Todo`), tanpa file data
lokal, tanpa cache, tanpa akun.

## Menjalankan

```bash
pnpm install
pnpm dev        # mode pengembangan (node --watch src/index.ts)
pnpm build      # kompilasi TS ke dist/
pnpm start      # jalankan dari dist/ (produksi)
```

Butuh MongoDB yang berjalan (`mongod` lokal, Docker, atau Atlas). Port default
`3000`; atur lewat env `PORT`. Env opsional:
`MONGODB_URI` (koneksi, default `mongodb://127.0.0.1:27017/rencana`),
`TODOS_LIMIT` (batas maksimum rencana, default 1000), `SITE_URL` (domain
absolut untuk canonical/sitemap).

## Struktur

```
src/
  app.ts                  perakitan middleware + rute
  index.ts                koneksi MongoDB → listen + graceful shutdown
  config/app.ts           konfigurasi env (PORT, MONGODB_URI, SITE_URL, MAX_TODOS)
  db/connect.ts           bootstrap koneksi (keluar bila DB tak terjangkau)
  routes/                 router per domain (todo, seo, main, health, not-found)
  app/controllers/        lapisan tipis: parse request → call service → render
  app/services/           logika bisnis + semua akses MongoDB (ODM)
  app/models/             skema Mongoose tunggal (Todo) + pemetaan dokumen
  app/helpers/            render (meta/canonical/asset version), date, respon API
  views/                  EJS (layouts, partials, halaman)
  logger/                 logger mini (info/warn/error + timestamp)
  interfaces/             type Todo
```

## Detail teknis

- Rute RESTful: `GET /`, `POST /`, `GET /add-todo`, `GET /edit-todo/:id`,
  `POST /toggle/:id`, `PUT /` (update), `DELETE /` (hapus), `POST /restore` (undo).
- Rute cadangan: `GET /api/export` (unduh JSON), `POST /api/import` (ganti data).
- Variabel design: Geist/Geist Mono self-host, Bento neutral zinc/slate,
  satu aksen teal. Tema gelap persist di `localStorage`.
- Storage: setiap mutasi adalah operasi Mongo via Mongoose (skema
  memvalidasi nama 200 karakter, boolean `completed`, enum prioritas, dan
  `due`); `createdAt`/`updatedAt` dikelola otomatis oleh `timestamps`.
- Aplikasi **tidak pernah menulis data ke disk** — server hanya menaruh log.

## Cadangan data

Semua data ada di koleksi MongoDB (basis data pada koneksi `MONGODB_URI`).
Untuk memastikan aman:

- **Unduh salinan** — tombol unduh di beranda atau `GET /api/export` menghasilkan
  berkas `todos.json` berisi seluruh rencana. Simpan di tempat aman.
- **Pulihkan** — tombol impor di beranda (pilih berkas `.json`) atau
  `POST /api/import` mengganti seluruh data saat ini. Impor menolak format yang
  tidak valid atau melebihi batas (`MAX_TODOS`) tanpa mengubah data lama.
- Pastikan basis data ikut di-cadangkan (backup/point-in-time dari penyedia
  MongoDB); ekspor JSON adalah jaring pengaman tambahan yang bisa diimpor ulang.

## Deploy & skala

State tinggal di MongoDB — server bebas *stateless*, cukup satu pengguna/keluarga
atau banyak pengguna lewat penyedia DB terkelola.

- **VPS/Railway/Fly**: jalankan `pnpm build && pnpm start`, set `PORT`,
  `MONGODB_URI` (mis. Atlas), dan `SITE_URL`; arahkan `GET /api/health-check`
  sebagai uptime check (mis. UptimeRobot/Cronitor) — respons menyertakan status
  koneksi DB (`data.db`). `trust proxy` sudah diset untuk satu reverse proxy
  (Nginx/Caddy).
- **Privasi**: tak ada akun atau cookie — namun data kini di basis data
  terpusat, bukan di perangkat. Sesuaikan penawaran privasi dengan itu.
- **Skala**: naikkan `TODOS_LIMIT` lewat env dan gunakan indeks Mongo yang
  didefinisikan skema bila perlu; tak ada perubahan UI yang dibutuhkan.

## Keamanan

- `helmet` aktif: X-Content-Type-Options, CSP `default-src 'self'` + nonce untuk
  script inline tema, Strict-Transport-Security, Referrer-Policy, dan
  `X-Powered-By` dimatikan.
- `Permissions-Policy` menolak geolokasi/kamera/mikro.
- Tidak ada cookie/session — risiko CSRF tidak ada. Tidak ada secret di repo.
- Input divalidasi: nama wajib string, di-trim, digabung spasi ganda, maks 200
  karakter; due dicek format `YYYY-MM-DD`; prioritas hanya low/medium/high.
  Skema Mongoose mengulang batasan itu sebagai lapisan kedua dan menolak nilai
  di luar enum prioritas.
- Body parser limit 10kb; mutasi direspon `Cache-Control: no-store`.
- Tidak ada file data di repo — aplikasi menulis hanya log; kredensial DB lewat
  env `MONGODB_URI`, tidak pernah di commit.

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
(validator, service, skema model), integrasi HTTP (server Express sungguhan via
`fetch`), default & enum skema Mongoose, batas maksimum, XSS/escape, Unicode,
dan smoke produksi. Tiap file tes memakai `mongodb-memory-server` (MongoDB di
memori, tanpa instalasi server terpisah) lewat `<uri internal>`; `pretest`
menjalankan typecheck dulu; `test:coverage` gagal bila cakupan garis `src/` di
bawah 80%.

Husky pre-commit menjalankan biome + lint-staged; pre-push menjalankan
`pnpm test`. Commit memakai conventional (feat:/fix:/perf:). Rincian siklus
rilis ada di [CHANGELOG.md](CHANGELOG.md) dan panduan kontribusi ada di
[CONTRIBUTING.md](CONTRIBUTING.md).

## Lisensi

Apache-2.0