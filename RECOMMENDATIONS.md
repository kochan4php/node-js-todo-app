# REKOMENDASI IMPROVEMENT — Node.js Todo App (Express + TypeScript + EJS)

> Dokumen ini berisi **1.050 rekomendasi** improvement yang dikelompokkan dalam 9 kategori.
> Nilai prioritas: **[P0]** = langsung diterapkan / *wajib* untuk redesign ini · **[P1]** = segera / penting · **[P2]** = nanti / nice-to-have.
> Status: **[x]** = sudah diterapkan · **[ ]** = belum diterapkan (pilih per fase).

---

## 🏷️ Legenda Prioritas

| Prioritas | Arti |
|---|---|
| **P0** | Wajib untuk redesign UI/UX & pembenahan fondasi sekarang |
| **P1** | Penting, kerjakan segera setelah P0 |
| **P2** | Opsional / penambah nilai saat skala naik |

---

## 1. UI/UX REDESIGN (Frosted Glassmorphism) — butir 1–460

### 1.1 Strategi & Arah Desain — 001–020

- [x] **1 [P0]** — Adopsi arah visual *Frosted Glassmorphism*: latar gradient ungu/lembut yang hidup (blobs), panel transparan berblur (`backdrop-filter: blur`), border 1px translucent putih, dan aksen gradient — beri identitas visual yang jelas, bukan tema "default browser".
- [x] **2 [P0]** — Hapus seluruh duplikasi CSS (blok tombol yang disalin 7×) dan ganti dengan satu sistem token global lewat CSS Custom Properties (`:root`).
- [x] **3 [P0]** — Bangun dulu *design tokens* (warna, tipografi, spacing, radius, shadow, easing) sebelum menulis komponen — semua komponen hanya memakai token.
- [x] **4 [P0]** — Pisahkan bagian UI menjadi *layout* + *partials* (header, footer, todo-item, empty-state, flash) supaya konsisten dan mudah dikelola.
- [x] **5 [P0]** — Gunakan pendekatan *mobile-first* saat menulis ulang seluruh CSS.
- [x] **6 [P0]** — Tetapkan 1 (satu) bahasa konsisten untuk seluruh copy UI (title, tombol, pesan, empty state) — pilih Bahasa Indonesia.
- [x] **7 [P1]** — Buat pedoman desain mini (palet, rahasia blur, aturan shadow) di `README.md` atau komentar token CSS agar kontributor berikut mengikuti.
- [x] **8 [P1]** — Terapkan *visual hierarchy*: satu aksen kuat per layar, tombol utama menonjol, tombol sekunder senyap.
- [x] **9 [P1]** — Patok *layout baseline* lebar konten ~640px (todo app: fokus baca cepat), bukan full-width.
- [x] **10 [P1]** — Definisikan *type scale* modular (mis. 0.75 / 0.875 / 1 / 1.25 / 1.5 / 2rem) dan patuhi di semua heading & body.
- [x] **11 [P1]** — Rancang *information architecture* ulang: index = daftar + aksi utama; add/edit = satu fokus tugas; 404 = menolong pengguna kembali pulang.
- [x] **12 [P1]** — Hindari *decorative-only* blur berlebihan pada area teks — kekontrasan teks lebih dulu, glassmen dressing kedua.
- [x] **13 [P2]** — Siapkan *design system* versi ringan (komponen: button, input, badge, toast, modal, checkbox) sebagai patokan kode bersama.
- [x] **14 [P1]** — Lakukan *design audit* sebelum coding: daftar semua halaman (index, add, edit, 404) + semua state → buat kisi desainnya.
- [x] **15 [P2]** — Sedangkan animasi dibuat halus dan singkat (150–300ms), bukan mengganti unsur fungsional.
- [x] **16 [P1]** — Semua elemen interaktif wajib punya *hit area* minimal 44×44px (standar aksesibilitas sentuh).
- [x] **17 [P2]** — Sediakan *micro-copy* yang membimbing: placeholder input = contoh, label bantu = sumber kebingungan.
- [x] **18 [P1]** — Sertakan *affordance*: tombol terlihat bisa diklik (elevasi/chip), link terlihat link (bukan teks polos).
- [x] **19 [P2]** — Buat 2 varian tema dari token yang sama (light & dark) sejak awal — hemat dibanding retrofit nanti.
- [x] **20 [P1]** — Perangkap kualitas: semua halaman harus tetap berfungsi penuh saat CSS gagal dimuat (progressive enhancement).

### 1.2 Warna & Sistem Warna — 021–070

- [x] **21 [P0]** — Bangun palet token: `--clr-bg`, `--clr-surface`, `--clr-surface-strong`, `--clr-text`, `--clr-text-muted`, `--clr-accent`, `--clr-danger`, `--clr-success` dalam `:root`.
- [x] **22 [P0]** — Hapus warna keras inline (`#5900ff`, `violet`, `#7e447e` hover) dari CSS; ganti dengan token berbasis *hue family* ungu.
- [x] **23 [P0]** — Pastikan rasio kontras teks-pada-latar ≥ 4.5:1 (WCAG AA) untuk teks normal; jangan taruh teks di atas blob gradient tanpa overlay.
- [x] **24 [P0]** — Hapus warna kaca yang terlalu solid; gunakan putih 18–30% alpha + blur agar latar terlihat "kaca".
- [x] **25 [P1]** — Tambah token *state color*: focus ring (`--clr-focus`), hover, active, disabled — semua kontrol pakai keluarga yang sama.
- [x] **26 [P1]** — Level *hover* dinaikkan kontras bertahap (opacity/lightness +3–5%), bukan lompatan warna ke `#7e447e`.
- [x] **27 [P1]** — Gunakan aksen ungu *gradient* hanya di area kecil (tombol utama, logo, ilutrasi), jangan untuk teks penting panjang.
- [x] **28 [P1]** — Sediakan warna *semantic*: sukses (hijau lembut), peringatan (amber), error (merah lembut) — untuk status todo & pesan.
- [x] **29 [P2]** — Jaga *achromatic background* (ungu-keabu lembut) agar gelas statement-nya keluar, bukan warna peta berpindah.
- [x] **30 [P1]** — Hindari *pure black/white*: gunakan `#fafafa` tekan `#1a1a1a` agar modern & tidak keras di mata.
- [x] **31 [P2]** — Bereksperimen *dua aksen* (ungu + mint/sky) untuk membedakan tipe info (deadline vs prioritas).
- [x] **32 [P1]** — Tambahkan token `--shadow-*` untuk soft glass shadow (layered, diffuse) — bukan border hitam.
- [x] **33 [P2]** — Di mode gelap, jaga dari *pure-black glass*; gunakan ungu-kelelat ultra-gelap dengan glow tipis.
- [x] **34 [P1]** — Semua icon inline (Font Awesome) pikul `currentColor` agar ikut tema — jangan warna hardcode.
- [x] **35 [P2]** — Pertimbangkan `color-scheme: light dark` di CSS agar kontrol form & scrollbar ikut mode.
- [x] **36 [P1]** — Beri label warna *aria-safe*: jangan jadikan warna satu-satunya penanda status (sertakan teks/ikon).
- [ ] **37 [P2]** — Sediakan *theme highlight* di `body` gradient yang tenang, bukan gradient menyentak ketika scroll.
- [x] **38 [P1]** — Pilih palet 4–6 warna + wrapper neutrals; jangan >9 warna aktif dalam satu screen.
- [ ] **39 [P2]** — Tambahkan *color contrast checker* di langkah QA (gambar kontras untuk mode terang/gelap).
- [x] **40 [P1]** — Jaga *blur (backdrop)* efek makin besar di layar kecil — menambah biaya compositing.
- [x] **41 [P1]** — (Glass) Pastikan setiap panel kaca berisi *surface alpha* tinggi di teks area — jangan blur di belakang teks utama.
- [x] **42 [P2]** — Sediakan varian "reduce glass" (via `prefers-reduced-transparency`) untuk pengguna yang sensitif motion/glare.
- [x] **43 [P1]** — Border konsisten: 1px `rgba(255,255,255,.35)` + inner highlight tipis untuk efek kaca realistis.
- [ ] **44 [P2]** — Gunakan gradient *radial* 2–3 blob yang *fixed* (bukan parallax scroll) agar tetap murah GPU.
- [x] **45 [P1]** — Semua teks abu-abu (muted) ≥ `#6b6b6b` di light & ≥ `#b5b5cf` di dark — aman AA.
- [x] **46 [P2]** — Jangan pakai warna "ungu #5900ff menyala" untuk seluruh chip status; gunakan tone lembut.
- [x] **47 [P1]** — Hover pada card list: angkat shadow + blur sedikit, bukan pindah warna solid.
- [x] **48 [P2]** — Aksen sukses untuk todo selesai: hijau dengan *check* ikon, bukan coret abu-abu saja.
- [x] **49 [P1]** — Warna tombol *danger* delete: merah lembut + ikon; jangan sama dengan tombol edit (ungu).
- [x] **50 [P1]** — Pastikan *focus ring* terlihat di dua mode (ring 2px kontras + offset).
- [x] **51 [P2]** — Simpan token dalam `.css` di `:root` + variabel `--glass-*` untuk blur/saturasi.
- [x] **52 [P1]** — Konversi nilai hex hardcode ke token & beri nama semantik (bukan `color-1`).
- [x] **53 [P2]** — Uji kontras tag *badge* kecil: pastikan badge kecil tidak butuh teks 8px (terlalu kecil).
- [x] **54 [P1]** — Untuk teks di atas panel kaca, tambah `text-shadow` ringan bila blur background menurunkan kontras.
- [x] **55 [P2]** — Sediakan palette *reduced-motion mode*: tanpa gradient animasi.
- [x] **56 [P1]** — Button utama: gradient ungu → tapi teks tetap putih kontras (cek DTO).
- [x] **57 [P2]** — Theme [light] default; toggle dark di header (simpan preferensi di browser).
- [x] **58 [P1]** — Card list background `rgba(255,255,255,.65)` di light — lebih terbaca daripada pure transparan.
- [ ] **59 [P2]** — Gradient blob CSS murni (`background: radial-gradient(...)`), tanpa library eksternal.
- [x] **60 [P1]** — Jangan menaruh scrollbar di dalam card list; biarkan halaman scroll normal.
- [ ] **61 [P2]** — Sediakan *system accent variance*: 2 tema aksen (ungu / mint) opsional.
- [x] **62 [P1]** — Hati-hati dengan *opacity* tombol disabled: tetap terbaca (≥0.4) + `cursor: not-allowed`.
- [x] **63 [P2]** — Ikon & teks tombol harus punya jarak `gap` konsisten (8px), bukan `&nbsp;`.
- [x] **64 [P1]** — Nuansa kaca pada form (input) jangan telanjang: beri *border* + *inner shadow* redup.
- [ ] **65 [P2]** — Pertimbangkan *tinted glass*: surface kaca berwarna ungu 5% lebih dari latar belakang.
- [x] **66 [P1]** — Saat *hover* button, naikkan *performa* warna (bukan ubah *hue* total).
- [x] **67 [P2]** — Warna *secondary* link "Cancel" = ghost button (transparan + border) bukan blok penuh.
- [x] **68 [P1]** — Teks kosong (empty) gunakan *muted* 2x lipat kontras, biar terbaca tapi bukan fokus.
- [x] **69 [P2]** — Ciptakan *visual identity*: pattern gradient halus di header — elemen memorable.
- [x] **70 [P1]** — Konsisten: aturan warna tombol Cancel/primary/danger 1 metode (tokens) di seluruh halaman.

### 1.3 Tipografi — 071–105

- [x] **71 [P0]** — Ganti font Lexend Deca (via `@import` CSS) dengan **Plus Jakarta Sans** (atau Outfit) via Google Fonts + `display=swap` + `preconnect`.
- [x] **72 [P0]** — Hapus `@import url(...)` di CSS (render-blocking) → pindah ke `<link>` di `<head>`.
- [x] **73 [P0]** — Tetapkan *font stack fallback*: `'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`.
- [x] **74 [P1]** — Terapkan *type scale*: H1 ~2rem, H3 ~1.25rem, body 1rem, small 0.875rem.
- [x] **75 [P1]** — Line-height: heading ~1.2, body ~1.6.
- [x] **76 [P1]** — *Letter-spacing* heading -0.01em untuk kesan modern.
- [x] **77 [P1]** — Teks tombol pakai *font-weight 600* (bukan bold html default) — tipis elegan.
- [x] **78 [P2]** — Sediakan *font-display: swap* (Google Fonts default jika `display=swap`)
- [x] **79 [P1]** — Jangan pakai *italic style* biasa untuk pesan error — pakai warna + ikon.
- [x] **80 [P2]** — Hindari <br> untuk layout; pakai flex/grid & margin.
- [x] **81 [P1]** — Daftar todo: *line-height* longgar (1.5-1.7) agar teks panjang nyaman dibaca.
- [x] **82 [P2]** — Pertimbangkan *tabular numerals* untuk angka di stats.
- [x] **83 [P1]** — Teks truncated todo: `text-overflow: ellipsis` + `max-width` bila diperlukan.
- [x] **84 [P2]** — Heading halaman konsisten & deskriptif ("Apa rencanamu hari ini?").
- [x] **85 [P1]** — Ukuran ikon tombol aksi: 1em (jangan 2× ukuran teks) — seimbang.
- [x] **86 [P2]** — Pertimbangkan *variable font* tunggal untuk kurangi request.
- [x] **87 [P1]** — Italic error style hapus; gunakan *alert role*.
- [x] **88 [P1]** — Judul 404 "404" boleh besar (5rem), sub-judul 1.25rem jelas.
- [x] **89 [P2]** — Bila memakai Bahasa Indonesia, hindari istilah jargon Inggris di copy.
- [x] **90 [P1]** — *Font weight* jangan <400 untuk ukuran kecil (berat ringan sulit dibaca di layar).
- [x] **91 [P2]** — Ukuran tombol mobile min 44px height.
- [x] **92 [P1]** — Kapitalisasi judul natural; jangan ALL CAPS panjang.
- [x] **93 [P1]** — *Word-break* aman untuk teks panjang (jangan overflow card).
- [x] **94 [P2]** — Pertimbangkan *opti font* untuk ikon tombol (ikon pakai font-family ikon).
- [x] **95 [P1]** — Jarak antar paragraf di empty-state minimal 8px.
- [x] **96 [P2]** — Tips placeholder: "Tambahkan rencana…" bukan "kegiatan".
- [x] **97 [P1]** — Hapus `font-weight: normal` global (reset bawaan) — biar font-weight natural.
- [x] **98 [P2]** — Gunakan *clamp()* untuk heading responsif (`font-size: clamp(1.5rem, 3vw, 2.2rem)`).
- [x] **99 [P1]** — Text color muted jangan pakai opacity; pakai token `--clr-text-muted`.
- [x] **100 [P1]** — Ikon insikatif (plus, pen, trash) konsisten dimuat di button + link.
- [ ] **101 [P2]** — Perhatikan *hyphenation* untuk teks dengan bahasa non-English.
- [x] **102 [P1]** — Pastikan *no-flash* font (font loading via `<link>` + swap).
- [ ] **103 [P2]** — Untuk small caps / detail kecil: gunakan `text-transform: none` agar mudah dibaca.
- [x] **104 [P1]** — Penyambung kata "What's plan today ?" → "Apa rencanamu hari ini?" (bahasa & spasi sebelum tanda baca).
- [x] **105 [P2]** — Sediakan *text utilities* (`.text-muted`, `.text-danger`, `.text-sm`) supaya markup bersih.

