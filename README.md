# Finora IV · Bersama Elaina

Web app keuangan Pribadi/Bisnis dengan identitas navy, ivory, lavender, dan Elaina dari referensi PDF. Versi IV mempertahankan pencatatan, modal, HPP, utang/piutang, kalender, laporan, backup, serta onboarding cukup nama; memperluas interaksi dan alat bantu harian.

## Mulai

Node.js **22.18+** disarankan agar aplikasi dan seluruh tes berjalan pada runtime yang sama.

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000`. Untuk produksi:

```bash
npm run build
npm start
```

Project Next.js ini dapat diimpor ke Vercel. Belum dipublikasikan. Service worker/PWA membutuhkan HTTPS di luar localhost.

## Preview interaktif tanpa instalasi

Buka **Finora_Preview.html** di browser biasa. Tunggu splash, masukkan nama, lalu jelajahi aplikasi. Pilih menu kecil **PREVIEW · LOKAL → Isi data contoh** untuk mengeksplorasi dashboard dengan angka contoh. Data contoh bukan data pengguna.

Preview memiliki database terpisah, animasi, formulir transaksi, pintasan, Agent lokal, memori, sumber jawaban, dan simulasi yang berfungsi. Gemini dan pembacaan gambar membutuhkan route server dalam source Next.js. Preview tidak mengirim API key ke layanan AI.

Buat ulang HTML:

```bash
npm run preview:html
```

Hasil ditulis di direktori induk project. Semua bitmap, font, CSS, dan JavaScript disertakan. Ukuran sekitar 4 MB. Blob gambar karakter dibagikan antar komponen agar tidak berulang dalam bundle.

## Yang baru

- **Elaina hidup:** kedipan mata, gerak napas, anggukan saat disapa, cahaya kecil, sapaan sesuai waktu dan nama, serta respons setelah pencatatan manual. Animasi karakter berhenti di luar layar atau saat tab tidak aktif. Aset WebP seluruhnya sekitar 565 KB.
- **Suasana pribadi:** intensitas animasi, sapaan, tema mengikuti waktu, menyembunyikan saldo Home, tulisan lebih besar, dan putar ulang splash. Reduced motion perangkat dihormati.
- **Pencatatan cepat:** nominal berformat Rupiah, pintasan favorit, ulangi transaksi, peringatan duplikat, serta urungkan tambah/ubah/hapus transaksi manual selama 15 detik. Pintasan selalu membuka draf yang bisa diperiksa.
- **Bukti menjadi draf:** lampirkan JPG/PNG/WebP lalu pilih Baca dengan Gemini. Gambar dikecilkan sampai sisi terpanjang 1280 px dan dikompresi sebelum dikirim. Hasil mengisi form; penyimpanan menunggu tombol Simpan. Nominal/tanggal/kategori tetap perlu diperiksa.
- **Ruang Agent:** empat tab—Ringkasan, Obrolan, Simulasi, Memori. Temuan batas pengeluaran, perubahan pengeluaran, arus kas negatif, target, tenggat, dan dugaan duplikat memiliki dasar perhitungan. Temuan tersimpan dengan identitas yang konsisten dan dapat ditandai selesai.
- **Agent lokal:** ringkasan, pencarian, kategori pengeluaran, perbandingan tanggal setara, sapaan, dan satu transaksi sederhana berjalan tanpa API. Contoh: `Catat beli makan 25 ribu`, `Ringkas bulan ini`, `Cari kopi`, `Bandingkan bulan lalu`.
- **Agent Gemini:** membaca konteks aktif, meminta maksimal tiga alat baca lokal, lalu menyusun jawaban. Maksimal dua permintaan provider per pertanyaan. Ada langkah proses, sumber catatan, penghentian permintaan, dan rencana tindakan sebelum konfirmasi.
- **Memori yang kamu kendalikan:** tambah, ubah, hapus preferensi; kalimat `Ingat saya ingin jawaban singkat` membuka konfirmasi. Memori yang relevan digunakan saat meminta jawaban Gemini. Riwayat obrolan maksimal 80 pesan per konteks; 40 terbaru ditampilkan.
- **Simulasi:** ubah pemasukan/omzet, pengeluaran/biaya, asumsi HPP, dan jangka waktu. Grafik membandingkan saldo dasar dengan skenario. Semua perhitungan lokal; tidak menulis transaksi.

## Data dan aturan keuangan

IndexedDB/Dexie menyimpan data pada perangkat. Database versi lama dinaikkan otomatis dengan tabel baru tanpa membuang catatan. Backup schema 1 tetap dapat dipulihkan; backup schema 2 menyertakan pintasan, memori, dan obrolan. Pemulihan divalidasi sebelum penggantian data secara atomik. Profil dan pengaturan tampilan disimpan terpisah di browser.

Konteks Pribadi dan Bisnis terpisah. Modal menambah kas bisnis, bukan omzet/laba. HPP mengurangi kas dan laba. Pembayaran utang/piutang memperbarui kewajiban; arus kas dicatat terpisah. Home dan perbandingan Agent memakai bulan berjalan sampai hari ini; laporan dapat memakai seluruh rentang pilihan. Simulasi memakai angka dasar yang dapat disesuaikan dan arus kas bulanan tetap.

Rencana Agent tidak menulis sampai dikonfirmasi. Saat konfirmasi, aplikasi memvalidasi ulang data di dalam transaksi database, menolak perubahan sumber yang sudah kedaluwarsa, pembayaran berlebih, dan pengulangan tindakan yang sama. Urungkan transaksi manual juga menolak penimpaan atas catatan yang berubah setelah tindakan sebelumnya.

Simpan backup sebelum menghapus data browser. Offline tersedia setelah shell dan aset berhasil dimuat online. Modul ekspor PDF/XLSX harus pernah dimuat agar ekspor tersebut tersedia offline. Tidak ada sinkronisasi akun atau server penyimpanan keuangan.

## Koneksi Gemini dan penggunaan kuota

Atur kunci melalui **Lainnya → Pengaturan AI** pada aplikasi Next.js. Tidak ada API key pengguna dalam source atau backup. Kunci tersimpan pada profil browser dan dikirim sementara melalui `/api/agent` ke Google untuk permintaan yang kamu jalankan. Default model `gemini-3.5-flash-lite`. Ketersediaan model mengikuti akun provider.

Tidak ada polling AI latar belakang. Perhitungan, temuan, simpan data, pencarian lokal, animasi, dan simulasi tidak menghabiskan token. Gateway membatasi ukuran payload, 10 permintaan per IP per menit per instance, dan waktu tunggu 25 detik. Pembatasan ini bersifat per instance, bukan pembatas kuota global lintas deployment. Tombol Hentikan membatalkan penantian browser; provider mungkin sudah memproses permintaan.

**Gemini live belum diuji pada rilis ini.** Orkestrasi dua tahap, kompresi gambar, dan pengisian draf diuji dengan respons terkontrol. Tidak ada kuota Gemini pengguna yang digunakan. Ketepatan ekstraksi struk dan jawaban model perlu diperiksa pada bukti nyata.

Referensi integrasi: [Google generateContent](https://ai.google.dev/api/generate-content), [structured output](https://ai.google.dev/gemini-api/docs/structured-output), [image understanding](https://ai.google.dev/gemini-api/docs/image-understanding).

## Validasi

```bash
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Tes browser menjalankan server produksi lokal pada port 3000 dengan profil browser terisolasi. Build lebih dahulu. Untuk binary Chromium yang sudah tersedia: `BROWSER_PATH=/path/to/chromium npm run test:browser`.

Hasil 2 Oktober 2026: **10 tes logika dan 20 pemeriksaan browser lulus**, build produksi/TypeScript lulus, tanpa runtime page error dalam alur yang diuji. Viewport 320, 390, dan 1440 px diperiksa. Ringkasan pengujian ada di `docs/QA.md`; hasil terstruktur ada di `docs/browser-results.json`.

Uji tersebut dijalankan di Chromium. Belum diuji langsung di Safari iPhone, perangkat Android kelas bawah, atau seluruh kemungkinan input. Tidak ada klaim benchmark FPS atau akurasi AI live. Rincian asal aset dan pengolahannya ada di `docs/ASSETS.md`.
