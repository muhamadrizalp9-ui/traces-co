/**
 * TRACES-CO - Data Awal Simulasi Distribusi Bansos Sembako
 * Berisi data dummy penerima bansos dengan variasi status realistis
 */

const DEFAULT_PACKAGES = [
  {
    id: "TRC-2026-JKT-101",
    barcode: "TRC2026JKT101",
    penerima: {
      nama: "Ibu Siti Aminah",
      nik: "3171015504820002",
      noHp: "0812-9876-5432",
      kelurahan: "Menteng",
      alamat: "Jl. Surabaya No. 14, RT 03 / RW 05",
      kota: "Jakarta Pusat",
      lat: -6.1985,
      lng: 106.8402
    },
    items: [
      { nama: "Beras Premium", jumlah: "5 kg", checked: true },
      { nama: "Minyak Goreng Kemasan", jumlah: "1 Liter", checked: true },
      { nama: "Gula Pasir Kristal", jumlah: "1 kg", checked: true }
    ],
    status: "DALAM_PENGIRIMAN", // DIBUAT | DITERIMA_KELURAHAN | DALAM_PENGIRIMAN | SELESAI | BERMASALAH
    createdAt: "2026-11-23 08:30 WIB",
    updatedAt: "2026-11-23 10:45 WIB",
    kurir: {
      nama: "Hendra Setiawan",
      telepon: "0818-4455-6677",
      kendaraan: "Motor Logistik Bansos (B 4521 PSZ)",
      eta: "8 Menit",
      lat: -6.1965,
      lng: 106.8360
    },
    kelurahanAsal: {
      nama: "Kantor Kelurahan Menteng",
      alamat: "Jl. Pegangsaan Barat No. 1",
      lat: -6.1945,
      lng: 106.8315
    },
    laporan: null,
    tandaTerima: null,
    auditTrail: [
      {
        block: 1,
        waktu: "2026-11-23 08:30:12 WIB",
        aksi: "PAKET_DIBUAT",
        aktor: "Kemensos Pusat (Petugas: Bambang R.)",
        deskripsi: "Paket bansos berhasil didaftarkan dan ID QR di-generate.",
        hash: "0x8f2a1b9c7d4e3f20"
      },
      {
        block: 2,
        waktu: "2026-11-23 09:40:05 WIB",
        aksi: "SCAN_MASUK_KELURAHAN",
        aktor: "Kelurahan Menteng (Admin: Dewi L.)",
        deskripsi: "Paket fisik diterima di kantor kelurahan melalui scan QR.",
        hash: "0x4e7b9a2c1f8d3e50"
      },
      {
        block: 3,
        waktu: "2026-11-23 10:30:19 WIB",
        aksi: "DISPATCH_KURIR",
        aktor: "Kelurahan Menteng (Koordinator Lapangan)",
        deskripsi: "Paket dibawa kurir Hendra Setiawan menuju alamat penerima. GPS aktif.",
        hash: "0x1d5e8f3a9b2c7e40"
      }
    ]
  },
  {
    id: "TRC-2026-JKT-102",
    barcode: "TRC2026JKT102",
    penerima: {
      nama: "Bpk. Joko Wahyono",
      nik: "3171021208750004",
      noHp: "0856-1122-3344",
      kelurahan: "Gambir",
      alamat: "Jl. Veteran I No. 8, RT 01 / RW 02",
      kota: "Jakarta Pusat",
      lat: -6.1685,
      lng: 106.8285
    },
    items: [
      { nama: "Beras Premium", jumlah: "5 kg", checked: true },
      { nama: "Minyak Goreng Kemasan", jumlah: "1 Liter", checked: true },
      { nama: "Gula Pasir Kristal", jumlah: "1 kg", checked: true },
      { nama: "Sarden Saus Tomat", jumlah: "2 Kaleng", checked: true }
    ],
    status: "DITERIMA_KELURAHAN",
    createdAt: "2026-11-23 08:45 WIB",
    updatedAt: "2026-11-23 10:15 WIB",
    kurir: null,
    kelurahanAsal: {
      nama: "Kantor Kelurahan Gambir",
      alamat: "Jl. Kebon Sirih Timur",
      lat: -6.1750,
      lng: 106.8300
    },
    laporan: null,
    tandaTerima: null,
    auditTrail: [
      {
        block: 1,
        waktu: "2026-11-23 08:45:00 WIB",
        aksi: "PAKET_DIBUAT",
        aktor: "Kemensos Pusat (Petugas: Bambang R.)",
        deskripsi: "Paket terdaftar di sistem pusat.",
        hash: "0x9a3f2b8c1e7d4a60"
      },
      {
        block: 2,
        waktu: "2026-11-23 10:15:22 WIB",
        aksi: "SCAN_MASUK_KELURAHAN",
        aktor: "Kelurahan Gambir (Admin: Rahmat S.)",
        deskripsi: "Paket diterima di gudang distribusi kelurahan.",
        hash: "0x3c7e9a1b5f2d8e40"
      }
    ]
  },
  {
    id: "TRC-2026-JKT-103",
    barcode: "TRC2026JKT103",
    penerima: {
      nama: "Ibu Rusmini",
      nik: "3171034407890001",
      noHp: "0813-4455-6677",
      kelurahan: "Senen",
      alamat: "Jl. Kramat Pulo Gg. VI No. 22, RT 07 / RW 04",
      kota: "Jakarta Pusat",
      lat: -6.1895,
      lng: 106.8450
    },
    items: [
      { nama: "Beras Premium", jumlah: "5 kg", checked: true },
      { nama: "Minyak Goreng Kemasan", jumlah: "1 Liter", checked: true },
      { nama: "Gula Pasir Kristal", jumlah: "1 kg", checked: true }
    ],
    status: "DIBUAT",
    createdAt: "2026-11-23 09:10 WIB",
    updatedAt: "2026-11-23 09:10 WIB",
    kurir: null,
    kelurahanAsal: {
      nama: "Kantor Kelurahan Senen",
      alamat: "Jl. Salemba Tengah",
      lat: -6.1920,
      lng: 106.8480
    },
    laporan: null,
    tandaTerima: null,
    auditTrail: [
      {
        block: 1,
        waktu: "2026-11-23 09:10:04 WIB",
        aksi: "PAKET_DIBUAT",
        aktor: "Kemensos Pusat (Petugas: Bambang R.)",
        deskripsi: "Paket siap dikirim dari gudang logistik pusat ke Kelurahan Senen.",
        hash: "0x7d2e9b4a1c8f3a50"
      }
    ]
  },
  {
    id: "TRC-2026-JKT-104",
    barcode: "TRC2026JKT104",
    penerima: {
      nama: "Bpk. Bambang Pamungkas",
      nik: "3171041006800007",
      noHp: "0817-8899-0011",
      kelurahan: "Cempaka Putih",
      alamat: "Jl. Cempaka Putih Barat XIX No. 5, RT 04 / RW 08",
      kota: "Jakarta Pusat",
      lat: -6.1820,
      lng: 106.8650
    },
    items: [
      { nama: "Beras Premium", jumlah: "5 kg", checked: true },
      { nama: "Minyak Goreng Kemasan", jumlah: "1 Liter", checked: true },
      { nama: "Gula Pasir Kristal", jumlah: "1 kg", checked: true }
    ],
    status: "SELESAI",
    createdAt: "2026-11-23 07:00 WIB",
    updatedAt: "2026-11-23 11:20 WIB",
    kurir: {
      nama: "Agus Pratama",
      telepon: "0819-3322-1100",
      kendaraan: "Mobil Pickup Bansos (B 9812 PKM)",
      eta: "Tiba",
      lat: -6.1820,
      lng: 106.8650
    },
    kelurahanAsal: {
      nama: "Kantor Kelurahan Cempaka Putih Barat",
      alamat: "Jl. Percetakan Negara",
      lat: -6.1860,
      lng: 106.8600
    },
    laporan: null,
    tandaTerima: {
      nomorBAST: "BAST-BANSOS/2026/XI/0912",
      waktuPenerimaan: "2026-11-23 11:20:45 WIB",
      namaPenerima: "Bpk. Bambang Pamungkas",
      nikPenerima: "3171041006800007",
      statusVerifikasi: "SESUAI 100%",
      catatan: "Bantuan diterima langsung dalam kondisi baik dan lengkap.",
      signatureData: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'><path d='M20 45 Q 60 10 90 40 T 160 30' stroke='%23059669' stroke-width='3' fill='none'/></svg>"
    },
    auditTrail: [
      {
        block: 1,
        waktu: "2026-11-23 07:00:15 WIB",
        aksi: "PAKET_DIBUAT",
        aktor: "Kemensos Pusat",
        deskripsi: "Pendaftaran paket bansos.",
        hash: "0x2e4f6a8c0b1d3e50"
      },
      {
        block: 2,
        waktu: "2026-11-23 08:15:30 WIB",
        aksi: "SCAN_MASUK_KELURAHAN",
        aktor: "Kelurahan Cempaka Putih",
        deskripsi: "Scan barcode paket tiba di kelurahan.",
        hash: "0x5a7c9e1b3d5f7a90"
      },
      {
        block: 3,
        waktu: "2026-11-23 09:30:00 WIB",
        aksi: "DISPATCH_KURIR",
        aktor: "Kurir Agus Pratama",
        deskripsi: "Paket dibawa ke alamat warga.",
        hash: "0x8b0d2f4a6c8e0b20"
      },
      {
        block: 4,
        waktu: "2026-11-23 11:20:45 WIB",
        aksi: "VERIFIKASI_PENERIMA_SESUAI",
        aktor: "Penerima (Bambang Pamungkas)",
        deskripsi: "Penerima verifikasi fisik paket 100% sesuai dan menandatangani BAST digital.",
        hash: "0x1c3e5a7b9d1f3b50"
      }
    ]
  },
  {
    id: "TRC-2026-JKT-105",
    barcode: "TRC2026JKT105",
    penerima: {
      nama: "Bpk. Hendra Gunawan",
      nik: "3171052309830005",
      noHp: "0821-3344-9988",
      kelurahan: "Menteng",
      alamat: "Jl. Pegangsaan Barat No. 3, RT 02 / RW 01",
      kota: "Jakarta Pusat",
      lat: -6.1955,
      lng: 106.8420
    },
    items: [
      { nama: "Beras Premium", jumlah: "5 kg", checked: true },
      { nama: "Minyak Goreng Kemasan", jumlah: "1 Liter", checked: false },
      { nama: "Gula Pasir Kristal", jumlah: "1 kg", checked: true }
    ],
    status: "BERMASALAH",
    createdAt: "2026-11-23 08:30 WIB",
    updatedAt: "2026-11-23 11:50 WIB",
    kurir: {
      nama: "Hendra Setiawan",
      telepon: "0818-4455-6677",
      kendaraan: "Motor Logistik Bansos (B 4521 PSZ)",
      eta: "Selesai Antar",
      lat: -6.1955,
      lng: 106.8420
    },
    kelurahanAsal: {
      nama: "Kantor Kelurahan Menteng",
      alamat: "Jl. Pegangsaan Barat No. 1",
      lat: -6.1945,
      lng: 106.8315
    },
    laporan: {
      idTiket: "LAP-2026-7821",
      waktuLapor: "2026-11-23 11:50:18 WIB",
      kategori: "KEMASAN_BOCOR", // ISI_KURANG | BARANG_RUSAK | KEMASAN_BOCOR | KADALUARSA
      kategoriTeks: "Kemasan Bocor / Terbuka & Isi Kurang",
      itemBermasalah: ["Minyak Goreng Kemasan 1 Liter"],
      keterangan: "Pouch minyak goreng robek di bagian sudut dan tumpah membasahi karung beras. Mohon segera diganti minyak kemasan yang baru.",
      fotoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23fee2e2'/><text x='150' y='95' fill='%23dc2626' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'>[BUKTI FOTO DILAMPIRKAN]</text><text x='150' y='125' fill='%23991b1b' font-family='sans-serif' font-size='12' text-anchor='middle'>Kemasan Minyak Bocor / Rembes</text><circle cx='150' cy='50' r='20' fill='%23fca5a5'/><path d='M140 50 L160 50 M150 40 L150 60' stroke='%23dc2626' stroke-width='3'/></svg>",
      statusTindakLanjut: "INVESTIGASI_KELURAHAN" // INVESTIGASI_KELURAHAN | PAKET_PENGGANTI_DIKIRIM | SELESAI_DAMAI
    },
    tandaTerima: null,
    auditTrail: [
      {
        block: 1,
        waktu: "2026-11-23 08:30:12 WIB",
        aksi: "PAKET_DIBUAT",
        aktor: "Kemensos Pusat",
        deskripsi: "Paket bansos didaftarkan.",
        hash: "0x11aa22bb33cc44dd"
      },
      {
        block: 2,
        waktu: "2026-11-23 09:40:05 WIB",
        aksi: "SCAN_MASUK_KELURAHAN",
        aktor: "Kelurahan Menteng",
        deskripsi: "Scan barang masuk kantor kelurahan.",
        hash: "0x22bb33cc44dd55ee"
      },
      {
        block: 3,
        waktu: "2026-11-23 10:30:19 WIB",
        aksi: "DISPATCH_KURIR",
        aktor: "Kelurahan Menteng",
        deskripsi: "Kurir mengantar ke alamat warga.",
        hash: "0x33cc44dd55ee66ff"
      },
      {
        block: 4,
        waktu: "2026-11-23 11:50:18 WIB",
        aksi: "LAPORAN_KETIDAKSESUAIAN",
        aktor: "Penerima (Bpk. Hendra Gunawan)",
        deskripsi: "Warga melaporkan ketidaksesuaian: Kemasan Minyak Bocor.",
        hash: "0x99ff88ee77dd66cc"
      }
    ]
  }
];

// Helper options
const KELURAHAN_LIST = [
  "Menteng",
  "Gambir",
  "Senen",
  "Cempaka Putih",
  "Tanah Abang",
  "Johar Baru",
  "Kebon Sirih"
];

const DEFAULT_ITEMS = [
  { nama: "Beras Premium", jumlah: "5 kg" },
  { nama: "Minyak Goreng Kemasan", jumlah: "1 Liter" },
  { nama: "Gula Pasir Kristal", jumlah: "1 kg" }
];
