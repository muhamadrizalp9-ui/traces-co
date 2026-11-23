# TRACES-CO (Tracking & Verification System for Social Assistance)

**TRACES-CO** adalah aplikasi web responsif (*mobile-first*) untuk **Sistem Verifikasi dan Pelacakan Distribusi Bantuan Sosial (Bansos) Sembako** berbasis **QR/Barcode dan GPS Tracking** dengan pencatatan riwayat audit (*Blockchain Ledger Log*).

Dirancang khusus dengan estetika antarmuka modern yang didominasi oleh **Biru Pemerintahan (*Government Navy/Blue*)** dan **Hijau Zamrud (*Emerald Green*)** untuk status terverifikasi resmi.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini bersifat **Zero-Dependency (Standalone)** sehingga Anda dapat langsung menjalankannya dengan dua cara:

### Cara 1: Langsung Buka di Browser (Paling Cepat)
Cukup klik dua kali (double click) file [`index.html`](file:///d:/pkm/kcbnsos/index.html) di File Explorer, atau buka melalui browser pilihan Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, dll).

### Cara 2: Menjalankan Local Web Server (Node.js)
Jika ingin menjalankan server lokal:
```bash
node server.js
```
Lalu buka browser di alamat: **`http://localhost:3000`**

---

## 👥 3 Peran Pengguna (Role Simulation)

Pengguna dapat langsung berpindah peran secara instan melalui bilah navigasi di bagian atas tanpa login rumit. Seluruh perubahan status tersinkronisasi secara otomatis melalui `localStorage`:

### 1. 🏛️ ROLE PEMERINTAH (Dashboard Pusat)
* **Ringkasan Metrik**: Statistik Total Paket, Dibuat, Di Kelurahan, Dalam Pengiriman, Selesai Terverifikasi, dan Laporan Masalah.
* **Form Registrasi Paket Baru**:
  - Input Nama Penerima, NIK 16 digit, Kelurahan Tujuan, Alamat, No. HP, dan Operator.
  - Komoditas sembako default: Beras Premium 5 kg, Minyak Goreng 1 Liter, Gula Pasir 1 kg (+ opsi komoditas tambahan seperti Sarden dan Mie Instan).
  - Otomatis membuat **ID Unik** (misal: `TRC-2026-JKT-106`), **QR Code**, **Barcode**, serta **Genesis Block Hash Audit Trail**.
* **Stiker Label & Barcode Resmi**: Modal cetak (*print-ready*) stiker kemasan bansos lengkap dengan rincian penerima, daftar sembako, dan segel hologram digital.
* **Tabel Monitoring Terintegrasi**: Filter berdasarkan kelurahan dan status distribusi, fitur pencarian cepat NIK/Nama, serta peninjau hash blockchain.
* **Blockchain Ledger Explorer**: Menampilkan transparansi rantai blok anti-manipulasi dari pembuatan hingga penerimaan.

---

### 2. 🏢 ROLE KELURAHAN (Admin Distribusi)
* **Scan QR/Barcode Paket Masuk**:
  - Klik tombol **"Scan Terima"** pada daftar kiriman dari Pusat untuk mengubah status menjadi **"Diterima Kelurahan"** dan mengaktifkan modul pelacakan GPS.
* **Penugasan Kurir / Armada Logistik**:
  - Tombol **"Kirim ke Alamat"** untuk menugaskan kurir lapangan (status berubah menjadi **"Dalam Pengiriman"**).
* **Peta Pelacakan GPS Real-Time (Telemetry HUD)**:
  - Visualisasi rute kurir dari Kantor Kelurahan menuju rumah penerima bantuan.
  - Panel Telemetri: Kecepatan kurir, jarak tersisa (meter), perkiraan waktu tiba (ETA), status satelit GPS, serta tombol simulasi pergerakan (**Maju +25%**, **Kurir Tiba di Rumah**, **Reset Posisi**).
* **Kotak Masuk Resolusi Aduan Warga**:
  - Menerima notifikasi langsung jika ada warga yang komplain.
  - Memeriksa foto bukti kendala barang, kategori masalah, dan tombol **"Tindak Lanjut & Selesaikan"** untuk mengganti paket.

---

### 3. 📱 ROLE PENERIMA BANTUAN (Aplikasi Mobile Penerima)
* **Tampilan Khusus Mobile**:
  - Tersedia tombol beralih antara **"📱 Tampilan HP Mockup"** (dengan frame bezel smartphone elegan) dan **"🖥️ Tampilan Lebar"**.
  - Dropdown **"Simulasi Akun"** untuk beralih profil warga (contoh: Ibu Siti Aminah, Bpk. Joko, Bpk. Hendra, dll).
* **Pelacakan Perjalanan Paket Real-Time**:
  - Alur timeline visual 4 langkah: *Didaftarkan di Dinsos* ➔ *Tiba di Posko Kelurahan* ➔ *Kurir Menuju Alamat* ➔ *Paket Diterima Warga*.
  - Mini-map pelacakan GPS langsung kurir yang bergerak ke arah rumah.
* **Tombol "Scan QR/Barcode Paket Diterima"**:
  - Memindai kardus bantuan saat kurir tiba untuk mengarahkan ke formulir verifikasi.
* **Halaman Verifikasi Isi Sembako**:
  - Menampilkan daftar rincian bantuan wajib (Beras 5 kg, Minyak 1L, Gula 1kg) lengkap dengan checklist kondisi segel.
  - **Dua Tombol Aksi Kritis**:
    1. **Tombol Hijau "Sesuai & Terima"**:
       - Membuka kanvas **Tanda Tangan Digital Warga** (dapat digores dengan sentuhan jari atau mouse).
       - Menghasilkan **Berita Acara Serah Terima (BAST Digital)** resmi bertanda tangan, stempel emerald terverifikasi, QR code validasi, dan efek konfeti kegembiraan.
    2. **Tombol Merah "Tidak Sesuai / Lapor"**:
       - Membuka form komplain kendala (pilihan: *Isi Kurang, Barang Rusak, Kemasan Bocor, Kadaluarsa, Timbangan Kurang*).
       - Melampirkan bukti foto otomatis dan catatan keluhan.
       - Status seketika berubah menjadi **"Bermasalah"** dan langsung memicu notifikasi peringatan di Dashboard Kelurahan & Pemerintah.

---

## 📦 Data Dummy Bawaan (Pre-loaded Demo)

1. **`TRC-2026-JKT-101` (Ibu Siti Aminah - Kel. Menteng)**:
   - Status: **Dalam Pengiriman (Live GPS Aktif)**.
   - Cocok untuk mendemokan pergerakan kurir dan proses verifikasi penerimaan.
2. **`TRC-2026-JKT-102` (Bpk. Joko Wahyono - Kel. Gambir)**:
   - Status: **Diterima Kelurahan**.
   - Cocok untuk mendemokan penugasan kurir pengantar.
3. **`TRC-2026-JKT-103` (Ibu Rusmini - Kel. Senen)**:
   - Status: **Dibuat**.
   - Cocok untuk mendemokan proses scan masuk di Kelurahan.
4. **`TRC-2026-JKT-104` (Bpk. Bambang Pamungkas - Kel. Cempaka Putih)**:
   - Status: **Selesai**.
   - Dilengkapi bukti Berita Acara Serah Terima (BAST Digital) dan tanda tangan tersimpan.
5. **`TRC-2026-JKT-105` (Bpk. Hendra Gunawan - Kel. Menteng)**:
   - Status: **Bermasalah**.
   - Contoh kasus kemasan minyak bocor dengan lampiran foto bukti di Resolution Center Kelurahan.

> 💡 **Tip:** Klik tombol **"🔄 Reset Demo"** di bagian atas kapan saja untuk mengembalikan seluruh paket ke kondisi awal simulasi.
