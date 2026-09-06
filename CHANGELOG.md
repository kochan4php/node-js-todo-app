# Changelog

Catatan perubahan proyek — mengikuti format [Keep a Changelog](https://keepachangelog.com/id/ID/1.1.0/) & [SemVer](https://semver.org/lang/id/).

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