### 1.4 Spacing, Layout, & Grid — 106–135

- [x] **106 [P0]** — Bangun *spacing scale* token: `--space-1..8` (4,8,12,16,24,32,48,64px).
- [x] **107 [P0]** — Empat *major surface*: app shell (container), card (panel utama), list-item, form — semua pakai scale yang sama.
- [x] **108 [P0]** — Hapus `margin-left/right` inline & tombol-jumbo di `.add-todo-main`; gunakan flex/grid dengan gap.
- [x] **109 [P1]** — Warnai *container* menjadi *centered column* max-width 640px, `padding 24px`.
- [x] **110 [P1]** — Kartu utama (content) `border-radius: 16–24px` (glass) — bukan 4px.
- [x] **111 [P1]** — Jarak antar list item 12px; gap grup aksi 8px.
- [x] **112 [P1]** — Ruang antar heading-to-content ≥ 16px; antar paragraf ≥ 8px.
- [x] **113 [P2]** — Gunakan `gap` CSS modern (flex/grid), hindari margin copy-paste.
- [x] **114 [P1]** — Header app: identitas + tema toggle (bila ada) di bawah / samping kiri.
- [x] **115 [P1]** — Statistik & filter di atas list (baris opsional) — jangan menyelipkan di footer.
- [x] **116 [P1]** — Footer mini: "Dibuat dengan ♥ · Node + Express" — sentuhan manusiawi.
- [x] **117 [P2]** — Atur *z-index* panel kaca vs blob: blob fixed with `z-index:-1`, panel di atas.
- [x] **118 [P1]** — Semua elemen pakai *box-sizing: border-box* (sudah) — pertahankan.
- [ ] **119 [P2]** — Untuk layar ultra-wide, tengahkan card (max-width) + gradient samping.
- [x] **120 [P1]** — Form add/edit: max-width 480px di tengah, bukan renggang 40%.
- [x] **121 [P1]** — Tombol utama "Add Todo" di index: persegi ⨁ pendek (bukan full-width bejubel) di bawah form.
- [x] **122 [P1]** — List-item: `flex; justify-between; gap:12px` → teks fleksibel + aksi tetap di kanan.
- [x] **123 [P1]** — Pada mobile, aksi tetap horizontal (bukan menumpuk vertikal) jika teks pendek.
- [x] **124 [P2]** — Beri *min-height* konten agar footer tidak loncat saat list pendek.
- [x] **125 [P1]** — Padding panel: 24–32px desktop, 16–20px mobile.
- [x] **126 [P2]** — Judul + tombol dalam satu baris di judul area (header flex), bukan stacked rawan.
- [x] **127 [P1]** — Jaga *alignment*: semua teks card rata kiri, kecuali empty-state tengah.
- [x] **128 [P1]** — Elemen tombol Cancel: ghost text-link — hemat ruang, tidak berebut perhatian.
- [x] **129 [P2]** — Sediakan *visual rhythm*: selang-seling margin antar blok (judul→form→list) konsisten.
- [x] **130 [P1]** — Jangan "menempel" tombol ke tepi card; padding card ≥ 16px.
- [x] **131 [P2]** — Pertimbangkan *checkbox + edit/delete* dikelompokkan — jangan tersebar.
- [x] **132 [P1]** — Ruang untuk *empty state*: vertikal center dengan ilustrasi + CTA — bukan teks di sudut.
- [x] **133 [P1]** — Line *focus* terlihat pada semua elemen interaktif (a, button, input).
- [ ] **134 [P2]** — Gunakan *responsive container query* (`@container`) bila mengulang component grid.
- [x] **135 [P1]** — Hindari *horizontal scroll*: card `overflow-wrap` + aksi shrink.

### 1.5 Efek Kaca (Glass Surface) — 136–175

- [x] **136 [P0]** — Implementasikan token glass: `--glass-bg: rgba(255,255,255,.22)`, `--glass-border: rgba(255,255,255,.35)`, `--glass-blur: 12px`.
- [x] **137 [P0]** — Aktifkan `backdrop-filter: blur` + `-webkit-backdrop-filter` dengan fallback solid semi-transparant (Safari dukung).
- [x] **138 [P0]** — Beri *fallback*: jika `backdrop-filter` tidak didukung, panel tetap terbaca (`rgba(255,255,255,.75)`).
- [x] **139 [P1]** — Tambah *inner highlight* di panel: `box-shadow: inset 0 1px 0 rgba(255,255,255,.4)`.
- [x] **140 [P1]** — Layer lain: outer soft shadow `0 8px 32px rgba(30,20,80,.12)`.
- [x] **141 [P2]** — *Grain/noise* halus opsional untuk menghindari banding gradient.
- [x] **142 [P1]** — Jangan blur seluruh *body* (kinerja); blur hanya panel kecil.
- [ ] **143 [P1]** — Gradient blob `radial-gradient` 3 titik warna: lavender, sky, rose — ukuran besar & lembut.
- [x] **144 [P1]** — Beri `border-radius: 20px` pada panel kaca + button: 10–12px.
- [x] **145 [P1]** — Header panel kaca sedikit lebih terang (`--glass-bg-strong`) untuk pemisah.
- [x] **146 [P2]** — Pertimbangkan *hover lift* card: `translateY(-2px)` + shadow lebih dalam (300ms).
- [x] **147 [P1]** — Kaca pada tombol kecil justru *menurunkan* keterbacaan — tombol solid, panel kaca.
- [ ] **148 [P2]** — Bisa diberi *reflection* tipis: pseudo-element gradient atas bawah non-interaktif.
- [x] **149 [P1]** — Pastikan *text* tidak menabrak border; padding cukup di panel.
- [x] **150 [P1]** — Tajam edge di *text area*: card kaca + teks normal, jangan blur text.
- [x] **151 [P2]** — Mode *dark*: glass gelap `rgba(20,20,45,.5)` + border ungu redup.
- [x] **152 [P1]** — Jangan letakkan *svg gradient* melebihi panel (bisa mengapa). Test di semua browser.
- [ ] **153 [P1]** — *Animation* blob (float) via keyframes — durasi 12–18s, subtle.
- [x] **154 [P1]** — Blob wajib punya `z-index:-1` & body `overflow-x:hidden` agar tak memunculkan scrollbar.
- [ ] **155 [P2]** — *Glass chip* untuk badge status: kecil, blur dalam hitungan, alpha medium.
- [x] **156 [P1]** — Hindari blur pada *sticky* element mobile (bisa lag).
- [x] **157 [P2]** — Sediakan `prefers-reduced-motion` untuk disable animasi blob.
- [x] **158 [P1]** — Panel kaca di atas area input teks → pastikan teks tetap kontras (saturasi blur).
- [ ] **159 [P1]** — Pertimbangkan *isolate* gradient layer untuk batasi paint area.
- [x] **160 [P2]** — Saat banyak panel, *blur radius* 10–14px (bukan 30px) agar hemat.
- [x] **161 [P1]** — Card list memakai `--glass-bg` lebih solid daripada panel utama (keterbacaan per item).
- [x] **162 [P2]** — Aksen gradient di tombol utama: `linear-gradient(120deg, #7a5cff, #b16dff)`.
- [x] **163 [P1]** — Test Safari iOS: `-webkit-backdrop-filter` + fallback.
- [x] **164 [P1]** — Jaga body gradient tidak *flash* putih saat load (CSS inline critical).
- [ ] **165 [P2]** — Boleh *furnish* blur belakang dari `backdrop-filter`, jangan dijajarkan parallax.
- [x] **166 [P1]** — Button border `1px rgba(255,255,255,.45)` + shadow — "button kaca".
- [x] **167 [P2]** — *Glass input*: blur + 1px border + fokus glow ungu (ring).
- [x] **168 [P1]** — Empty-state illustration dibuat *vector inline* (simple sun/checkbox), glass-consistent.
- [x] **169 [P2]** — Logo app: icon ungu gradient di header — identitas.
- [x] **170 [P1]** — Selalu sertakan *prefers-transparency* fallback ke solid surface saat dikurangi.
- [ ] **171 [P2]** — Tambah *ambient* glow di belakang tombol utama (fake light) — subtle.
- [x] **172 [P1]** — Card colapse konten tinggi jangan blur item di dalamnya — selalu pastikan bocor? No: hindari blur *bawah* pada teks panjang.
- [x] **173 [P1]** — Perbedaan *hover/active/focus* dari glass: ubah alpha + ring, bukan pindah semua warna.
- [x] **174 [P2]** — Coba *reduction*: pilih 2 tingkat kaca (panel utama & chip) — jangan 7 tingkat.
- [x] **175 [P1]** — Lakukan *pixel-diff* cepat: panel tak boleh berubah warna ketika blob bergerak di belakang — verifikasi kontras teks stabil.

### 1.6 Komponen — 176–245

