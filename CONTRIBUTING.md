# Berkontribusi

Terima kasih sudah meluangkan waktu untuk berkontribusi! Proyek ini kecil dan
lokal — jaga ia tetap kecil dan lokal.

## Menyiapkan lingkungan

```bash
pnpm install        # pasang dependensi
pnpm dev            # jalankan server dev (auto-reload)
```

## Gerbang kualitas

Semua harus hijau sebelum mengirim perubahan:

| Perintah | Fungsi |
|---|---|
| `pnpm lint` | Aturan Biome (format + kualitas). Aturan opsional: `pnpm lint:fix`. |
| `pnpm typecheck` | Pemeriksaan tipe untuk `src/` dan `test/`. |
| `pnpm test` | `node:test` — unit + integrasi (menjalankan typecheck dulu). |
| `pnpm test:coverage` | Ambig dengan ambang cakupan garis 80%. |
| `pnpm build` | Kompilasi TypeScript ke `dist/`. |

## Konvensi commit

Gunakan [Conventional Commits](https://www.conventionalcommits.org/id/):

```
feat(cadangan): tombol unduh salinan JSON
fix(aksesibilitas): fokus dialog dimulai dari tombol Batal
```

Ditulis dalam Bahasa Indonesia, satu lampiran fokus per commit.

## Checklist PR

Ikuti template di `.github/PULL_REQUEST_TEMPLATE.md`. Yang paling penting:
perubahan Anda lulus `pnpm lint`, `pnpm typecheck`, dan `pnpm test`, dan —
bila menambah perilaku — disertai satu tes kecil yang gagal bila perilaku itu
rusak.