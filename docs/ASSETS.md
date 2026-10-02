# Aset dan pengolahan

ZIP yang diterima hanya berisi `svg-stars.png` dan `svg-constellation.png`. Enam aset canonical yang disebut dalam PRD tidak hadir sebagai file terpisah. Gambar embedded di PDF dipakai untuk memulihkan identitas visual, bukan mengganti dengan karakter generik.

| File | Sumber dan proses |
|---|---|
| public/art/bg-day.webp | Ilustrasi istana embedded pada halaman 7 PDF v3; diekstrak dan dikompresi WebP. |
| public/art/elaina-main.webp | Ilustrasi halaman 14 PDF; dibersihkan lewat built-in imagegen (transparent alpha), UI/angka/receipt dekoratif dihapus. Dikecilkan 780×1040 dan dikompresi. |
| public/art/elaina-avatar.webp | Crop wajah dari hasil pembersihan yang sama, 160 px. |
| public/art/brand-symbol.webp | Simbol kompas halaman 1 PDF; latar navy terhubung ke tepi dibuang, resize 360 px dan WebP. |
| public/art/star-ornament.webp | Crop dari `svg-stars.png` dalam ZIP, 130 px. |
| public/icon-192.png, icon-512.png | Simbol asli PDF pada latar navy dengan ruang aman ikon. |

Tidak ada file bg-night atau elaina-main asli terpisah dalam ZIP. Mode malam adalah derivasi pencahayaan CSS dari bg-day; Agent memakai ulang karakter bersih untuk menghemat unduhan. `svg-constellation.png` yang masih penuh artefak tidak dipaksakan ke antarmuka. Orbit splash dan beberapa titik bintang dibuat dengan CSS sederhana.

## Prompt pembersihan (built-in imagegen)

Use case: precise-object-edit / background-extraction. Edit target: supplied canonical Elaina artwork for Finora finance app. Preserve this exact silver-haired violet-eyed anime witch character, her friendly face, elaborate purple black witch hat, gold celestial compass details, outfit, pose, staff, floating blue globe, and watercolor/anime rendering. Remove ALL four floating rectangular UI/chart/text panels and loose financial paper receipts. Reconstruct the small obscured portions of character/dress naturally. Remove white background completely, deliver true alpha transparent background clean cutout, no white fringe, no checkerboard. Isolate character and her globe/staff only, with small gold ornaments. No text, no charts, no UI, no new character, no scenery. Preserve full hat and visible seated body framing. This is cleanup of the provided artwork, not a redesign.

Crop, alpha cleanup simbol, resize, dan kompresi dilakukan dengan Pillow; pengguna secara eksplisit meminta pengolahan tersebut. Semua bitmap final berada di public/art. Tidak ada generasi karakter alternatif.

## Tambahan versi IV: kedipan dan rig ringan

`public/art/elaina-blink.webp` adalah lapisan kecil untuk kedua mata tertutup. Built-in imagegen mengedit crop wajah dari karakter yang sama; bentuk wajah, rambut, warna, dan tekstur dipertahankan. Hasil disejajarkan kembali dengan sprite 780×1040, dipotong ke area mata, diberi alpha lembut, dan dikompresi. Gambar dasar tetap dibagikan oleh lapisan tubuh dan kepala; tidak ada video atau runtime animasi karakter tambahan.

Instruksi pengeditan: preserve this exact crop, facial geometry, hair, skin, colors and watercolor texture; change only both eyes to gently closed eyelids for one blink animation frame; maintain alignment and the same expression, with no new props or text.

Komponen `Companion.tsx` menggabungkan napas, sedikit gerak kepala, kedipan, anggukan, serta cahaya globe melalui CSS. IntersectionObserver dan visibilitychange menghentikan animasi rig ketika tidak terlihat. Konstelasi memakai garis SVG dengan fill dinonaktifkan; sinar latar dan titik bintang tetap dekoratif.