- [x] **176 [P0]** — Buat komponen **Button** 1 pattern: primary (gradient ungu), secondary (ghost kaca), danger (merah), disable — dengan states.
- [x] **177 [P0]** — Buat komponen **Card/List-Item**: panel kaca, padding, gap aksi konsisten.
- [x] **178 [P0]** — Buat **Input**: glass field + label + placeholder + error + focus ring.
- [x] **179 [P1]** — **Checkbox** todo: persegi rounded glass, centang animasi, contrast tinggi.
- [x] **180 [P1]** — **Badge** status: prioritas/deadline — chip translucent kecil.
- [x] **181 [P1]** — **Toast/notif** sukses & error (sticky bawah tengah), fade+slide.
- [x] **182 [P1]** — **Empty state**: ikon/ilustrasi + 1 kalimat + tombol aksi.
- [x] **183 [P1]** — **Modal konfirmasi hapus** custom (bukan `confirm()` browser yang jelek).
- [x] **184 [P1]** — **Search bar**: input filter + clear button.
- [x] **185 [P1]** — **Filter chips**: Semua / Aktif / Selesai — toggle aktif.
- [x] **186 [P2]** — **Skeleton loading** (opsional bila fetch async).
- [x] **187 [P1]** — **Link cancel** = text-button ghost.
- [x] **188 [P1]** — **Icon button** (edit/delete): ukuran 36px, hover tint, tooltip `title`.
- [x] **189 [P1]** — **Stat mini** ("3 selesai · 2 aktif") — chip kaca.
- [x] **190 [P2]** — **Progress bar** di card list (bila kolom "selesai%" nanti).
- [x] **191 [P1]** — **Form wrapper**: satu kolom, label di atas, error di bawah input.
- [x] **192 [P1]** — **Toast** auto-close 4s + close manual.
- [x] **193 [P1]** — **Confirm modal**: judul + deskripsi + [Batal][Hapus] — fokus trap.
- [x] **194 [P2]** — **Undo** toast setelah hapus (opsional P2 — butuh restore endpoint).
- [x] **195 [P1]** — **Empty toolbar states**: kosong = sembunyikan filter, tampilkan CTA besar.
- [x] **196 [P1]** — **Header**: judul app + tanggal hari ini (contoh: "Selasa, 6 Sep").
- [x] **197 [P1]** — Button aksi utama **Add** di header & section heading — 2 jalur nyata.
- [ ] **198 [P2]** — **Quick add** line: input + tombol ⨁ di header — hemat tap.
- [x] **199 [P1]** — **List-group**: tanpa garis pemisah tegas; pakai spacing.
- [x] **200 [P1]** — **Link** kembali ke beranda pada 404.
- [x] **201 [P2]** — **Scroll top** button (saat list panjang).
- [ ] **202 [P1]** — **Password strength** (bila auth hadir nanti).
- [x] **203 [P1]** — Input **maxLength** yang jelas + counter bila perlu.
- [x] **204 [P1]** — **Placeholder** contoh: "Mis. Beli susu sebelum jam 8".
- [ ] **205 [P2]** — **Drag & drop** reorder (P2 — pakai HTML5 DnD vanilla).
- [x] **206 [P1]** — **Edit inline** (klik teks → edit) opsional, tetap ANDA jaga form edit.
- [x] **207 [P1]** — **Disabled button** saat submit (anti double).
- [x] **208 [P1]** — **Empty bag** di langkah filter "Tidak ada hasil cocok".
- [x] **209 [P1]** — **Announcement** untuk hasil count (aria-live).
- [ ] **210 [P2]** — Icon **kategori** (opsional).
- [x] **211 [P1]** — **Focus visible** di semua.
- [x] **212 [P1]** — **Hover** delete → warna merah muncul di ikon.
- [x] **213 [P1]** — Button **danger** konsisten "Hapus".
- [x] **214 [P1]** — Link *edit* tooltip "Ubah".
- [x] **215 [P1]** — **Error banner**: per halaman, ringan.
- [x] **216 [P1]** — **Back** link ("← Kembali ke daftar") dari form add/edit.
- [ ] **217 [P2]** — **Multiple delete** (select all + bulk delete) — P2.
- [x] **218 [P1]** — **Counter** aktif di filter.
- [x] **219 [P1]** — **Date display** lokal "id-ID".
- [x] **220 [P1]** — **Clear** filter button ketika aktif.
- [x] **221 [P2]** — **KBD shortcut**: '/' fokus search, 'n' add baru — advance.
- [x] **222 [P1]** — **Link bersama** card ("Bagikan " tidak perlu).
- [x] **223 [P1]** — **Focus reset** setelah aksi.
- [x] **224 [P1]** — **prevent SC** — submit form via Enter.
- [x] **225 [P1]** — **Input type=text list=datalist** — tidak.
- [x] **226 [P1]** — **Delete confirm** — selalu minta konfirmasi.
- [x] **227 [P1]** — **Show toast** setelah add/edit/delete.
- [x] **228 [P1]** — **Header margin** bawah 20px.
- [x] **229 [P1]** — **Card shadow** berlapis.
- [x] **230 [P1]** — **Global transition** 200ms.
- [x] **231 [P1]** — **Element spacing** 8/16.
- [x] **232 [P1]** — **Padding button** 10px 16px.
- [x] **233 [P1]** — **Radius button** 10px.
- [x] **234 [P1]** — **Icon size** 1.1em.
- [x] **235 [P1]** — **Loading submit** spinner mini.
- [x] **236 [P1]** — **Auto clear field** saat add.
- [x] **237 [P1]** — **Focus input** saat page add.
- [x] **238 [P1]** — **Escape** menutup modal.
- [x] **239 [P1]** — **Backdrop modal** klik luar close.
- [x] **240 [P1]** — **Modal** tidak menghalangi scroll trap.
- [x] **241 [P1]** — **Alert role** untuk error form.
- [x] **242 [P1]** — **status text** di tombol submit (Jangan "Add Todo", pakai "Simpan").
- [x] **243 [P1]** — **Selalu tampil** empty state saat list 0.
- [x] **244 [P1]** — **Nested list** tidak.
- [x] **245 [P1]** — **Shadow scale** token (`--shadow-sm/md/lg`).

### 1.7 State: Empty, Loading, Error, Success — 246–285

- [x] **246 [P0]** — Definisikan **empty state** (0 todo): ilustrasi + "Belum ada rencana. Tambahkan yang pertama!" + tombol plus.
- [x] **247 [P0]** — Definisikan **empty search**: hasil kosong saat filter aktif → info "Tidak ditemukan 'xyz'".
- [x] **248 [P1]** — **Error submit**: input error + pesan spesifik di bawah field + status.
- [x] **249 [P1]** — **Success**: toast hijau + list diperbarui (server re-render).
- [x] **250 [P1]** — **Loading submit**: tombol spinner + disable (anti double).

- [x] **251 [P1]** — **404 error**: ilustrasi + pesan ramah + tombol pulang.
- [x] **252 [P1]** — **Form error summary** (opsional) di atas form bila >1 error.
- [x] **253 [P1]** — **Penulisan error**: bahasa manusia ("Rencana tidak boleh kosong") bukan "Error: field required".
- [x] **254 [P1]** — **Input error** border merah lembut + ikon ⚠ kiri.
- [x] **255 [P1]** — **Hapus error** saat user mengetik ulang.
- [x] **256 [P1]** — **Empty state** card dipusatkan vertikal & tengah.
- [x] **257 [P1]** — **0 hasil filter**: tampilkan "Coba kata kunci lain".
- [x] **258 [P1]** — **Delete success**: toast + item hilang mulus.
- [ ] **259 [P1]** — **Add success**: fokus kembali input + toast.
- [x] **260 [P1]** — **Edit success**: kembali ke list + toast "Diperbarui".
- [x] **261 [P1]** — **Invalid id** (edit): redirect home + flash error.
- [ ] **262 [P1]** — **Session error** (masa depan bila auth): pesan khusus.
- [x] **263 [P1]** — **Network error** (bila fetch async): retry button.
- [ ] **264 [P1]** — **Disabled UX**: jangan sembunyikan, tampilkan alasan.
- [x] **265 [P1]** — **Tooltip** aksi icon (title + aria-label).
- [x] **266 [P1]** — **Async delete** tanpa full reload (fetch + DOM remove) — P1 progressive.
- [x] **267 [P1]** — **Transient flash**: pakai query `?flash=` + cookies — simple.
- [ ] **268 [P1]** — **Error global**: blok kecil (alert) di atas konten.
- [x] **269 [P2]** — **Undo delete** 5 detik — P2.
- [x] **270 [P1]** — **Count jalur** kembali ke stat konsisten (stat dihitung ulang).
- [x] **271 [P1]** — **Scroll restore** saat kembali dari edit.
- [x] **272 [P1]** — **Headline update** (document.title) saat state berubah — opsional.
- [x] **273 [P1]** — **Persistence indicator**: "Tersimpan di perangkat ini" (karena local).
- [x] **274 [P1]** — **Empty state tombol** = aksi utama (Add).
- [x] **275 [P1]** — **Loading skeleton** bila render async lambat — opsional.
- [x] **276 [P1]** — **Clear cache** — tidak relevan lokal.
- [x] **277 [P1]** — **Status bar** chip: "× aktif · × selesai".
- [x] **278 [P1]** — **Belum** item yang selesai beri *strikethrough* + opacity — visual ringan.
- [x] **279 [P1]** — **Checkbox toggle** yang menggembirakan (cek besar, transisi).
- [x] **280 [P1]** — **Empty list baru** state langsung kosong → ilustrasi panggil aksi.
- [x] **281 [P1]** — **Toast stack** (max 3) tidak menumpuk.
- [x] **282 [P1]** — **Error di log** paralel (server console).
- [x] **283 [P1]** — **Form cancel** tidak memunculkan error.
- [x] **284 [P1]** — **Focus outline** terlihat pada setiap aksi keyboard.
- [x] **285 [P1]** — **Berikan umpan balik instan** setiap input (validasi live optional).

### 1.8 Micro-interaction & Motion — 286–325

- [x] **286 [P1]** — Uniform easing: `cubic-bezier(.2,.8,.3,1)`; durasi 150–300ms.
- [x] **287 [P1]** — Hover card: `translateY(-2px)` + shadow +0.08 (linear).
- [x] **288 [P1]** — Button press: scale 0.98 + shadow pudar.
- [x] **289 [P2]** — Item add: slide-fade-in ringan (via CSS `@starting-style` atau animasi autoplay).
- [x] **290 [P1]** — Hapus item: scale+y fade (via JS remove class sebelum remove).
- [x] **291 [P1]** — Checkbox centang: draw check path 200ms (memanjakan).
- [ ] **292 [P1]** — Blob background: keyframes float 14s + multi blob.
- [x] **293 [P1]** — Theme toggle: cross-fade `body` (bila dark mode).
- [x] **294 [P1]** — Toast: slide-up + fade-in 250ms, out 200ms + auto 4s.
- [x] **295 [P1]** — Modal: backdrop fade + card scale 1.02→1.
- [x] **296 [P1]** — Focus ring: ring muncul 0ms, hilang halus — jangan jeda.
- [x] **297 [P2]** — Skeleton shimmer 1.2s loop (bila dipakai).
- [ ] **298 [P1]** — Sparkle on complete (optional, subtle blur titik).
- [x] **299 [P2]** — Progress fill animasi di stats.
- [x] **300 [P1]** — Ikuti `prefers-reduced-motion`: disable transform/animasi >200ms.
- [x] **301 [P1]** — Jangan animasi *layout-affecting* (width/height/margin) — biar murah.
- [x] **302 [P1]** — Animasi hanya via `transform` & `opacity`.
- [x] **303 [P1]** — `will-change: transform` hanya pada elemen yang benar-benar dianimasikan.
- [x] **304 [P1]** — Hover mobile: tidak perlu efek hover (sentuh) — jaga touch feedback (active).
- [x] **305 [P1]** — Transisi tombol ikut tema (background-* color saja).
- [x] **306 [P2]** — Scroll smooth (mild) — optional, hindari layout jitter.
- [x] **307 [P1]** — Fade-in halaman antar route (server → CSS) — simple.
- [x] **308 [P1]** — Input focus glow: ring ungu 3px translucent — sinyal jelas.
- [x] **309 [P2]** — Cursor custom (pointer) pada item interactable.
- [x] **310 [P1]** — Tombol ikon edit hover rotate 8deg ringan (fun, subtle).
- [x] **311 [P1]** — Tombol delete hover: warna merah menyala bertahap.
- [x] **312 [P1]** — Empty state ilutrasi float subtle (1-2s) — character.
- [ ] **313 [P2]** — Confetti pada "semua selesai" (opsional, aria-hide).
- [x] **314 [P1]** — Header app shadow saat scroll (sticky) — depth cue.
- [ ] **315 [P1]** — Blob jangan lebih cepat 10px/s — biar tenang.
- [x] **316 [P1]** — Saat submit, spinner berputar 0.8s — efek aktivitas.
- [x] **317 [P1]** — Fokus input di add page otomatis.
- [x] **318 [P2]** — Aksi Delete → item mengecil → menghilang (JS) sebelum reload — smooth.
- [x] **319 [P1]** — Semua responsive breakpoint tanpa jitter (transform bukan layout).
- [x] **320 [P1]** — Toolbar filter aktif → slide underline/warna — jelas.
- [x] **321 [P2]** — Entrance staggered untuk list (30ms/item, max 300ms) — dev taste.
- [x] **322 [P1]** — Toast menampilkan aksi (mis. "Ditambahkan · Batal") bila undo.
- [x] **323 [P1]** — Jangan memutar blob saat `prefers-reduced-motion`.
- [ ] **324 [P1]** — Uji FPS di mobile murah: tetap 60fps dengan backdrop-filter terbatas.
- [x] **325 [P1]** — Aksesibili: animasi dimatikan di mode reduced — semua interaksi masih jelas.

### 1.9 Form & Input UX — 326–365

- [x] **326 [P0]** — Label terlihat (jangan placeholder-only) + `for` tersambung.
- [x] **327 [P0]** — Validasi di server (required, panjang) + pesan error spesifik.
- [x] **328 [P1]** — Auto-focus field pertama di add.
- [x] **329 [P1]** — `autocomplete="off"` tapi boleh `maxlength`.
- [x] **330 [P1]** — Trim whitespace sebelum simpan.
- [x] **331 [P1]** — Losses protection: kosong input → error "Rencana belum terisi".
- [x] **332 [P1]** — Enter submit di form.
- [x] **333 [P1]** — Tab order natural (tombol setelah input).
- [x] **334 [P1]** — Focus trap di modal custom.
- [x] **335 [P1]** — Error form: tampil inline + sumarize.
- [x] **336 [P1]** — Disable submit saat proses.
- [x] **337 [P1]** — Arahkan kembali ke list setelah simpan.
- [x] **338 [P1]** — Input lebar penuh card (max 480).
- [ ] **339 [P1]** — Icon di dalam input (opsional) — tidak wajib.
- [x] **340 [P1]** — Clear button di input search.
- [x] **341 [P1]** — Character limit soft (seen via counter kecil opsional).
- [x] **342 [P1]** — Opt dalam form: single kolom (bukan grid 2 kolom).
- [x] **343 [P1]** — Tombol submit di posisi panel bawah (left/right).
- [x] **344 [P1]** — Form action `POST` ke `/`, fallback jika JS mati.
- [x] **345 [P1]** — Placeholder code contoh, bukan teks kosong "kegiatan".
- [x] **346 [P1]** — Konsisten nama field `name="name"` (fix kegiatan→name).
- [x] **347 [P1]** — Tidak ada peluang "double submit" di lokal.
- [x] **348 [P1]** — Accessible submit text (bukan icon only).
- [x] **349 [P1]** — Error color semantic + text.
- [x] **350 [P1]** — Input glass: tidak "telanjang" — border & background.
- [x] **351 [P1]** — Form helper "Tekan Enter untuk menambah" (subtle hint).
- [x] **352 [P1]** — Setelah add, input dikosongkan.
- [x] **353 [P1]** — Saat empty submit, fokus ke input + shake subtle (opsional).
- [x] **354 [P1]** — Max todo limit (mis. 1000) — info kapasitas.
- [x] **355 [P1]** — Tidak ada modal input pada edit — halaman sendiri.
- [x] **356 [P1]** — Label "Nama rencana" (bukan "Kegiatan").
- [x] **357 [P1]** — Buttons *primary/secondary* dibedakan jelas di form.
- [ ] **358 [P2]** — Autocomplete suggestion (dari riwayat) — P2.
- [x] **359 [P1]** — Bahasa konsisten di tombol ("Simpan Perubahan").
- [x] **360 [P1]** — List item action icons punya `aria-label`.
- [x] **361 [P1]** — Hindari form setback di mobile (viewport meta + font 16px).
- [x] **362 [P1]** — Dianjurkan `inputmode` default text.
- [x] **363 [P1]** — Submit on Enter dari input search? — Ya, filter.
- [x] **364 [P1]** — Validasi panjang max 200 char dengan pesan jelas.
- [x] **365 [P1]** — Deleting confirm tidak menggunakan `confirm()` — modal custom (P0 polish).

