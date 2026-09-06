# Changelog

Catatan perubahan proyek — mengikuti format [Keep a Changelog](https://keepachangelog.com/id/ID/1.1.0/) & [SemVer](https://semver.org/lang/id/).

## [0.3.0] — 2026-09-06

Storage berpindah penuh dari file JSON lokal ke **MongoDB via Mongoose ODM**.
Aplikasi tidak lagi menyentuh data di disk — saat di-deploy, data hidup 100% di
basis data yang ditunjuk `MONGODB_URI`.

### Added

- Skema tunggal Mongoose `Todo` (`name` 200 karakter, `completed`, enum
  `priority`, `due`, `createdAt`/`updatedAt` otomatis) di `src/app/models/`.
- Bootstrap koneksi `src/db/connect.ts` di index: aplikasi menolak mulai bila
  MongoDB tidak terjangkau, dan menutup koneksi saat sinyal terminasi.
- `GET /api/health-check` kini melaporkan status koneksi DB (`data.db`).
- Tes dengan `mongodb-memory-server` (MongoDB di memori per proses tes, tanpa
  server terpasang lokal); CI meng-cache binary mongod + mengizinkan build
  script via `pnpm-workspace.yaml`.

### Changed

- Service dan controller menjadi asinkron; semua akses data lewat model
  Mongoose (`getAll` urut sebagai `createdAt` menurun, `MAX_TODOS` dihitung via
  `countDocuments`); id berubah dari UUID string menjadi ObjectId hex (24
  karakter) — dipetakan otomatis ke `id` di controller/view.
- Ekspor/impor tetap memakai berkas `todos.json` sebagai format cadangan;
  impor mengganti seluruh koleksi dan mempertahankan `createdAt`/`updatedAt`
  dari cadangan.
- `src/app/store/todo.store.ts` (read/write JSON + buffer + `.bak`) dihapus
  beserta dua tes penyimpanan file-nya; diganti tes default & enum skema.
- README/package.json diperbarui: `MONGODB_URI` (default
  `mongodb://127.0.0.1:27017/rencana`), keyword `mongodb`/`mongoose`, versi 0.3.0.

### Fixed

- Dialog konfirmasi hapus kini tampil persis di tengah viewport di semua lebar
  layar (shell grid melebar penuh + kartu disenterkan; dulu kartu 440px
  mencemplung ke kiri karena shell menyusut selebar teks deskripsi).

## [0.2.0] — 2026-09-06

Versi stabil pertama selesai dikerjakan seluruh seksi revisi: performa, SEO,
keamanan, aksesibilitas, testing, dan tata kelola proyek.

### Added

- Interaksi client: pencarian, urutkan (terbaru / A–Z / Z–A), filter status,
  toggle selesai, tombol kembali ke atas, pintasan keyboard (`/` cari, `n` buat).
- Kendali waktu JS ke placeholder asli (`<time>` + `datetime`), tanpa bingkai
  bahasa.
- Nilai cache optimal (immutable 1 tahun · pelengkap revalidasi 1 jam) dan
  penyimpanan list yang stabil di `data/todos.json`.
- Halaman `404` dan `500` yang ramah, `lang="id"` konsisten, plus `robots`
  diarahkan ke `noindex` pada halaman non-konten.
- Peta rute `sitemap.xml` dan `robots.txt`.
- Sinkronisasi tombol tema terang/gelap dengan `localStorage` + `prefers-color-scheme`.
- Transisi halus (GSAP) yang dihormati oleh `prefers-reduced-motion`.
- Perlindungan data: JSON korup dicadangkan ke `.bak`, kapasitas maksimal
  `MAX_TODOS`, tenggat mustahil ditolak pada simpul tanggal (UTC).
- Keamanan: CSP berbasis nonce, header standar (helmet), `Permissions-Policy`,
  `X-Frame-Options`, penanganan error terpusat, log tak membanjiri di health.
- Rute API `GET /api/export` dan `POST /api/import` untuk cadangan/pemulihan
  data JSON.
- Aksesibilitas: tautan lewati konten, fokus dialog konfirmasi ke tombol
  "Batal", validasi formulir native (`required`), `aria-live` untuk daftar dan
  rekap, pencarian dan filter yang bisa dipangkas via keyboard.
- Testing: `node:test` tanpa dependency tambahan — 29 kasus uji (unit validator,
  layanan, penyimpanan korup, integrasi HTTP), ambang cakupan garis 80%.
- CI GitHub Actions (lint, typecheck, build, test, audit) dan gerbang pra-push
  via Husky.

### Changed

- Penyimpanan di-muat satu kali ke memori dan disimpan atomik (tulis ke `.tmp`
  lalu rename), memperbaiki latensi dan konsistensi file.
- `package.json` memakai `"type": "module"`; dev `node --watch src/index.ts`,
  test `node --test "test/*.test.ts"`.

### Fixed

- Modal praktis memakai `<button>` alih-alih `<a>` — tidak memicu navigasi.
- Filter status memakai `BG` & `Type=Set-Cookie` yang diperbaharui hanya saat
  berubah.
- Deskripsi halaman rumus `masthead` tak lagi melesat karena `content-visibility`.
- Nomor rekap di markup stabil (tanpa animasi GSAP yang berubah teks awal).
- Penyimpanan yang rusak pada run pertama terbit .bak sebelum memulai dari kosong.

### Security

- Dependensi bebas kerentanan yang dikenal (`pnpm audit` bersih).
- Semua data tersimpan lokal di perangkat — tak ada akun, tak ada kebocoran lintas pengguna.

## [0.1.0] — awal proyek

- Kerangka `express-ts-starter`: Express + TypeScript + EJS + express-ejs-layouts.