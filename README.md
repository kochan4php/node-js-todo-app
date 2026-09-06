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

## Quality gate

```bash
pnpm lint        # biome check
pnpm typecheck   # tsc --noEmit
pnpm build       # tsc → dist/
```

Husky pre-commit menjalankan biome + lint-staged. Commit memakai
conventional (feat:/fix:/perf:).

## Lisensi

Apache-2.0