### 1.10 Fitur Todo Spesifik — 366–415

- [x] **366 [P0]** — Toggle **selesai/tidak** (checkbox) tersimpan — wajib 1 poin interaksi utama.
- [x] **367 [P1]** — **Filter** status: Semua / Aktif / Selesai (chip).
- [x] **368 [P1]** — **Search** teks live (case-insensitive, contains).
- [x] **369 [P1]** — **Sort**: Terbaru / A-Z (opsional dropdown).
- [x] **370 [P1]** — **Count badge** per filter.
- [x] **371 [P1]** — **Strikethrough** saat selesai — feedback visual.
- [x] **372 [P1]** — Item selesai turun ke-bawah (default sort) — selesai tidak mengacau aktif.
- [x] **373 [P1]** — **Edit** dari list → ke halaman edit (atau inline P2).
- [x] **374 [P1]** — Aksi **edit** juga toggle — jangan menandai sebagai selesai.
- [x] **375 [P1]** — **Created date** tampil (format id-ID) — opsional kecil.
- [x] **376 [P1]** — **Progress** "2/5 selesai" dengan bar tipis.
- [x] **377 [P2]** — **Deadline** field + overdue badge merah (P2 perlu input date).
- [x] **378 [P2]** — **Prioritas** (rendah/sedang/tinggi) chip berwarna.
- [ ] **379 [P2]** — **Kategori/label** (Belanja, Kerja) — separate field.
- [ ] **380 [P2]** — **Urutan manual** (drag) / pintasan naik-turun.
- [ ] **381 [P2]** — **Bulk delete** (checkbox select) — P2.
- [ ] **382 [P2]** — **Arsip** atau hapus permanen — pertegas alur.
- [x] **383 [P1]** — Jumlah item "3 rencana" label bahasa.
- [x] **384 [P1]** — Empty search berbeda dari empty list.
- [x] **385 [P1]** — Due date display lokal + relative ("Hari ini"/"Besok") P2.
- [x] **386 [P1]** — Item aktif vs selesai **tidak dicampur** visual (urutkan/latih).
- [x] **387 [P1]** — Toggle selesai → stat badge update.
- [x] **388 [P1]** — Hapus: konfirmasi + toast + list update.
- [ ] **389 [P1]** — Tambah cepat di header (input+tombol) bila pattern.
- [x] **390 [P1]** — Saat semua selesai → banner kecil "Semua selesai! 🎉" (pilih emoji ringan/gambar).
- [x] **391 [P1]** — Urutan default: terbaru dulu (atau manual).
- [x] **392 [P1]** — URL bersih: `/`, `/add-todo`, `/edit-todo/:id` (konsisten CRUD).
- [x] **393 [P1]** — Redirect setelah mutasi → avoid re-POST (PRG pattern).
- [x] **394 [P1]** — Toggle selesai lewat POST (bukan GET) — semantic & aman.
- [x] **395 [P1]** — Edit id tidak valid → redirect home + flash.
- [x] **396 [P1]** — Todo count + limit sanity check.
- [x] **397 [P1]** — Cegah XSS: escape output via EJS `<%= %>` (default) — jangan `<%- %>` tanpa sanitasi.
- [x] **398 [P1]** — Name field trim + collapse multiple space.
- [x] **399 [P1]** — Search diimplementasikan client-side (list kecil) — tanpa request ulang.
- [ ] **400 [P1]** — Perf list besar (1000): render server + limit 50-100 + pagination "Muat lagi".
- [x] **401 [P1]** — Item editing di halaman sendiri → fokus jelas.
- [x] **402 [P1]** — Selesai item tetap bisa diedit/dihapus.
- [x] **403 [P1]** — Empty after filter tetap menunjukkan chip filter (bisa setel ulang).
- [x] **404 [P1]** — Toggle selesai mengubah urutan default — tidak mengganti posisi mouse (stabilitas).
- [x] **405 [P1]** — Identifier list item `data-id` untuk JS.
- [x] **406 [P1]** — Dengan local data, refresh = persistence otomatis (JSON file).
- [x] **407 [P1]** — Format waktu "baru saja / 2m lalu" opsional.
- [x] **408 [P1]** — Semua action icon ber-icon konsisten (pen, trash, check).
- [x] **409 [P2]** — Undo hapus (restore terakhir) — P2 (simpan item terhapus 5s di memori).
- [x] **410 [P1]** — Duplikat nama tidak dilarang, tapi info "sudah ada?" optional.
- [x] **411 [P1]** — List scroll tetap di posisi setelah toggle.
- [x] **412 [P1]** — Sort/filter state survive reload via query param — optional.
- [x] **413 [P1]** — Header info: jumlah tersisa "2 tersisa" jelas.
- [x] **414 [P1]** — Kata "rencana" konsisten di seluruh copy.
- [x] **415 [P1]** — Fitur P2 (deadline/prioritas) tersembunyi bila belum dipakai — jangan penuh card.

### 1.11 Responsive & Mobile — 416–435

- [x] **416 [P0]** — Test breakpoint: ≥900 tablet, ≥600 phone, ≥340 kecil — semua elemen tak pecah.
- [x] **417 [P0]** — `viewport` meta sudah ada — pastikan `width=device-width` + tidak zoom-lock.
- [x] **418 [P1]** — Tombol aksi di layar kecil: tidak menumpuk vertikal tanpa perlu — shrink icon saja.
- [x] **419 [P1]** — Font ≥16px di input (mencegah iOS zoom).
- [x] **420 [P1]** — Touch target ≥44px.
- [x] **421 [P1]** — Container padding mengecil (16px) di <600px.
- [x] **422 [P1]** — Modal full-width di mobile (bukan centered mini).
- [x] **423 [P1]** — Toast melebar sampai 320px di atas bawah.
- [x] **424 [P1]** — Blob nggak bikin horizontal scroll (`overflow-x: clip` di body).
- [x] **425 [P1]** — Header tetap (sticky) di mobile? opsional — hindari makan layar.
- [ ] **426 [P1]** — Test 200% zoom tidak pecah (a11y zoom 200%).
- [x] **427 [P2]** — Landscape phone: max width tetap.
- [x] **428 [P1]** — Stat chip responsif (wrap).
- [x] **429 [P1]** — Safe-area padding (iPhone notch) — `padding-left: env(safe-area-inset-left)`.
- [x] **430 [P1]** — Hover hapus di touch — pastikan tetap click.
- [x] **431 [P1]** — Input lebar mengikuti layar.
- [ ] **432 [P1]** — Test semua halaman di 320px — tidak ada body scroll horizontal.
- [x] **433 [P1]** — `clamp()` heading natural.
- [ ] **434 [P2]** — PWA (manifest + offline) — P2 setelah pondasi.
- [x] **435 [P1]** — Perf mobile: blur radius kecil & blob animasi ringan.

### 1.12 Dark Mode — 436–450

- [x] **436 [P1]** — Token dark: `--clr-bg:#141223`, `--clr-surface`,`--clr-text:#f0eff`, `--clr-text-muted:#b9b6ca`.
- [x] **437 [P1]** — Toggle tersimpan di `localStorage` + respect `prefers-color-scheme`.
- [x] **438 [P1]** — Glass dark: `rgba(25,22,45,.55)` + border `rgba(255,255,255,.12)`.
- [x] **439 [P1]** — Blob di dark lebih redup (kekontrasan teks tetap).
- [x] **440 [P1]** — Icon/kontrol ikut tema (text vs light).
- [x] **441 [P1]** — Focus ring di dark lebih terang.
- [x] **442 [P1]** — Shadow dark lebih pekat (intensitas naik).
- [x] **443 [P1]** — Tombol primary sama (gradient ungu) — aman dua mode.
- [x] **444 [P1]** — Toast dark juga.
- [x] **445 [P1]** — Modal dark.
- [x] **446 [P1]** — Emptystate dark.
- [x] **447 [P1]** — Scrollbar ikut (dark).
- [x] **448 [P1]** — Transisi antar mode (opacity) singkat.
- [x] **449 [P1]** — Tes kontras dual mode (AA).
- [x] **450 [P1]** — Attribute `data-theme` di `<html>` + CSS vars switch — tanpa library.

### 1.13 Copy & Writing — 451–460

- [x] **451 [P0]** — Terjemahkan seluruh copy UI ke Bahasa Indonesia yang hangat: "Apa rencanamu hari ini?".
- [x] **452 [P1]** — Perbaiki tata bahasa: tanpa spasi sebelum tanda baca ("plan?" → "rencana?").
- [x] **453 [P1]** — Tombol: "Tambah Rencana", "Simpan", "Batal", "Hapus", "Ubah" — konsisten di semua halaman.
- [x] **454 [P1]** — Empty state: "Belum ada rencana. Mulai dengan yang pertama!".
- [x] **455 [P1]** — Error: "Rencana tidak boleh kosong" (spesifik, bukan generik).
- [x] **456 [P1]** — Placeholder: "Mis. Beli susu sebelum jam 8".
- [x] **457 [P1]** — 404: "Halaman tidak ditemukan" + subtitle "Halaman yang kamu cari tidak ada atau sudah dipindahkan.".
- [x] **458 [P1]** — Judul halaman: dokumentasi `title` per halaman ("Daftar Rencana", "Tambah Rencana", "Ubah Rencana").
- [x] **459 [P1]** — Toast sukses: "Rencana ditambahkan", "Perubahan disimpan", "Rencana dihapus".
- [x] **460 [P1]** — Semua micro-copy ramah dan bebas jargon teknis di sisi pengguna.

> **Catatan adaptasi (Bento netral).** Seksi ini awalnya ditulis untuk arah *Frosted Glassmorphism*.
> Arah visual final = **Bento neutral zinc/slate** (Lihat commit `40c05c1`); butir-butir yang
> berakar pada estetika kaca ditandai `[x]` bila **padanan Bento-nya terpasang** (token
> `--surface/--border/--gloss`, blur hanya di header & modal dengan `@supports` + fallback solid,
> `prefers-reduced-transparency`, grain halus, dsb.). Butir yang tetap `[ ]` adalah yang intinya
> memang estetika kaca (blob gradient, refleksi, glass chip/button) atau meminta fitur/QA yang
> sengaja tidak dipilih — bukan kelalaian.

---

## 2. SEO — butir 461–555

### 2.1 Struktur & Meta — 461–500

- [x] **461 [P0]** — Tambah `lang="id"` pada `<html>` (kini `lang="en"` walau konten Indonesia).
- [x] **462 [P0]** — Tambah meta `description` unik per halaman.
- [x] **463 [P0]** — Tambah `<title>` fallback default bila variabel kosong (layout guard).
- [x] **464 [P1]** — Meta `robots` (index,follow) untuk halaman publik.
- [x] **465 [P1]** — `canonical` URL ke domain utama.
- [x] **466 [P1]** — Meta `author`, `keywords` opsional.
- [x] **467 [P1]** — `og:type=website`, `og:site_name`, `og:title`, `og:description`, `og:image`.
- [x] **468 [P1]** — `twitter:card=summary`, `twitter:title`, `twitter:description`.
- [x] **469 [P1]** — Meta `theme-color` (ungu) — tampilan browser mobile.
- [x] **470 [P1]** — Semantik HTML5: `header`, `main`, `footer`, `nav`, `section` — bukan div-generik semua.
- [x] **471 [P1]** — 1 `<h1>` per halaman; hierarki h2/h3 logis.
- [x] **472 [P1]** — URL deskriptif & bermakna: `/add-todo`, `/edit-todo/:id`.
- [x] **473 [P1]** — Sitemap.xml di `/sitemap.xml` (list index + add).
- [x] **474 [P1]** — robots.txt di `/robots.txt` (allow /, sitemap ref).
- [x] **475 [P1]** — Href di dalam konten: `href="/"` normal, bukan `javascript:`.
- [x] **476 [P1]** — JSON-LD `WebSite` (+ `SearchAction` bila search server).
- [x] **477 [P1]** — JSON-LD `ItemList` / `TodoList` di index (bila bermanfaat).
- [x] **478 [P1]** — Pastikan halaman tidak `noindex` tanpa sengaja (meta robots utuh).
- [x] **479 [P1]** — Title pattern: "Nama App · Deskripsi singkat" lahir di layout helper.
- [x] **480 [P1]** — Heading mencakup kata kunci natural ("Daftar Rencana Hari Ini").
- [x] **481 [P1]** — Alt text gambar (logo/favicon inline tidak perlu alt kosong).
- [x] **482 [P1]** — `aria-label` pada nav (SEO minor + a11y).
- [x] **483 [P1]** — Bukan autentikasi untuk konten publik (todo app publik) — tidak di-block crawler.
- [x] **484 [P1]** — Status 404 benar (HTTP `404` kini controller tidak set status).
- [x] **485 [P1]** — Redirect pasca mutasi (PRG) menghindari duplikat index.
- [x] **486 [P1]** — Konsistensi trailing slash — avoid duplicated content.
- [ ] **487 [P1]** — `yandex`/`fb` meta opsional bila perlu.
- [x] **488 [P1]** — Favicon valid (SVG/PNG) + `apple-touch-icon` untuk mobile bookmark.
- [ ] **489 [P1]** — `<link rel="manifest">` (P2).
- [x] **490 [P1]** — Preview screenshot `og:image` ukuran 1200×630.
- [x] **491 [P1]** — `og:locale: id_ID`.
- [x] **492 [P1]** — Href canonical menggunakan URL absolut.
- [x] **493 [P1]** — Meta `referrer` safe (unsafe-url hanya di API).
- [x] **494 [P1]** — Gzip/compress respons HTML (Performance) — SEO+LCP.
- [x] **495 [P1]** — Sitemap dinamis via route (kecil, list static).
- [ ] **496 [P1]** — Google Site Verification meta — opsional.
- [x] **497 [P1]** — Konten teks ≥ minimal per halaman (index sudah).
- [x] **498 [P1]** — Internal link "Tambah" dari index → add page — natural crawl.
- [x] **499 [P1]** — 404 halaman tetap beri link ke homepage (crawl recovery).
- [x] **500 [P1]** — `Cache-Control` `no-store` hanya untuk mutasi; GET boleh cache.

