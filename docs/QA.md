# Verifikasi Finora IV

Tanggal: 2 Oktober 2026. Browser: Chromium desktop/headless, viewport 320×740, 390×844, 1440×960. Seluruh data pemeriksaan adalah fixture dalam profil browser terisolasi.

## Hasil

- Build produksi Next.js dan pemeriksaan TypeScript: lulus.
- 10 tes logika: lulus. Mencakup saldo/modal/HPP, periode, kewajiban, parser Rupiah, pembatasan konteks alat, identitas temuan, simulasi, commit ulang/stale/overpayment, undo, backup lama dan restore yang rusak.
- 20 pemeriksaan browser: lulus; rincian persis di `browser-results.json`.
- Tidak ditemukan runtime page error pada alur tersebut.
- Tidak ada horizontal overflow pada layar yang diperiksa.

Alur browser meliputi onboarding nama, sapaan Elaina, tambah/favorit/undo, pintasan, peringatan duplikat, hapus/undo, Agent prepare/cancel/confirm, sumber jawaban, memori CRUD, simulasi tanpa write, pemisahan konteks, mode hemat gerak, offline reload, dan HTML portable.

## Batas pengujian AI

Panggilan AI dalam tes browser diintersep dengan respons fixture. Tes memeriksa bahwa gambar dikompresi dan hanya dikirim setelah tombol ditekan, hasil OCR tetap berupa draf, alat baca menggunakan konteks yang benar, dan proses Agent berhenti setelah maksimal dua panggilan. Ini tidak menguji ketepatan OCR, kualitas model, validitas API key, atau layanan Gemini live. Kuota pengguna tidak digunakan.

## Menjalankan kembali

`npm ci`, `npm test`, `npm run build`, `npx playwright install chromium`, kemudian `npm run test:browser`. Port 3000 harus kosong. Artefak pengujian ditulis ke `tmp/v4`; direktori tersebut tidak disertakan dalam paket source.

Safari/iOS, Android fisik, sinkronisasi lintas perangkat, dan pengukuran FPS/performa perangkat rendah belum diuji. Offline memerlukan kunjungan online awal. Simulasi menggunakan asumsi tetap yang dijelaskan di antarmuka.
