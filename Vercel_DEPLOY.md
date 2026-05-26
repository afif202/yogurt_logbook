# Deploy ke Vercel

Panduan singkat untuk mendeploy proyek Vite + React ini ke Vercel.

1. Hubungkan repo ke Vercel
    - Login ke https://vercel.com dan buat project baru dengan menghubungkan repository GitHub.

2. Pengaturan build (recommended)
    - Saya menghapus `vercel.json` dari repo supaya Vercel menggunakan Project Settings di dashboard (menghindari peringatan `builds` yang mengabaikan dashboard settings).
    - Di dashboard Vercel → Project → Settings → Build & Development Settings set:
        - **Build Command**: `npm run build`
        - **Output Directory**: `public/build`

3. Environment Variables (penting)
    - Proyek ini menggunakan Supabase dan membaca variabel build-time dengan prefix `VITE_`.
    - Tambahkan variabel berikut di Settings → Environment Variables pada Vercel (Production + Preview jika perlu):
        - `VITE_SUPABASE_URL` = <your-supabase-url>
        - `VITE_SUPABASE_PUBLISHABLE_KEY` = <your-supabase-anon-or-publishable-key>

4. Cara preview build lokal

```
npm install
npm run build
npm run preview
```

5. Mengatasi warning yang Anda lihat
    - WARNING tentang `builds` muncul karena adanya `builds` di `vercel.json`. Menghapus `vercel.json` membuat Vercel pakai pengaturan di dashboard.
    - Peringatan chunk size: saya menambahkan `chunkSizeWarningLimit: 1024` di `vite.config.ts` untuk menonaktifkan peringatan ukuran chunk besar. Untuk perbaikan yang lebih baik, pertimbangkan code-splitting atau atur `build.rollupOptions.output.manualChunks`.

6. Redeploy
    - Setelah perubahan ini, lakukan Redeploy di Vercel dan centang opsi **Clear cache** agar Vercel meng-install dependensi dari commit terbaru.

Jika mau, saya bisa jalankan deploy via Vercel CLI (butuh token Anda) atau pandu langkah Redeploy di dashboard.