### 2.2 Social Sharing & Rich Results — 501–530

- [x] **501 [P1]** — `og:image` konsisten brand (ungu glass card mockup).
- [x] **502 [P1]** — `twitter:image`.
- [x] **503 [P1]** — `og:description` 1-2 kalimat administratif.
- [x] **504 [P1]** — Title < 60 karakter (SEO snippet).
- [x] **505 [P1]** — Description < 155 karakter.
- [ ] **506 [P1]** — JSON-LD organization (opsional).
- [x] **507 [P1]** — OpenGraph `url` = canonical.
- [ ] **508 [P1]** — `article:published_time` di blog nanti (tidak).
- [ ] **509 [P1]** — Test dengan validator (opengraph.xyz / Meta inspector).
- [x] **510 [P1]** — Social preview saat share di WhatsApp/Telegram — meta lengkap.
- [x] **511 [P1]** — `og:title` tanpa nama domain berulang.
- [ ] **512 [P1]** — `fb:app_id` — hanya bila FB integrasi (skip).
- [x] **513 [P1]** — Image absolute URL di og:image.
- [x] **514 [P1]** — `og:image:width/height` diset.
- [x] **515 [P1]** — `og:image:alt` diset.
- [ ] **516 [P1]** — `twitter:creator` (opsional).
- [ ] **517 [P1]** — `twitter:label1/value1` dll (tidak perlu).
- [ ] **518 [P1]** — JSON-LD `BreadcrumbList` di inner pages (P2).
- [x] **519 [P1]** — Schema `WebApplication` (opsional niche).
- [ ] **520 [P1]** — RSV recheck preview di Chrome DevTools.

### 2.3 Teknis Crawling/Indexing — 531–565

- [x] **521 [P1]** — Server bind benar; sitemap URL pakai domain yang dikonfigurasi.
- [x] **522 [P1]** — Semua internal link ber-`href` (crawlable).
- [x] **523 [P1]** — Tidak ada konten disembunyikan di interaksi JS-only (progress enhancement).
- [ ] **524 [P1]** — `INDEX` di `.gitignore` untuk env — biar build bersih.
- [ ] **525 [P1]** — 301 redirect lama → baru (jika rute diubah).
- [x] **526 [P1]** — Pastikan halaman tak menanh header `X-Robots-Tag: noindex`.
- [x] **527 [P1]** — Server error (500) → tampilan ramah + status benar.
- [ ] **528 [P1]** — HTTP/2 or later (dev proxy) — header efisien.
- [x] **529 [P1]** — `preconnect` untuk font/asset eksternal.
- [x] **530 [P1]** — Avoid render-blocking (CSS inline critical small).
- [x] **531 [P1]** — LCP cepat (server-rendered HTML langsung — sudah bagus).
- [ ] **532 [P1]** — FCP < 1.5s target; CLS < 0.1.
- [x] **533 [P1]** — Kecepatan index pakai caching statis.
- [x] **534 [P1]** — Beri `ETag` — caching kecil.
- [x] **535 [P1]** — Compression gzip/brotli.
- [x] **536 [P1]** — `Cache-Control` 1h untuk CSS/JS statis (immutable hash bila ada build).
- [x] **537 [P1]** — `Cache-Control` `no-cache` untuk HTML (revalidate).
- [x] **538 [P1]** — Sitemap update saat struktur berubah.
- [x] **539 [P1]** — Robots.txt `Allow: /`, `Disallow: /api/` (jika ada).
- [x] **540 [P1]** — Pastikan 404 halaman tidak di-index (meta robots noindex on error).
- [x] **541 [P1]** — Apabila future SSR/CSR — semua konten tetap SSR (sudah EJS).
- [x] **542 [P1]** — Pastikan tidak ada konten diduplikasi di 2 URL (add & edit).
- [x] **543 [P1]** — Href pada tombol (bukan onclick hanya) saat perlu link.
- [x] **544 [P1]** — per-page `og:url` + canonical.
- [ ] **545 [P1]** — Test render di Google Rich Results / generic crawler.
- [x] **546 [P1]** — Performance budget dioksigen (budget 200KB CSS/JS total) — kita 1 CSS ~10KB.
- [x] **547 [P1]** — Konten tidak tersembunyi `display:none` untuk SEO text (jangan spam).
- [x] **548 [P1]** — Favicon suatu halaman (href) unik — valid.
- [x] **549 [P1]** — Meta viewport tidak menghambat zoom — aman.
- [x] **550 [P1]** — URL scheme `https` di canonical di produksi.
- [x] **551 [P1]** — Semua href escape proper.
- [x] **552 [P1]** — Infra: sertakan `X-Content-Type-Options: nosniff` (helmet) — SEO+security.
- [x] **553 [P1]** — Densi halaman: page weight rendah (HTML kecil) — cepat index.
- [x] **554 [P1]** — Meta `format-detection: telephone=no` opsional.
- [ ] **555 [P1]** — Jalankan audit Lighthouse di setiap PR stage — target SEO ≥ 90.

---

## 3. PERFORMANCE — butir 556–660

### 3.1 Aset & Font — 566–600

- [x] **556 [P0]** — Hapus `@import` font dari CSS; gunakan `<link rel=preconnect>` + `<link>` di `<head>` dengan `display=swap`.
- [x] **557 [P0]** — Ganti Font Awesome CDN `<script>` (render-blocking ~90KB) dengan **set ikon inline SVG minimal** (plus, pen, trash, check, search) — hemat request & kompatibel offline.
- [x] **558 [P1]** — Subset font (Latin) — kurangi ukuran woff2.
- [x] **559 [P1]** — Self-host font (konversi woff2) — tanpa CDN eksternal, cache terjaga.
- [x] **560 [P1]** — Preload font critical (`<link rel=preload as=fetch type=font/woff2 crossorigin>`).
- [x] **561 [P1]** — Favicon pakai SVG inline / data URI kecil — hemat request.
- [x] **562 [P1]** — Hapus `style.css.map` (tidak dipakai, merujuk scss yang hilang).
- [ ] **563 [P1]** — Minify CSS produksi; bila mau, perkenalkan build kecil (esbuild/tsup) — opsional.
- [x] **564 [P1]** — Ukuran ikon inline SVG < 5KB total — jauh lebih kecil dari FontAwesome.
- [x] **565 [P1]** — Compression: gzip atau brotli untuk HTML/CSS/JS (via `compression`).
- [ ] **566 [P1]** — Cache static assets: `Cache-Control: immutable` untuk css/js hash.
- [x] **567 [P1]** — `ETag` + in-memory cache ringan untuk render — P2.
- [ ] **568 [P1]** — Avoid render-blocking: CSS critical inline (≤4KB) opsional.
- [x] **569 [P1]** — Load script `defer` di akhir body — tidak memblok parsing.
- [ ] **570 [P1]** — Tidak ada library JS eksternal untuk interaksi vanilla.
- [x] **571 [P1]** — `loading="lazy"` untuk gambar (favorit_app) bila ada.
- [x] **572 [P1]** — Preload LCP asset (hero background CSS) — opsional.
- [x] **573 [P1]** — Hapus kerugian koneksi eksternal bila font di-selfhost.
- [ ] **574 [P1]** — Pastikan website weight < 100KB HTML+CSS+JS (target).
- [x] **575 [P1]** — SVG sprite untuk semua ikon (single file) — minimal request.
- [x] **576 [P1]** — Gunakan `aspect-ratio` untuk elemen medium — CLS zero.
- [x] **577 [P1]** — Sertakan `width`/`height` pada img/logo bila ada.
- [x] **578 [P1]** — Avoid `@import` di CSS (sudah) — transfer ke link.
- [ ] **579 [P1]** — Blog/konten: gambar responsive `srcset` — tidak relevan sekarang (P2).
- [x] **580 [P1]** — Inline rangka SVG logo di HTML — intuisi brand tanpa request.
- [x] **581 [P1]** — `font-display: swap` di CSS @font-face self-host.
- [ ] **582 [P1]** — Trim semua whitespace di HTML output — ukuran kecil.
- [ ] **583 [P1]** — CSS rewrite: token + komponen = CSS ~8–12KB (havoc gzip 3KB).
- [ ] **584 [P1]** — Hapus komentar besar di CSS produksi.
- [x] **585 [P1]** — Blob gradient CSS: murni CSS (tanpa gambar) — zero request.
- [x] **586 [P1]** — Verify no mixed content (http vs https).
- [ ] **587 [P2]** — HTTP/3 / QUIC bila infrastruktur mendukung.
- [ ] **588 [P1]** — Test pada 3G (250ms RTT) — tetap cepat karena SSR.
- [ ] **589 [P1]** — Perf budget rainy day: gambar 0, font 2 (self-host), CSS 1, JS 1.
- [x] **590 [P1]** — Pertimbangkan icon font local (tidak; SVG sudah).

### 3.2 Server & Middleware — 601–635

- [x] **591 [P0]** — Hapus middleware tak terpakai (cors, cookieParser, rateLimiter, socket) — penghemat inovasi kecil tapi bersih.
- [x] **592 [P1]** — Urutan middleware: helmet → compression → static → urlencoded/json → routes.
- [x] **593 [P1]** — Python? ADALAH: `express.static` cache `maxAge: '7d'` untuk aset.
- [x] **594 [P1]** — `morgan` di prod: kombinasikan `:status` short dengan sampling — atau ganti kustom tipis log.
- [x] **595 [P1]** — Graceful shutdown: SIGTERM → close server & simpan data JSON (flush).
- [x] **596 [P1]** — Handle concurrent request terhadap file JSON: single-file atomic write (tmp + rename) — hindari corrupt.
- [ ] **597 [P1]** — Debounced save (opsional 100ms) bila banyak mutasi cepat.
- [x] **598 [P1]** — JSON storage memakai `writeFileSync` atomic untuk file kecil — cukup (simpel).
- [ ] **599 [P1]** — Rate limit hanya pada mutasi bila perlu (local app tidak wajib).
- [x] **600 [P1]** — Koneksi DB — tidak ada lagi (local).
- [x] **601 [P1]** — Rendering EJS cache on di prod (`app.set('view cache', true)`).
- [x] **602 [P1]** — Trust proxy bila di balik reverse proxy (untuk IP log akurat).
- [x] **603 [P1]** — CORS tak diperlukan (sama origin) — hapus asetnya.
- [x] **604 [P1]** — `helmet` menyediakan security headers — tetap pas.
- [x] **605 [P1]** — Body parser limit `express.json({ limit: '10kb' })` — kecil.
- [x] **606 [P1]** — Directory ini tidak mengekspos `package.json`/`data/` melalui static.
- [x] **607 [P1]** — Produksi: `NODE_ENV=production` → view cache + logger timing.
- [x] **608 [P1]** — Static css versi `?v=hash` untuk cache buka.
- [x] **609 [P1]** — Paksa `X-Content-Type-Options` (nosniff) via helmet.
- [x] **610 [P1]** — Avoid `sync` di hot path (kecuali writer JSON kecil aman).
- [x] **611 [P1]** — Data file tidak diblokir untuk 2 simulasi tulis — lock sederhana bila perlu.
- [ ] **612 [P1]** — DateTime: jangan format di server tiap request; cache string (opsional).
- [ ] **613 [P1]** — Index page: query list cost kecil; pagination bila >200 item (P1).
- [x] **614 [P1]** — Search filter client-side — tanpa round-trip.
- [x] **615 [P2]** — Mount compression hanya di route; jangan di static (sudah cache).
- [x] **616 [P1]** — Log morgan format concat; hapus di prod bila tak perlu.
- [x] **617 [P1]** — Hindari `console.log` besar di request — logger ringan.
- [x] **618 [P1]** — Db disk: `data/todos.json` tidak ikut git (.gitignore).
- [x] **619 [P1]** — Startup: load JSON → JS object di memori; simpan ulang per mutasi.
- [ ] **620 [P1]** — Memoisasi render partial? — mikro, skip.
- [x] **621 [P1]** — Server timeouts: `server.requestTimeout` reasonable.
- [x] **622 [P1]** — `keepAliveTimeout` default Node (5s) — fine.
- [ ] **623 [P1]** — Metrics: tanpa service (P2 bisa /metrics).
- [x] **624 [P1]** — Health check tanpa DB — ringan.
- [x] **625 [P1]** — Build: `tsc` already; beri `sourceMap=false` di prod bila perlu.

