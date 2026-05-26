# Deploy ke Vercel

Panduan singkat untuk mendeploy proyek Vite + React ini ke Vercel.

1. Hubungkan repo ke Vercel
    - Login ke https://vercel.com dan buat project baru dengan menghubungkan repository GitHub.

2. Pengaturan build
    - Vercel akan menjalankan `npm run build` otomatis.
    - Output build Vite ada di folder `dist` (dikonfigurasi di `vercel.json`).

3. Environment Variables (penting)
    - Proyek ini menggunakan Supabase dan membaca variabel build-time dengan prefix `VITE_`.
    - Tambahkan variabel berikut di Settings > Environment Variables pada Vercel (Production + Preview jika perlu):
        - `VITE_SUPABASE_URL` = <your-supabase-url>
        - `VITE_SUPABASE_PUBLISHABLE_KEY` = <your-supabase-anon-or-publishable-key>

4. Cara preview build lokal

```
npm install
npm run build
npm run preview
```

5. Catatan
    - Pastikan `package.json` memiliki script `build` (proyek ini sudah ada: `tsc && vite build`).
    - Jika Anda memakai Secrets lain, tambahkan juga ke Environment Variables di Vercel.

Jika mau, saya bisa bantu menambahkan file `vercel.json` (sudah diperbarui) atau membuat skrip CLI untuk mengotomasi deploy lewat `vercel` CLI.
