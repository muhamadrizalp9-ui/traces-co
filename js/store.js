/**
 * TRACES-CO - Store & State Management
 * Sinkronisasi state lokal (localStorage) dengan event dispatcher
 */

const STORAGE_KEY = "TRACES_CO_BANSOS_PACKAGES_V1";
const ROLE_KEY = "TRACES_CO_ACTIVE_ROLE";
const ACTIVE_CITIZEN_KEY = "TRACES_CO_ACTIVE_CITIZEN_ID";

// Simulasi Pseudo-Hash SHA-256 untuk Audit Trail Blockchain
function generateSimulatedHash(seedStr) {
  let hash = 0x811c9dc5;
  const str = seedStr + Date.now().toString(36) + Math.random().toString(36);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hexPart1 = (hash >>> 0).toString(16).padStart(8, '0');
  const hexPart2 = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
  const hexPart3 = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
  const hexPart4 = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
  return "0x" + hexPart1 + hexPart2 + hexPart3 + hexPart4;
}

function getFormattedTime() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds} WIB`;
}

class BansosStore {
  constructor() {
    this.packages = [];
    this.activeRole = "PEMERINTAH"; // 'PEMERINTAH' | 'KELURAHAN' | 'PENERIMA'
    this.activeCitizenId = "TRC-2026-JKT-101"; // Default login citizen
    this.listeners = [];
    this.init();
  }

  init() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        this.packages = JSON.parse(savedData);
      } catch (e) {
        console.error("Gagal parse localStorage, memuat data default", e);
        this.packages = JSON.parse(JSON.stringify(DEFAULT_PACKAGES));
      }
    } else {
      this.packages = JSON.parse(JSON.stringify(DEFAULT_PACKAGES));
      this.save();
    }

    const savedRole = localStorage.getItem(ROLE_KEY);
    if (savedRole && ["PEMERINTAH", "KELURAHAN", "PENERIMA"].includes(savedRole)) {
      this.activeRole = savedRole;
    }

    const savedCitizen = localStorage.getItem(ACTIVE_CITIZEN_KEY);
    if (savedCitizen && this.getPackageById(savedCitizen)) {
      this.activeCitizenId = savedCitizen;
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.packages));
    this.notify();
  }

  notify() {
    this.listeners.forEach(fn => fn(this.packages, this.activeRole, this.activeCitizenId));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== listener);
    };
  }

  setRole(role) {
    if (["PEMERINTAH", "KELURAHAN", "PENERIMA"].includes(role)) {
      this.activeRole = role;
      localStorage.setItem(ROLE_KEY, role);
      this.notify();
    }
  }

  setActiveCitizen(packageId) {
    const pkg = this.getPackageById(packageId);
    if (pkg) {
      this.activeCitizenId = packageId;
      localStorage.setItem(ACTIVE_CITIZEN_KEY, packageId);
      this.notify();
    }
  }

  getPackages() {
    return this.packages;
  }

  getPackageById(id) {
    return this.packages.find(p => p.id === id || p.barcode === id);
  }

  resetToDefault() {
    this.packages = JSON.parse(JSON.stringify(DEFAULT_PACKAGES));
    this.activeCitizenId = "TRC-2026-JKT-101";
    this.save();
  }

  // --- ACTIONS ---

  // 1. Tambah Paket Baru (Pemerintah)
  addPackage(formData) {
    const seq = 100 + this.packages.length + 1;
    const newId = `TRC-2026-JKT-${seq}`;
    const newBarcode = `TRC2026JKT${seq}`;
    const timestamp = getFormattedTime();

    const initialBlock = {
      block: 1,
      waktu: timestamp,
      aksi: "PAKET_DIBUAT",
      aktor: `Kemensos Pusat (Petugas: ${formData.operator || 'Admin Pusat'})`,
      deskripsi: `Paket Bansos dialokasikan untuk ${formData.namaPenerima} di Kelurahan ${formData.kelurahan}.`,
      hash: generateSimulatedHash(newId + timestamp)
    };

    const newPkg = {
      id: newId,
      barcode: newBarcode,
      penerima: {
        nama: formData.namaPenerima,
        nik: formData.nik,
        noHp: formData.noHp || "0812-0000-0000",
        kelurahan: formData.kelurahan,
        alamat: formData.alamat,
        kota: "Jakarta Pusat",
        lat: formData.lat || -6.1950 + (Math.random() - 0.5) * 0.02,
        lng: formData.lng || 106.8400 + (Math.random() - 0.5) * 0.02
      },
      items: formData.items || [
        { nama: "Beras Premium", jumlah: "5 kg", checked: true },
        { nama: "Minyak Goreng Kemasan", jumlah: "1 Liter", checked: true },
        { nama: "Gula Pasir Kristal", jumlah: "1 kg", checked: true }
      ],
      status: "DIBUAT",
      createdAt: timestamp,
      updatedAt: timestamp,
      kurir: null,
      kelurahanAsal: {
        nama: `Kantor Kelurahan ${formData.kelurahan}`,
        alamat: `Jl. Prapatan Utama No. 1, ${formData.kelurahan}`,
        lat: -6.1930,
        lng: 106.8320
      },
      laporan: null,
      tandaTerima: null,
      auditTrail: [initialBlock]
    };

    this.packages.unshift(newPkg);
    this.save();
    return newPkg;
  }

  // 2. Scan Masuk di Kelurahan
  scanKelurahanMasuk(packageId, adminName = "Admin Distribusi") {
    const pkg = this.getPackageById(packageId);
    if (!pkg) return { success: false, message: "Paket tidak ditemukan!" };

    if (pkg.status !== "DIBUAT") {
      return { 
        success: false, 
        message: `Paket sudah berstatus '${pkg.status}'. Tidak perlu scan penerimaan ulang.` 
      };
    }

    const timestamp = getFormattedTime();
    pkg.status = "DITERIMA_KELURAHAN";
    pkg.updatedAt = timestamp;

    const newBlock = {
      block: pkg.auditTrail.length + 1,
      waktu: timestamp,
      aksi: "SCAN_MASUK_KELURAHAN",
      aktor: `${pkg.kelurahanAsal.nama} (${adminName})`,
      deskripsi: "Paket fisik diterima di kantor kelurahan dan siap didistribusikan ke penerima.",
      hash: generateSimulatedHash(pkg.id + timestamp + "SCAN_MASUK")
    };

    pkg.auditTrail.push(newBlock);
    this.save();
    return { success: true, package: pkg };
  }

  // 3. Dispatch Kurir Menuju Penerima (GPS Aktif)
  dispatchKurir(packageId, kurirData) {
    const pkg = this.getPackageById(packageId);
    if (!pkg) return { success: false, message: "Paket tidak ditemukan!" };

    const timestamp = getFormattedTime();
    pkg.status = "DALAM_PENGIRIMAN";
    pkg.updatedAt = timestamp;
    pkg.kurir = {
      nama: kurirData?.nama || "Budi Santoso",
      telepon: kurirData?.telepon || "0812-7788-9900",
      kendaraan: kurirData?.kendaraan || "Motor Logistik Bansos (B 3341 PKM)",
      eta: "15 Menit",
      lat: pkg.kelurahanAsal.lat,
      lng: pkg.kelurahanAsal.lng
    };

    const newBlock = {
      block: pkg.auditTrail.length + 1,
      waktu: timestamp,
      aksi: "DISPATCH_KURIR",
      aktor: `Armada Logistik (${pkg.kurir.nama})`,
      deskripsi: `Paket sedang dibawa kurir menuju alamat penerima (${pkg.penerima.alamat}). Pelacakan GPS diaktifkan.`,
      hash: generateSimulatedHash(pkg.id + timestamp + "DISPATCH")
    };

    pkg.auditTrail.push(newBlock);
    this.save();
    return { success: true, package: pkg };
  }

  // 4. Update Koordinat GPS Kurir
  updateKurirLocation(packageId, lat, lng, eta) {
    const pkg = this.getPackageById(packageId);
    if (pkg && pkg.kurir) {
      pkg.kurir.lat = lat;
      pkg.kurir.lng = lng;
      if (eta) pkg.kurir.eta = eta;
      this.save();
    }
  }

  // 5. Verifikasi Penerimaan: Sesuai & Terima Bantuan (SELESAI)
  verifySuccess(packageId, signatureData, catatan = "Bantuan telah diterima sesuai.") {
    const pkg = this.getPackageById(packageId);
    if (!pkg) return { success: false, message: "Paket tidak ditemukan!" };

    const timestamp = getFormattedTime();
    const bastNumber = `BAST-BANSOS/2026/XI/${Math.floor(1000 + Math.random() * 9000)}`;

    pkg.status = "SELESAI";
    pkg.updatedAt = timestamp;
    if (pkg.kurir) pkg.kurir.eta = "Telah Tiba";

    pkg.tandaTerima = {
      nomorBAST: bastNumber,
      waktuPenerimaan: timestamp,
      namaPenerima: pkg.penerima.nama,
      nikPenerima: pkg.penerima.nik,
      statusVerifikasi: "SESUAI 100% TERVERIFIKASI",
      catatan: catatan,
      signatureData: signatureData
    };

    const newBlock = {
      block: pkg.auditTrail.length + 1,
      waktu: timestamp,
      aksi: "VERIFIKASI_PENERIMA_SESUAI",
      aktor: `Penerima Bansos (${pkg.penerima.nama} - NIK: ${pkg.penerima.nik})`,
      deskripsi: `Penerima telah memverifikasi isi paket bansos 100% lengkap & menandatangani BAST Digital ${bastNumber}.`,
      hash: generateSimulatedHash(pkg.id + timestamp + "VERIFIED_OK")
    };

    pkg.auditTrail.push(newBlock);
    this.save();
    return { success: true, package: pkg, bastNumber };
  }

  // 6. Verifikasi Penerimaan: Tidak Sesuai / Laporkan (BERMASALAH)
  reportIssue(packageId, reportData) {
    const pkg = this.getPackageById(packageId);
    if (!pkg) return { success: false, message: "Paket tidak ditemukan!" };

    const timestamp = getFormattedTime();
    const tiketId = `LAP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    pkg.status = "BERMASALAH";
    pkg.updatedAt = timestamp;

    pkg.laporan = {
      idTiket: tiketId,
      waktuLapor: timestamp,
      kategori: reportData.kategori,
      kategoriTeks: reportData.kategoriTeks || reportData.kategori,
      itemBermasalah: reportData.itemBermasalah || [],
      keterangan: reportData.keterangan || "Tidak ada keterangan tambahan",
      fotoUrl: reportData.fotoUrl || null,
      statusTindakLanjut: "INVESTIGASI_KELURAHAN"
    };

    const newBlock = {
      block: pkg.auditTrail.length + 1,
      waktu: timestamp,
      aksi: "LAPORAN_KETIDAKSESUAIAN",
      aktor: `Penerima Bansos (${pkg.penerima.nama})`,
      deskripsi: `Warga melaporkan ketidaksesuaian (${reportData.kategoriTeks}). Tiket: ${tiketId}. Perlu investigasi posko distribusi.`,
      hash: generateSimulatedHash(pkg.id + timestamp + "REPORT_ISSUE")
    };

    pkg.auditTrail.push(newBlock);
    this.save();
    return { success: true, package: pkg, tiketId };
  }

  // 7. Resolusi Laporan Masalah (Kelurahan / Pemerintah)
  resolveIssue(packageId, solusi, catatanAdmin) {
    const pkg = this.getPackageById(packageId);
    if (!pkg || !pkg.laporan) return { success: false, message: "Laporan tidak ditemukan!" };

    const timestamp = getFormattedTime();
    pkg.laporan.statusTindakLanjut = solusi; // 'PAKET_PENGGANTI_DIKIRIM' | 'SELESAI_DAMAI'
    pkg.laporan.catatanAdmin = catatanAdmin;

    // Jika diganti paket, kembalikan status ke DITERIMA_KELURAHAN atau SELESAI
    if (solusi === 'SELESAI_DAMAI') {
      pkg.status = "SELESAI";
    }

    const newBlock = {
      block: pkg.auditTrail.length + 1,
      waktu: timestamp,
      aksi: "RESOLUSI_PENGADUAN",
      aktor: "Admin Kelurahan / Dinsos",
      deskripsi: `Laporan warga ${pkg.laporan.idTiket} ditindaklanjuti dengan status: ${solusi}. Catatan: ${catatanAdmin}`,
      hash: generateSimulatedHash(pkg.id + timestamp + "RESOLVE")
    };

    pkg.auditTrail.push(newBlock);
    this.save();
    return { success: true, package: pkg };
  }
}

// Global Store Instance
window.tracesStore = new BansosStore();