### 3.3 Web Vitals & Rendering — 636–670

- [x] **626 [P1]** — LCP target: elemen pertama (title/list) cepat — SSR.
- [x] **627 [P1]** — FID/INP: tidak ada JS blocking besar — kecil.
- [x] **628 [P1]** — CLS: ukuran elemen reservasi → layout stabil.
- [x] **629 [P1]** — TTFB < 200ms local.
- [x] **630 [P1]** — Avoid `layout shift` saat font swap (font-size-adjust / preload).
- [ ] **631 [P1]** — CSS min 1 request, JS 1 request (defer) — budget.
- [x] **632 [P1]** — Interaktivitas pertama cepat — tanpa JS framework.
- [x] **633 [P1]** — Progressive enhancement: tanpa JS form tetap jalan (server render).
- [x] **634 [P1]** — PNG logo: ganti SVG inline (opsional, kecil).
- [x] **635 [P1]** — `will-change` hati-hati — hanya animasi intens.
- [x] **636 [P1]** — Animasi 60fps — backdrop-filter compose GPU.
- [ ] **637 [P1]** — Test di Slow 4G — halaman 1 detik.
- [x] **638 [P1]** — Blocking script Font Awesome — ganti SVG (P0).
- [x] **639 [P1]** — No `document.write` — tidak ada.
- [x] **640 [P1]** — Mempertahankan HTML static (SSR) untuk semua konten.
- [ ] **641 [P1]** — Kecil kode JS: 1 file ~3KB vanilla.
- [x] **642 [P1]** — Gzip HTML bawaan via compression.
- [x] **643 [P1]** — Preconnect ke fonts.gstatic.com bila pakai Google Fonts.
- [ ] **644 [P1]** — Paksa cache-friendly headers di Nginx/PM2 bila ada.
- [x] **645 [P1]** — Pastikan CORS tidak diblok throw di prod (tidak dipakai).
- [ ] **646 [P1]** — PWA offline (P2) — service worker 20 baris.
- [ ] **647 [P1]** — Lighthouse Performance target ≥ 95.
- [ ] **648 [P1]** — Bundle analysis? Tiny — skip.
- [x] **649 [P1]** — Startup cepat — tidak ada init DB.
- [x] **650 [P1]** — Memory: JSON kecil — stabil.
- [x] **651 [P1]** — CPU: blur animasi ringan di desktop; mobile blur kecil.
- [ ] **652 [P1]** — Avoid excessive DOM (list < 500 item) — pagination.
- [x] **653 [P1]** — Event handlers minimal (delegasi vanila).
- [x] **654 [P1]** — Toast & modal — bukti tidak reflow besar.
- [x] **655 [P1]** — Contrast disable blur saat reduced.
- [x] **656 [P1]** — Data persistensi sync per mutasi — kecil antar.
- [x] **657 [P1]** — Semua animasi `transform/opacity` — murah.
- [ ] **658 [P1]** — Tidak memakai library animasi eksternal.
- [x] **659 [P1]** — Aset cache lama 7d + HTML no-cache — pola sehat.
- [ ] **660 [P1]** — Jalankan audit bulanan (Lighthouse CI optional).

---

## 4. BEST PRACTICE (Architecture & Code) — butir 661–750

### 4.1 Arsitektur — 671–700

- [x] **661 [P0]** — Hapus MongoDB/Typegoose & auth (100% local data) — ganti storage JSON sederhana.
- [x] **662 [P0]** — `src/app/services/todo.service.ts` di-export & dipakai konsisten (barrel).
- [x] **663 [P1]** — Pisahkan `store` lokal (read/write JSON) dari controller — 1 layer data.
- [x] **664 [P1]** — Router terpisah per domain (todo, health, not-found) — bersih.
- [x] **665 [P1]** — Nama file konsisten: kebab/single → `*.controller.ts`, `*.service.ts`.
- [x] **666 [P1]** — Controller tipis (parse request → call service → render).
- [x] **667 [P1]** — Service tangani logika (validasi ringan, persistance).
- [x] **668 [P1]** — Error handling terpusat: error middleware + render error view.
- [x] **669 [P1]** — `process.exit` tidak ada di runtime app (hapus dari database.ts).
- [x] **670 [P1]** — Konfigurasi env: hanya PORT & DATA_PATH; default aman.
- [x] **671 [P1]** — Hapus dotenv/config dari start scripts (tidak perlu multi env).
- [x] **672 [P1]** — `index.ts` ringkas: app.listen + graceful shutdown.
- [x] **673 [P1]** — Health check tanpa depend DB — selalu UP.
- [x] **674 [P1]** — Hapus socket.io (tidak dipakai) + middleware cors.
- [x] **675 [P1]** — Spesifikasi request/response 1 bahasa (JSON/HTML jelas route).
- [x] **676 [P1]** — Jangan menyimpan data di `public/` — gunakan `data/` root w/ .gitignore.
- [x] **677 [P1]** — Data default: seed file `data/todos.json` dibuat otomatis saat run.
- [x] **678 [P1]** — mencoba struktur: views/layouts + views/partials dipisah.
- [x] **679 [P1]** — Tidak ada kode duplikat antar halaman (share partial).
- [x] **680 [P1]** — Interfaces: `Todo` type di `src/interfaces/todo.ts` (local type, bukan model mongoose).
- [x] **681 [P1]** — Barrel export `helpers/index.ts` termasuk `render`.
- [x] **682 [P1]** — Export service dari `services/index.ts` — semua di barrel.
- [x] **683 [P1]** — Hapus file tidak dipakai: `hash.helper.ts`, `jwt/**`, model user/session.
- [x] **684 [P1]** — EJS partial reuse minim — gunakan include.
- [x] **685 [P1]** — API routes (`/api`, `/api/health-check`) tetap ringkas.
- [x] **686 [P1]** — Tidak ada logika bisnis di route.
- [x] **687 [P1]** — Tidak ada `any` di internal (strict TS).
- [x] **688 [P1]** — Semua file TS diberi eslint/biome — nol warning.
- [x] **689 [P1]** — Kontrol versioning data schema (migrasi trivial local).
- [x] **690 [P1]** — Output build `dist/` clean.

### 4.2 Kode TypeScript — 701–730

- [x] **691 [P1]** — Strict mode tetap aktif (tsconfig `strict: true`).
- [x] **692 [P1]** — `noImplicitAny` — cek ulang (strict sudah).
- [x] **693 [P1]** — Decorator `experimentalDecorators` tidak perlu lagi (hapus typegoose) — bisa dihapus dari tsconfig.
- [x] **694 [P1]** — `moduleResolution` modern `NodeNext` (opsional).
- [x] **695 [P1]** — Utk Node 24 `target ES2022+` — fine.
- [x] **696 [P1]** — Hapus `@types/cli-color`, `@types/npmlog` dll (tidak dipakai).
- [x] **697 [P1]** — Rest operasi: gunakan explicit return types di fungsi publik.
- [x] **698 [P1]** — `async/await` konsisten; tidak campur .then.
- [x] **699 [P1]** — Jangan re-query user setelah create (register) — kembalikan data tanpa password dari satu query.
- [x] **700 [P1]** — Validasi input menggunakan helper ringan (funsi `required`) — bukan lib besar.
- [x] **701 [P1]** — Tipe untuk payload render (`ViewData` interface).
- [x] **702 [P1]** — `unknown` di catch + type guard (bukan `error: any`).
- [x] **703 [P1]** — Hapus `"main": "index.js"` salah dari package.json.
- [x] **704 [P1]** — Menambahkan `engines` di package.json (node >=20).
- [x] **705 [P1]** — `pnpm` sebagai paket manager (lockfile dipakai).
- [x] **706 [P1]** — README ditulis (modul path, run, struktur).
- [x] **707 [P1]** — Script `build` memakai `tsc` — bisa `tsup` bila butuh bundle (P2).
- [x] **708 [P1]** — Tidak pakai `dotenv` bila tidak ada .env? Simpan PORT default.
- [x] **709 [P1]** — `win-node-env` dihapus (tidak perlu, NODE_ENV via cross script mana pun).
- [x] **710 [P1]** — Hapus `socket.io` type imports.
- [x] **711 [P1]** — `IRequest` interface dihapus (tidak dipakai auth).
- [x] **712 [P1]** — Helper `render` walau kecil — keep (nice).
- [x] **713 [P1]** — Rute defense: validasi `req.params.id` format.
- [x] **714 [P1]** — Helper `response.helper` untuk API (biarkan).
- [x] **715 [P1]** — Penyederhanaan middleware: hapus auth/isAdmin.
- [x] **716 [P1]** — Pastikan `dist` tidak di-commit (.gitignore).
- [x] **717 [P1]** — `create-env.ts` dihapus (env tidak perlu).
- [x] **718 [P1]** — Tunggu: hapus `--maxWorkers`... (tiada).
- [x] **719 [P1]** — Sediakan `typecheck` script terpisah.
- [x] **720 [P1]** — Consistent import order via Biome organizeImports (CI).

### 4.3 Logging & Observability — 731–755

- [x] **721 [P1]** — Ganti `npmlog` (deprecated) dengan logger mini sendiri (console + timestamp) atau `pino` (P2).
- [x] **722 [P1]** — Log level dir jenjang: debug/dev, info/prod.
- [x] **723 [P1]** — Log mutasi (add/edit/delete) — auditable.
- [x] **724 [P1]** — Jangan log data sensitif (tidak ada lagi).
- [x] **725 [P1]** — Health endpoint log? Sepi.
- [x] **726 [P1]** — Error log: stack di dev, pesan di prod.
- [ ] **727 [P1]** — Structured log (JSON) bila di produksi — P2.
- [x] **728 [P1]** — Timezone lokal / ISO dengan zona.
- [x] **729 [P1]** — `morgan` cukup untuk request log.
- [x] **730 [P1]** — Jangan log body request penuh (privasi).
- [ ] **731 [P1]** — ID request (correlation) — P2 bila perlu.
- [x] **732 [P1]** — Cegah log flood dari health-check interval (skip di prod).
- [ ] **733 [P1]** — Kategorikan log (app, request, store).
- [ ] **734 [P1]** — File drain rotate (opsional P2).
- [x] **735 [P1]** — Sediakan `console.error` di handler error global.

### 4.4 Proses & Git — 756–770

- [x] **736 [P1]** — Pre-commit: biome check (bukan eslint) + lint-staged.
- [x] **737 [P1]** — Commit message conventional (`feat:`, `fix:`).
- [ ] **738 [P1]** — Branch per fitur + PR.
- [x] **739 [P1]** — `.editorconfig` konsisten (sudah ada).
- [x] **740 [P1]** — `.prettierrc` digantikan Biome (hapus prettier) — satu tool.
- [x] **741 [P1]** — Hapus `.eslintrc` — biome config.
- [x] **742 [P1]** — Lockfile di-rejeki (pnpm-lock.yaml) — version reproducible.
- [x] **743 [P1]** — No secrets in repo (sudah tak ada).
- [ ] **744 [P1]** — Rebase sebelum merge (linear history) — opsional.
- [ ] **745 [P1]** — Code review checklist kecil (README).
- [ ] **746 [P1]** — Tag release (v0.2.0...) — disiplin versi.
- [ ] **747 [P1]** — CI: pnpm install --frozen-lockfile + biome + build + test.
- [x] **748 [P1]** — Jangan ganggu commit saat rush — tetap lint.
- [ ] **749 [P1]** — Changelog (bagian README / GitHub Releases).
- [x] **750 [P1]** — LICENSE tetap (Apache 2.0).

---

## 5. EFFICIENCY & REFACTOR — butir 751–840

### 5.1 Hapus Dead Code & Dependencies — 771–800

