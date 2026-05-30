# 🥛 YogurtTrack — Logbook Proyek Yogurt

> Platform logbook digital untuk pemantauan proyek fermentasi yogurt siswa, berbasis indikator ilmiah dengan evaluasi otomatis.

---

## 📋 Daftar Isi

- [Tentang Aplikasi](#-tentang-aplikasi)
- [Teknologi](#-teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Setup & Instalasi](#-setup--instalasi)
- [Variabel Lingkungan](#-variabel-lingkungan)
- [Fitur](#-fitur)
- [Changelog Update Terbaru](#-changelog-update-terbaru)
- [Deployment](#-deployment)

---

## 🧪 Tentang Aplikasi

**YogurtTrack** adalah aplikasi logbook digital berbasis web yang dirancang untuk mendukung proyek fermentasi yogurt di lingkungan sekolah. Aplikasi ini memungkinkan:

- **Siswa** mengisi pengamatan bertahap (formulasi, produksi, jam ke-8, jam ke-12 final)
- **Guru** memantau progress seluruh kelompok secara real-time dari dashboard terpusat
- Evaluasi otomatis berdasarkan parameter ilmiah (warna, aroma, tekstur, rasa, pH)

---

## ⚙️ Teknologi

| Layer | Teknologi |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 7 |
| Routing | React Router DOM v6 |
| Database & Auth | Supabase (PostgreSQL) |
| Icons | Lucide React |
| Export | html2canvas |
| Password Hashing | bcryptjs |
| Styling | Vanilla CSS (yogurt.css + yogurt-extra.css) |

---

## 📁 Struktur Proyek

```
yogurt_logbook/
├── src/
│   ├── components/
│   │   ├── StageForm.tsx       # Form pengisian tiap tahap (1–4)
│   │   ├── StageView.tsx       # Tampilan readonly data tahap
│   │   ├── Lightbox.tsx        # Modal preview foto (zoom in/out)
│   │   ├── EvaluationCard.tsx  # Kartu hasil evaluasi ilmiah
│   │   └── ...
│   ├── pages/
│   │   ├── Login.tsx           # Halaman login (siswa & guru)
│   │   ├── StudentDashboard.tsx   # Dashboard siswa (multi-tahap)
│   │   ├── TeacherDashboard.tsx   # Dashboard guru (semua kelompok)
│   │   └── StudentDetail.tsx   # Detail logbook siswa (view guru)
│   ├── services/
│   │   └── evaluator.ts        # Logika evaluasi parameter yogurt
│   ├── utils/
│   │   ├── supabase.ts         # Supabase client
│   │   └── imageCompressor.ts  # Kompresi gambar client-side
│   ├── yogurt.css              # Design system utama
│   └── yogurt-extra.css        # Style tambahan & komponen
├── .env                        # Konfigurasi Supabase (tidak di-commit)
├── .env.example                # Template variabel lingkungan
├── vercel.json                 # Konfigurasi deployment Vercel
└── vite.config.ts
```

---

## 🚀 Setup & Instalasi

### Prasyarat

- Node.js v18+
- npm v9+
- Akun Supabase (gratis)

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone <repo-url>
cd yogurt_logbook

# 2. Install dependensi
npm install

# 3. Buat file .env (salin dari template)
copy .env.example .env
# Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY

# 4. Jalankan dev server
npm run dev

# 5. Buka browser
# http://localhost:5173
```

### Build Produksi

```bash
npm run build
# Output tersedia di folder /dist
```

---

## 🔑 Variabel Lingkungan

Buat file `.env` di root proyek dengan isi berikut:

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<key>
```

> ⚠️ Jangan pernah commit file `.env` ke repositori publik. File ini sudah ditambahkan ke `.gitignore`.

---

## ✨ Fitur

### 👨‍🎓 Dashboard Siswa

- **Tahap 1 — Formulasi:** Input kelompok, ekstrak, komposisi bahan, foto bahan
- **Tahap 2 — Hari Produksi:** Catat proses pembuatan, prediksi keberhasilan, pengamatan jam ke-0
- **Tahap 3 — Pengamatan Jam ke-8:** Warna, aroma, tekstur, rasa, foto
- **Tahap 4 — Pengamatan Final (Jam ke-12):** Pengukuran pH akhir, foto kertas lakmus, kesimpulan awal
- Progress tracker visual antar tahap
- Validasi form dengan highlight field yang belum diisi

### 👩‍🏫 Dashboard Guru

- Daftar seluruh kelompok siswa dan status tahap mereka
- Klik detail kelompok untuk melihat seluruh logbook
- Rekap tabel pengamatan organoleptik (warna, aroma, rasa, tekstur)
- Evaluasi otomatis: indikator keberhasilan fermentasi
- Reset data pengamatan per tahap
- Export laporan (html2canvas)

### 🔬 Evaluasi Otomatis

Evaluasi berbasis indikator ilmiah pada `evaluator.ts`:

| Parameter | Indikator Normal |
|-----------|-----------------|
| **Warna** | Putih, krem, atau warna sesuai ekstrak buah |
| **Aroma** | Asam segar, khas yogurt, aroma buah (termasuk "segar") |
| **Tekstur** | Kental, semi-padat |
| **Rasa** | Asam manis, khas yogurt |
| **pH** | Diukur manual, dinilai dari hasil kertas lakmus |

---

## 📝 Changelog Update Terbaru

### v1.1.0 — Mei 2026

#### 🗄️ Integrasi Supabase
- Menambahkan `@supabase/supabase-js` sebagai dependensi
- Membuat `src/utils/supabase.ts` — client Supabase terpusat
- Menghubungkan seluruh operasi data (baca/tulis) ke Supabase
- Memperbaiki bug: murid tidak muncul di dashboard guru karena koneksi database belum terkonfigurasi

#### 🖼️ Kompresi Gambar Client-Side
- **File baru:** `src/utils/imageCompressor.ts`
- Mengompresi gambar sebelum disimpan ke database menggunakan HTML5 Canvas API
- Spesifikasi kompresi:
  - Maksimal dimensi: **800 × 800 px** (mempertahankan rasio aspek)
  - Format output: **JPEG** dengan kualitas **0.7**
  - Fallback otomatis ke file asli jika kompresi gagal
- Batas upload dinaikkan dari **5 MB → 15 MB** (foto HP modern tetap bisa diupload, lalu dikompresi)
- Integrasi di semua field upload foto pada `StageForm.tsx`

#### 🐛 Bug Fix: Evaluasi Aroma "Segar"
- **File:** `src/services/evaluator.ts`
- Aroma **"segar"** sebelumnya dievaluasi sebagai *tidak normal* (salah)
- Diperbaiki: menambahkan `'segar'` ke daftar keyword positif di fungsi `resolveAromaNormal`
- Aroma seperti "asam segar", "segar", "susu segar" kini dievaluasi dengan benar sebagai normal

#### 🔍 Redesign Lightbox Preview Foto
- **File:** `src/components/Lightbox.tsx`, `src/yogurt-extra.css`
- Mengganti tombol emoji (`🔍-` / `🔍+` / `❌`) dengan **SVG icon** yang bersih dan konsisten
- Desain tombol zoom dikelompokkan dalam pill transparan
- Close button (`✕`) dengan animasi rotasi 90° saat hover
- Warna modal sepenuhnya menyesuaikan background app (dark navy `#0a0f1d`)
- Menghapus CSS lightbox duplikat di `index.css` yang menyebabkan konflik warna (toolbar hitam berbeda, area gambar solid `#000`, caption bergaris)
- Keyboard shortcut: `Esc` tutup, `+` zoom in, `-` zoom out, `0` reset
- Scroll mouse untuk zoom

#### 🏷️ Fix Label Tombol Submit Tahap 4
- **File:** `src/components/StageForm.tsx`
- Tombol submit pada Tahap 4 sebelumnya salah menampilkan **"Simpan Pengamatan Jam ke-8"**
- Diperbaiki: Tahap 4 menampilkan **"Selesai & Lihat Hasil"** (dengan icon centang)

#### 🔒 Hapus Hint pH untuk Anti-Curang
- **File:** `src/components/StageForm.tsx`
- Menghapus fungsi `getPhHint()` yang menampilkan hint real-time saat siswa mengetik nilai pH
- Sebelumnya: muncul pesan seperti *"✔️ pH optimal yogurt berhasil (3,8–4,5)"* yang bisa dimanfaatkan siswa untuk memasukkan angka pH yang "benar" tanpa benar-benar mengukur
- Sekarang: input pH bersih tanpa petunjuk rentang nilai

---

## 🌐 Deployment

### Vercel (Rekomendasi)

Lihat panduan lengkap di [`Vercel_DEPLOY.md`](./Vercel_DEPLOY.md).

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Pastikan environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) sudah diisi di dashboard Vercel.

### Ngrok (Akses Lokal via Internet)

Lihat panduan di [`NGROK_SETUP.md`](./NGROK_SETUP.md) untuk mengekspos dev server lokal ke internet.

---

## 📜 Lisensi

Proyek ini dikembangkan untuk keperluan pendidikan. Hak cipta © 2026.
