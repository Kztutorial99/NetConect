# NetCon

Android app yang membaca notifikasi realtime dan meneruskan isinya ke Telegram Bot.

## Setup
1. Install APK (build dari GitHub Actions -> Artifacts).
2. Buka app, isi **Bot Token** & **Chat ID**, save.
3. Tekan **Buka Izin Notifikasi**, aktifkan NetCon.
4. Tekan **Kirim Test** untuk cek koneksi.

## Filter
Isi field filter dengan package name dipisah koma untuk membatasi sumber notifikasi. Kosongkan untuk semua app.

## Build
GitHub Actions otomatis build APK debug di setiap push ke `main`.