- [x] **751 [P0]** — Hapus dependency: mongoose, @typegoose/typegoose, bcrypt, jsonwebtoken, cookie-parser, cors, express-rate-limit, socket.io, npmlog, dotenv, win-node-env.
- [x] **752 [P0]** — Hapus devDependency: @types/bcrypt, @types/cookie-parser, @types/cors, @types/jsonwebtoken, @types/npmlog, @types/cli-color, cli-color, eslint, @typescript-eslint/*, prettier.
- [x] **753 [P1]** — Hapus direktori/ file: `src/jwt`, `src/app/models/{user,session}.model.ts`, `src/app/services/{user,session}.service.ts`, `src/app/middlewares`, `src/app/controllers/admin`, `src/routes/admin`, `src/app/controllers/auth.controller.ts`, `src/config/{env,database}.ts` (kecuali PORT), `src/logger` jika diganti.
- [x] **754 [P1]** — Hapus `src/app/models/index.ts` (tidak ada model mongoose).
- [x] **755 [P1]** — Hapus `pnpm-workspace.yaml` allowBuilds bcrypt (dependensi hilang) — atau sesuaikan.
- [x] **756 [P1]** — Hapus docker DB: `docker/mongodb`, `docker/mongo-express`, `docker/docker-compose.yml`, `docker-compose.yml` (Mongo service).
- [x] **757 [P1]** — Hapus `create-env.ts`, `env/`, `.env.example` (tidak ada env secret).
- [x] **758 [P1]** — Ganti `npmlog` → log konsol ringan (kurangi deps deprecated).
- [x] **759 [P1]** — Hapus `style.css.map`.
- [x] **760 [P1]** — Hapus setup `win-node-env` — cross-env? Samai NODE_ENV via JSON script biasa.
- [x] **761 [P1]** — Hapus script docker yang sudah obsolete di package.json.
- [x] **762 [P1]** — Hapus `setup-app*` bila tak dipakai.
- [x] **763 [P1]** — Pastikan `update-deps` pnpm tetap ada.
- [x] **764 [P1]** — Audit `pnpm outdated` — nol dependensi usang.
- [ ] **765 [P1]** — Jangan instal ulang modal — pnpm clean.
- [x] **766 [P1]** — Total deps runtime menyusut drastis (express, ejs, layouts, method-override, morgan, compression, helmet).
- [x] **767 [P1]** — DevDeps menyusut (typescript, ts-node, nodemon, @types/*, biome, husky, lint-staged).
- [x] **768 [P1]** — `package.json` name/version diperbarui relevan.
- [x] **769 [P1]** — Keywords update (hapus mongodb/mongoose/socket.io).
- [x] **770 [P1]** — Remove `main: index.js` stale.
- [x] **771 [P1]** — Hapus `.npmrc` bila tak perlu.
- [x] **772 [P1]** — Pertimbangkan hapus `.ejsbrc.json` bila tak dipakai (opsional).
- [x] **773 [P1]** — Verify `node_modules` bersih via `pnpm install` dari nol.
- [x] **774 [P1]** — Golang? Tidak — pilih jalan terminology.
- [x] **775 [P1]** — Bundler? Tidak perlu (EJS server + CSS direct).
- [x] **776 [P1]** — Hapus `socket.controller.ts`.
- [x] **777 [P1]** — Hapus interface `decoded-user.ts`, `i-request.ts`.
- [x] **778 [P1]** — Hapus `config/database.ts` connect/exit.
- [x] **779 [P1]** — Hapus `hash.helper.ts` & `str.helper.ts` bila tak dipakai.
- [x] **780 [P1]** — Hapus `response.helper` bila HTML-only? Pertahankan untuk health/main JSON.

### 5.2 Konsolidasi & Penyederhanaan — 801–830

- [x] **781 [P1]** — Satu storage service (`todo.service.ts`) membaca/menulis `data/todos.json`.
- [x] **782 [P1]** — Controller `todo` punya 6 handler (index, store, update, destroy, add-form, edit-form) — ringkas.
- [x] **783 [P1]** — Rute todo: `GET /`, `POST /`, `GET /add-todo`, `GET /edit/:id`, `PUT /:id`, `DELETE /:id` — RESTful.
- [x] **784 [P1]** — Nama field konsisten `name` (hapus `kegiatan`) — perbaiki semua view.
- [x] **785 [P1]** — `<%- body %>` layout tetap; partial di `views/partials`.
- [x] **786 [P1]** — Tidak ada duplikasi CSS antar add/edit — komponen bersama.
- [x] **787 [P1]** — Helper render di barrel (`helpers/index.ts`).
- [x] **788 [P1]** — Judul teks satu sumber helper `pageTitle`.
- [x] **789 [P1]** — Prompt error render: satu pattern view-helper (query flash).
- [x] **790 [P1]** — Tidak ada file 2 fungsi tak terpakai.
- [ ] **791 [P1]** — `app.ts` 20 baris tidy.
- [x] **792 [P1]** — Tidak ada `any` tersisa di TS.
- [x] **793 [P1]** — Type `Todo` interface lokal sederhana.
- [x] **794 [P1]** — Data layer atomic: tmpfile + rename.
- [x] **795 [P1]** — In-memory cache array + persist per mutasi — konsisten.
- [x] **796 [P1]** — Mapping id baru via `crypto.randomUUID()`.
- [x] **797 [P1]** — Timestamp disimpan di record (`createdAt`, `updatedAt`).
- [x] **798 [P1]** — Sort diserahkan ke service (default createdAt desc / manual).
- [x] **799 [P1]** — Filter (aktif/selesai) ke service optional.
- [x] **800 [P1]** — EJS escaping `<%= %>` — safe default.
- [x] **801 [P1]** — Konfigurasi single: `config/app.ts` (PORT, DATA_PATH, view settings).
- [x] **802 [P1]** — `index.ts` — listen + SIGINT/SIGTERM handler.
- [x] **803 [P1]** — Health check murni tanpa store (ringan).
- [x] **804 [P1]** — Logger: `logger.ts` 10 baris (info/warn/error + timestamp).
- [x] **805 [P1]** — Tipe render data `ViewData { title, layout, todos, filters? }`.
- [x] **806 [P1]** — Non-guard: tidak ada paket validasi JSON-schema — cukup manual.
- [ ] **807 [P1]** — Fokus: variasikan PR kecil — sesuaikan riuh.
- [x] **808 [P1]** — Script konsisten: `dev`, `build`, `start`, `lint`, `format`, `test`.
- [x] **809 [P1]** — Dist ignore.
- [x] **810 [P1]** — Verifikasi `pnpm start` jalan dari dist.

### 5.3 Optimasi Alur Data — 831–860

- [x] **811 [P1]** — Baca file sekali saat startup, mutasi tulis sinkron kecil.
- [x] **812 [P1]** — Handle ENOENT: buat file default `[]`.
- [x] **813 [P1]** — Handle JSON corrupt: backup `.bak` + reseed.
- [x] **814 [P1]** — Max todos limit configurable (default 1000).
- [x] **815 [P1]** — ID tidak bocor ke URL panjang — UUID ok.
- [x] **816 [P1]** — Slug tidak perlu di struktur — id UUID.
- [ ] **817 [P1]** — O(1) find by id via Map — untuk cepat hapus.
- [ ] **818 [P1]** — Map untuk filter — item tetap array of object.
- [x] **819 [P1]** — Deep clone sebelum mutasi — avoid alias bug.
- [x] **820 [P1]** — Jangan tulis full array kalau tidak berubah — guard.
- [x] **821 [P1]** — Penulisan memakai os.tmpdir + rename — atomic.
- [x] **822 [P1]** — Flush di interval 5s (opsional) — keep simple per-mutasi.
- [ ] **823 [P1]** — Prevent race: mutasi serialized via microtask queue — P2.
- [ ] **824 [P1]** — Cache render list saat filter tidak berubah (memory) — P2.
- [x] **825 [P1]** — Dapatkan stat count dari array (reduce) — murah.
- [x] **826 [P1]** — String compare ignore case di search — normalized.
- [x] **827 [P1]** — Trim di input → simpan clean.
- [x] **828 [P1]** — Batasi 1 kata 200 char — ringan.
- [x] **829 [P1]** — multiply by logic sederhana — no bloat.
- [ ] **830 [P1]** — Saat dah large file 1MB? — pagination.
- [x] **831 [P1]** — Jangan gunakan fs sync di event loop? Untuk file kecil 100KB — aman.
- [x] **832 [P1]** — Build TS → CommonJS — jalan di Node langsung.
- [x] **833 [P1]** — No build step untuk CSS (manual token) — hemat.
- [x] **834 [P1]** — Jalankan `NODE_ENV=production` tanpa env var tambahan.
- [x] **835 [P1]** — Hanya 1 port bind.
- [x] **836 [P1]** — Retry, backoff? Tidak perlu (local).
- [x] **837 [P1]** — Health zurich tetap.
- [ ] **838 [P1]** — Upgrade test — pnpm update --latest lalu lock.
- [x] **839 [P1]** — Verifikasi tidak ada pnpm warn peer.
- [x] **840 [P1]** — Ringkasan: runtime brick kecil, kode bersih (target ~1.2k LOC).

---

## 6. KEAMANAN (SECURITY) — butir 841–905

- [ ] **841 [P0]** — Tambah `helmet` — atur security headers (X-Content-Type-Options, CSP dasar, dll).
- [ ] **842 [P1]** — Escape semua output EJS (`<%= %>`) — cegah XSS.
- [ ] **843 [P1]** — Jangan pakai `<%- %>` untuk data user tanpa sanitasi.
- [ ] **844 [P1]** — Validasi input: `req.body.name` wajib string, trim, max 200 char.
- [ ] **845 [P1]** — Validasi `req.params.id` UUID format — cegah path traversal/DoS string.
- [ ] **846 [P1]** — Body parser limit `express.json/urlencoded({ limit: '10kb' })`.
- [ ] **847 [P1]** — `helmet.hidePoweredBy` — jangan bocorkan framework.
- [ ] **848 [P1]** — CSP dasar: `default-src 'self'` + fonts inline-style — konten eksternal dikontrol.
- [ ] **849 [P1]** — Tidak ada secret/key di repo (jwt secret dihapus).
- [ ] **850 [P1]** — `Referrer-Policy: strict-origin-when-cross-origin`.
- [ ] **851 [P1]** — `Permissions-Policy` (geolocation=() dll) — opsional.
- [ ] **852 [P1]** — Jangan tampilkan stack trace di prod (error view ramah).
- [ ] **853 [P1]** — Jangan log body sensitive.
- [ ] **854 [P1]** — `--inspect` no di prod.
- [ ] **855 [P1]** — Rate limit (optional) pada mutasi bila publik — express-rate-limit ringan.
- [ ] **856 [P1]** — No eval / Function constructor di JS.
- [ ] **857 [P1]** — API health tanpa data pribadi.
- [ ] **858 [P1]** — CORS dibatasi (same-origin) — tak perlu `*`.
- [ ] **859 [P1]** — Fitur server yang tidak dipakai: remove frameguard? Helmet bawaan.
- [ ] **860 [P1]** — Cache JSON store tidak diserve publik (data dir ignore).
- [ ] **861 [P1]** — `trust proxy` hati-hati bila dipakai (IP spoof) — set `1` saja bila di proxy.
- [ ] **862 [P1]** — Tangani `unhandledRejection` — log & exit? warn.
- [ ] **863 [P1]** — Tangani mutasi duplikat (idempotensi POST) — simple.
- [ ] **864 [P1]** — Form hijack — SameSite? Cookie tak ada lagi.
- [ ] **865 [P1]** — No CSRF dibutuhkan (no cookie/session) — jika tambah auth nanti, pertimbangkan.
- [ ] **866 [P1]** — Validation regex untuk UUID — jangan buka injection via id.
- [ ] **867 [P1]** — Jangan mirror input ke class/style.
- [ ] **868 [P1]** — Update dependency rutin (security patches).
- [ ] **869 [P1]** — Umumkan `npm audit` / `pnpm audit` dalam CI — untuk produksi.
- [ ] **870 [P1]** — Jangan pakai old express 4 versi paham? Update ke 4.x patch atau 5 bila stabil.
- [ ] **871 [P1]** — Container? Untuk lokal tidak perlu — hindari attack surface.
- [ ] **872 [P1]** — Secret di env — tidak ada lagi; PORT default.
- [ ] **873 [P1]** — File path terlindungi — DATA_PATH eksternal bisa.
- [ ] **874 [P1]** — Siapkan forward proxy — di luar scope.
- [ ] **875 [P1]** — Health endpoint sabar (no flooding info).
- [ ] **876 [P1]** — Header response remove `X-Powered-By`.
- [ ] **877 [P1]** — Trust NO user input ke dalam template/include path.
- [ ] **878 [P1]** — Tolak request body besar di limit.
- [ ] **879 [P1]** — NORMALIZE unicode input? — trim cukup.
- [ ] **880 [P1]** — SSRF — tidak ada URL fetch.
- [ ] **881 [P1]** — Provider dependency minimal — attack surface kecil.
- [ ] **882 [P1]** — Update EJS patch (XSS fix masa lalu) — latest.
- [ ] **883 [P1]** — Sediakan `crypto.randomUUID` standar.
- [ ] **884 [P1]** — No `eval` di template (default EJS aman).
- [ ] **885 [P1]** — CSP style-src inline untuk token — ok.
- [ ] **886 [P1]** — `helmet` version terbaru di deps.
- [ ] **887 [P1]** — Rate limit pada path `/` mutasi bila publik.
- [ ] **888 [P1]** — Cache-Control `no-store` pada response mutasi.
- [ ] **889 [P1]** — Jangan simpan password (tidak ada auth).
- [ ] **890 [P1]** — Login? — dihapus — jangan sebagian auth.
- [ ] **891 [P1]** — Sirkuit kecil = audit mudah.
- [ ] **892 [P1]** — Document security (README) — ukuran mitigasi.
- [ ] **893 [P1]** — Don't put function in URLs.
- [ ] **894 [P1]** — Pastikan data unik (todos.json) tidak trackable.
- [ ] **895 [P1]** — Express 4 → 5 migration opsional (async handler tidak perlu).
- [ ] **896 [P1]** — Gunakan `res.redirect` pada PRG — bukan render langsung.
- [ ] **897 [P1]** — Anti-autocomplete di form? Tidak perlu (bukan data sensitif).
- [ ] **898 [P1]** — Container wait — non-relevant.
- [ ] **899 [P1]** — Akses jalan data via symlink? Tidak.
- [ ] **900 [P1]** — Log request tidak menampilkan cookies.
- [ ] **901 [P1]** — Avoid leak ID dalam daftar — UUID ok.
- [ ] **902 [P1]** — Integer overflow — tidak.
- [ ] **903 [P1]** — Menu protected — semua publik (todo).
- [ ] **904 [P1]** — Secure by default: tidak ada aktivitas berbahaya.
- [ ] **905 [P1]** — Sediakan sekuriti config di docs (helmet, limiter).

---

## 7. AKSESIBILITAS (A11Y) — butir 906–960

- [ ] **906 [P0]** — Semua kontrol punya `<label>` tersambung (`for`/`id`) — bukan placeholder saja.
- [ ] **907 [P0]** — `lang="id"` (sudah jadi di SEO).
- [ ] **908 [P1]** — Karakter simbol ikon diberi `aria-hidden="true"` + `aria-label` di elemen interaktif.
- [ ] **909 [P1]** — Tombol icon edit/delete: `aria-label="Ubah rencana"` / "Hapus rencana".
- [ ] **910 [P1]** — Checkbox todo: role checkbox + label (nama todo) — focusable.
- [ ] **911 [P1]** — Navigasi keyboard penuh: Tab order natural; Enter/Space pada tombol.
- [ ] **912 [P1]** — Focus ring terlihat jelas (2px kontras + offset).
- [ ] **913 [P1]** — Modal konfirmasi: focus trap + `role="dialog"` + `aria-modal` + Esc close.
- [ ] **914 [P1]** — Toast/error: `role="alert"` / `role="status"` — announce SR.
- [ ] **915 [P1]** — Empty state: teks dengan `aria-label` — tetap terbaca.
- [ ] **916 [P1]** — Filter/search status diumumkan (`aria-live="polite"` count result).
- [ ] **917 [P1]** — Kontras WCAG AA (4.5:1) di semua teks & kontrol.
- [ ] **918 [P1]** — Jangan warna sebagai satu-satunya sinyal status (sertakan teks/ikon).
- [ ] **919 [P1]** — `prefers-reduced-motion` — matikan animasi; tanpa layering motion.
- [ ] **920 [P1]** — `prefers-reduced-transparency` — demote blur → surface solid.
- [ ] **921 [P1]** — Target sentuh ≥44×44 (mobile/touch).
- [ ] **922 [P1]** — Form error: teks terhubung via `aria-describedby`.
- [ ] **923 [P1]** — Form input required: `required` + pesan.
- [ ] **924 [P1]** — Semua gambar dekoratif `alt=""`.
- [ ] **925 [P1]** — Semantik heading skema (h1→h2→p).
- [ ] **926 [P1]** — Skip link "Lewati ke konten" di awal body.
- [ ] **927 [P1]** — Header `<nav>` dengan label bila ada menu.
- [ ] **928 [P1]** — Footer tidak menahan (a11y landmark).
- [ ] **929 [P1]** — Tombol aksi: gunakan `<button>` (bukan `<a>` tanpa href) — submit concern.
- [ ] **930 [P1]** — Link ke add menggunakan `<a href="/add-todo">` (crawlable + keyboard).
- [ ] **931 [P1]** — Ulangi konten tersembunyi: gunakan `.visually-hidden` bila perlu.
- [ ] **932 [P1]** — Toast score jelas: role + life.
- [ ] **933 [P1]** — `<html>` font accessible; zoom 200% tetap layak.
- [ ] **934 [P1]** — Kontras pada focus/active/hover.
- [ ] **935 [P1]** — Input placeholder bukan ganti label.
- [ ] **936 [P1]** — Autocomplete (search) — tidak perlu.
- [ ] **937 [P1]** — Ulangi fokus ke form saat error di submit.
- [ ] **938 [P1]** — Tidak merahjadi merah pada op-error (teks+ikon).
- [ ] **939 [P1]** — `aria-current` pada chip filter aktif.
- [ ] **940 [P1]** — Live region untuk "2 tersisa" update.
- [ ] **941 [P1]** — Modal scroll lock body.
- [ ] **942 [P1]** — Delete confirm: fokus pindah ke tombol Batal.
- [ ] **943 [P1]** — Desktop & mobile keyboard/screens sizes.
- [ ] **944 [P1]** — Form add/edit — submit via Enter (native).
- [ ] **945 [P1]** — High contrast mode (Windows HC) — pakai token + surface pattern.
- [ ] **946 [P1]** — Dark mode contrast juga AA.
- [ ] **947 [P1]** — Nama aria tombol tidak abbreviated only.
- [ ] **948 [P1]** — Announce perubahan saat edit di halaman kedua — natural.
- [ ] **949 [P1]** — Jangan fokus hijau jika tidak fokus — selalu ring.
- [ ] **950 [P1]** — Pastikan semua elemen interaktif dapat dijangkau keyboard (no display:none on focus target).
- [ ] **951 [P1]** — Toast tidak mengganggu pembacaan SR.
- [ ] **952 [P1]** — Pilih perangkat: screenreader test basic (NVDA/ORCA).
- [ ] **953 [P1]** — Jangan auto-advance animasi tanpa kontrol.
- [ ] **954 [P1]** — `aria-label` konsisten pada nav & aksi berulang.
- [ ] **955 [P1]** — Status chip punya teks label (bukan dot warna saja).
- [ ] **956 [P1]** — Empty state tidak kosong secara a11y (bukan gambar only).
- [ ] **957 [P1]** — Langkah focus movement clean.
- [ ] **958 [P1]** — Font size min 14px di UI.
- [ ] **959 [P1]** — Tidak ada emphasis UPPERCASE untuk teks panjang (kecuali label tombol).
- [ ] **960 [P1]** — Audit aksesibilitas (axe) di CI — target 0 critical (P2).

---

## 8. TESTING & QUALITY — butir 961–1005

- [ ] **961 [P0]** — Sediakan minimal **1 test** untuk service todo (CRUD + persist) — short-circuit regresi.
- [ ] **962 [P1]** — Unit test `todo.service` (sort, find, filter, persist).
- [ ] **963 [P1]** — Unit test validator helper (required, maxLength).
- [ ] **964 [P1]** — Integration test route `/` (GET 200, render HTML).
- [ ] **965 [P1]** — Integration: POST / (tambah), redirect + data tersimpan.
- [ ] **966 [P1]** — Integration: PUT /:id ubah nama, response.
- [ ] **967 [P1]** — Integration: DELETE /:id menghapus.
- [ ] **968 [P1]** — Test edge: input kosong → error; id invalid → 404/redirect.
- [ ] **969 [P1]** — Test data corrupt → recovery to default.
- [ ] **970 [P1]** — Test 404 route.
- [ ] **971 [P1]** — Test helper `render` mengembalikan 200.
- [ ] **972 [P1]** — Snapshot kecil markup? — rapuh; skip.
- [ ] **973 [P1]** — Test framework: **Vitest** (ringan) atau `node:test` bawaan — tanpa jurang berlebih.
- [ ] **974 [P1]** — Test di CI (untuk itics flow).
- [ ] **975 [P1]** — Coverage target 80% pada service — P2.
- [ ] **976 [P1]** — Test warna? — lint.
- [ ] **977 [P1]** — E2E happy path via curl / supertest.
- [ ] **978 [P1]** — Test responsive via Playwright (P2) — screenshot breakpoint.
- [ ] **979 [P1]** — A11y scan axe sekali — P2.
- [ ] **980 [P1]** — Lihat Lighthouse budget CI — P2.
- [ ] **981 [P1]** — Smoke test prod (health + index) — P1 saat deploy.
- [ ] **982 [P1]** — Tambah `pretest` typecheck.
- [ ] **983 [P1]** — Utils test kecil: flash parse — skip.
- [ ] **984 [P1]** — Cek velocidade mutasi serial.
- [ ] **985 [P1]** — Test stale file? Flush.
- [ ] **986 [P1]** — Test max limit (1000) — guard.
- [ ] **987 [P1]** — Test XSS escaped (input `<script>` tersimpan sebagai teks).
- [ ] **988 [P1]** — Test Unicode (emoji) input.
- [ ] **989 [P1]** — Test long name (201 char) rejected.
- [ ] **990 [P1]** — Test duplicate name OK.
- [ ] **991 [P1]** — Test empty todos state render.
- [ ] **992 [P1]** — Test sort behavior.
- [ ] **993 [P1]** — Test toggle complete.
- [ ] **994 [P1]** — Scaffold: `pnpm test` adil.
- [ ] **995 [P1]** — Deterministic data path di test (tmp dir).
- [ ] **996 [P1]** — Cleanup test file tak.

### 8.1 Lint & Format (Biome) — 1017–1025

- [ ] **997 [P0]** — Migrasi ESLint → **Biome**: `biome.json` dengan config TS.
- [ ] **998 [P0]** — Script: `lint` = `biome check`; `format` = `biome format --write`.
- [ ] **999 [P1]** — enable `organizeImports` (sort import auto).
- [ ] **1000 [P1]** — Aktifkan rule recommended + `noExplicitAny` (fix semua).
- [ ] **1001 [P1]** — `useSortedClasses` bila CSS-in-JS — tidak.
- [ ] **1002 [P1]** — Lint-staged: `biome check --write --staged`.
- [ ] **1003 [P1]** — Integrasi editor (VSCode extension) — api.
- [ ] **1004 [P1]** — Format pada commit otomatis.
- [ ] **1005 [P1]** — Tidak ada konflik prettier/eslint — satu tool (Biome).

---

## 9. PROJECT / DX / DEVOPS — butir 1006–1050

- [ ] **1006 [P0]** — Tulis `README.md`: deskripsi, setup (`pnpm install`, `pnpm dev`), struktur, scripts, data lokasi.
- [ ] **1007 [P0]** — Hapus env setelah kehadiran local data; dokumentasi port.
- [ ] **1008 [P1]** — `.gitignore`: tambah `data/`, hapus pengecualian env? (Biarkan).
- [ ] **1009 [P1]** — Build script cross-platform (`rm -rf` di Windows gagal) → gunakan `rimraf` (dev) OR `pnpm dlx rimraf`? — perbaiki.
- [ ] **1010 [P1]** — Script dev: `nodemon src/index.ts` tanpa NODE_ENV paksa.
- [ ] **1011 [P1]** — Set `"type": "module"`? tetapkan CJS (biar stabil) — dokumentasikan.
- [ ] **1012 [P1]** — Node engines: `"node": ">=20"`.
- [ ] **1013 [P1]** — Package manager field: `pnpm@>=9`.
- [ ] **1014 [P1]** — Hapus `.npmrc` bila tak digunakan.
- [ ] **1015 [P1]** — Update `.prettierignore` → hapus (Biome handles); padahal file masih boleh.
- [ ] **1016 [P1]** — Docker: lokal tak perlu (hapus) atau buat `Dockerfile` single-stage sederhana bila deploy — P2.
- [ ] **1017 [P1]** — PM2 ecosystem bila prod — P2.
- [ ] **1018 [P1]** — Deploy target: VPS/Railway/Fly — dokumentasi.
- [ ] **1019 [P1]** — Health endpoint dipakai untuk uptime check.
- [ ] **1020 [P1]** — CI GitHub Actions: lint+build+test.
- [ ] **1021 [P1]** — CD optional (workspace deploy).
- [ ] **1022 [P1]** — Versioning `0.2.0`.
- [ ] **1023 [P1]** — Changelog sederhana.
- [ ] **1024 [P1]** — GitHub metrics? Tidak.
- [ ] **1025 [P1]** — Editorconfig konsisten (ada).
- [ ] **1026 [P1]** — `eslintrc/prettier` files dihapus — bersih.
- [ ] **1027 [P1]** — Docs: arsitektur data (JSON local) — sekilas di README.
- [ ] **1028 [P1]** — Ke mana upgrade ketika butuh multi-user → imbuhan dokumentasi.
- [ ] **1029 [P1]** — Backup data: copy `data/todos.json` ke manual.
- [ ] **1030 [P1]** — Export/Import sebagai JSON (fitur P2: tombol unduh/unggah).
- [ ] **1031 [P1]** — Git tags semver.
- [ ] **1032 [P1]** — CI pin pnpm version.
- [ ] **1033 [P1]** — Lockfile commited — ya.
- [ ] **1034 [P1]** — Audit dependencies rutin.
- [ ] **1035 [P1]** — Checklist PR kecil (format + test).
- [ ] **1036 [P1]** — VSCode settings: `format on save` pakai biome — P2.
- [ ] **1037 [P1]** — Kontribusi: CONTRIBUTING brief bila publik.
- [ ] **1038 [P1]** — License Apache sudah.
- [ ] **1039 [P1]** — Monitoring up (uptime check) — P2.
- [ ] **1040 [P1]** — Manual deploy script (opsional).
- [ ] **1041 [P1]** — Time zone default lokal.
- [ ] **1042 [P1]** — Adopt codegen? Tidak.
- [ ] **1043 [P1]** — Refactor documentasi singkat penting.
- [ ] **1044 [P1]** — Performance test deployment — P2.
- [ ] **1045 [P1]** — Storage path custom via `DATA_PATH` env — dokumentasi.
- [ ] **1046 [P1]** — Semua app local — privasi penuh (POI selling point).
- [ ] **1047 [P1]** — Hapus sisa `express-ts-starter` branding dari README — ganti todo-app.
- [ ] **1048 [P1]** — `pnpm build` verifikasi outDir.
- [ ] **1049 [P1]** — `.editorconfig` charset/lf.
- [ ] **1050 [P1]** — Jalankan audit penuh setelah refactor & catat item yang fix.

---

## RINGKASAN EKSEKUSI (fase 1 — sudah/belum)

| Kategori | Butir | P0 |
|---|---|---|
| UI/UX Redesign | 1–460 (460) | 30 |
| SEO | 461–555 (95) | 3 |
| Performance | 556–660 (105) | 3 |
| Best Practice | 661–750 (90) | 2 |
| Efficiency & Refactor | 751–840 (90) | 2 |
| Keamanan | 841–905 (65) | 1 |
| Aksesibilitas | 906–960 (55) | 2 |
| Testing & Quality | 961–1005 (45) | 3 |
| Project/DX/DevOps | 1006–1050 (45) | 2 |

**Total butir: 1.050.**

> Catatan akhir: tabel ringkasan di atas adalah titik masuk. Saat mengambil keputusan untuk implementasi, mulai dari baris ber-**[P0]**, kemudian P1 sesuai phase. Status checklist `[x]` diperbarui tiap selesai satu poin.