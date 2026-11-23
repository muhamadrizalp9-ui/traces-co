/**
 * TRACES-CO - Main Application Controller
 * Mengendalikan UI interaktif 3 Role: Pemerintah, Kelurahan, Penerima Bantuan
 */

// --- 1. WEB AUDIO SYNTHESIZER ---
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    try {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      this.ctx = null;
    }
  }

  playBeep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  playAlert() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.setValueAtTime(240, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }
}

const sfx = new SoundEffects();

// --- 2. SIGNATURE PAD CONTROLLER ---
class SignaturePad {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.hasSignature = false;
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : 340;
    const h = rect.height > 0 ? rect.height : 140;

    this.canvas.width = w * 2;
    this.canvas.height = h * 2;
    this.ctx.scale(2, 2);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#047857';
    this.ctx.lineWidth = 2.5;

    // Mouse Events
    this.canvas.onmousedown = (e) => this.start(e);
    this.canvas.onmousemove = (e) => this.draw(e);
    this.canvas.onmouseup = () => this.stop();
    this.canvas.onmouseleave = () => this.stop();

    // Touch Events
    this.canvas.ontouchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.start({ clientX: touch.clientX, clientY: touch.clientY });
    };

    this.canvas.ontouchmove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.draw({ clientX: touch.clientX, clientY: touch.clientY });
    };

    this.canvas.ontouchend = (e) => {
      e.preventDefault();
      this.stop();
    };
  }

  getPos(e) {
    if (!this.canvas) return { x: 0, y: 0 };
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  start(e) {
    this.isDrawing = true;
    const pos = this.getPos(e);
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    }
  }

  draw(e) {
    if (!this.isDrawing || !this.ctx) return;
    const pos = this.getPos(e);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.hasSignature = true;
  }

  stop() {
    this.isDrawing = false;
  }

  clear() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.hasSignature = false;
  }

  getDataURL() {
    if (!this.hasSignature || !this.canvas) return null;
    return this.canvas.toDataURL('image/png');
  }
}

let signPad = new SignaturePad('signatureCanvas');

// --- 3. UI RENDERING & EVENT CONTROLLERS ---

document.addEventListener('DOMContentLoaded', () => {
  initApp();

  // Sinkronisasi Perubahan Data
  if (window.tracesStore) {
    window.tracesStore.subscribe(() => {
      renderApp();
    });
  }
});

function initApp() {
  setupEventListeners();
  renderApp();
}

function setupEventListeners() {
  // Role Selector Buttons
  document.querySelectorAll('[data-role-btn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const role = e.currentTarget.getAttribute('data-role-btn');
      if (window.tracesStore) {
        window.tracesStore.setRole(role);
      }
      sfx.playBeep();
    });
  });

  // Citizen Switcher (Role Penerima)
  const citizenSelect = document.getElementById('citizenSelect');
  if (citizenSelect) {
    citizenSelect.addEventListener('change', (e) => {
      if (window.tracesStore) {
        window.tracesStore.setActiveCitizen(e.target.value);
      }
      sfx.playBeep();
    });
  }

  // Toggle Smartphone Mockup Frame
  const toggleMobileFrameBtn = document.getElementById('toggleMobileFrameBtn');
  if (toggleMobileFrameBtn) {
    toggleMobileFrameBtn.addEventListener('click', () => {
      const wrapper = document.getElementById('mobileAppContainer');
      if (wrapper) {
        const isMockup = wrapper.classList.toggle('smartphone-wrapper');
        toggleMobileFrameBtn.innerText = isMockup ? "🖥️ Tampilan Lebar" : "📱 Tampilan HP Mockup";
      }
    });
  }

  // Sound Mute Toggle
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      sfx.muted = !sfx.muted;
      soundToggleBtn.innerHTML = sfx.muted ? "🔇 Suara Mati" : "🔊 Suara Aktif";
    });
  }

  // Reset Data Demo Button
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      if (confirm("Reset seluruh data ke demo awal (5 paket bantuan sosial)?")) {
        if (window.tracesStore) {
          window.tracesStore.resetToDefault();
        }
        sfx.playAlert();
      }
    });
  }

  // Form Tambah Paket Baru (Pemerintah)
  const formNewPackage = document.getElementById('formNewPackage');
  if (formNewPackage) {
    formNewPackage.addEventListener('submit', handleNewPackageSubmit);
  }

  // Kelurahan GPS Filter Selector
  const kelurahanPkgSelect = document.getElementById('kelurahanPkgSelect');
  if (kelurahanPkgSelect) {
    kelurahanPkgSelect.addEventListener('change', (e) => {
      if (window.tracesStore && window.gpsTracker) {
        const pkg = window.tracesStore.getPackageById(e.target.value);
        window.gpsTracker.init(pkg);
      }
    });
  }

  // GPS Simulation Action Buttons
  const btnGpsStep = document.getElementById('btnGpsStep');
  if (btnGpsStep) {
    btnGpsStep.addEventListener('click', () => {
      if (window.gpsTracker) window.gpsTracker.stepForward(0.25);
      sfx.playBeep();
    });
  }

  const btnGpsArrive = document.getElementById('btnGpsArrive');
  if (btnGpsArrive) {
    btnGpsArrive.addEventListener('click', () => {
      if (window.gpsTracker) window.gpsTracker.arriveAtDestination();
      sfx.playSuccess();
    });
  }

  const btnGpsReset = document.getElementById('btnGpsReset');
  if (btnGpsReset) {
    btnGpsReset.addEventListener('click', () => {
      if (window.gpsTracker) window.gpsTracker.resetPosition();
      sfx.playBeep();
    });
  }

  // Clear Signature Button
  const btnClearSign = document.getElementById('btnClearSign');
  if (btnClearSign) {
    btnClearSign.addEventListener('click', () => {
      if (signPad) signPad.clear();
    });
  }

  // Confirm Signature & Selesai (Role Penerima)
  const btnConfirmReceive = document.getElementById('btnConfirmReceive');
  if (btnConfirmReceive) {
    btnConfirmReceive.addEventListener('click', handleVerifySuccessSubmit);
  }

  // Submit Laporan Masalah (Role Penerima)
  const formReportIssue = document.getElementById('formReportIssue');
  if (formReportIssue) {
    formReportIssue.addEventListener('submit', handleReportIssueSubmit);
  }

  // Filter & Search Table Pemerintah
  const tableSearchInput = document.getElementById('tableSearchInput');
  const tableStatusFilter = document.getElementById('tableStatusFilter');
  const tableKelurahanFilter = document.getElementById('tableKelurahanFilter');

  if (tableSearchInput) tableSearchInput.addEventListener('input', renderPemerintahTable);
  if (tableStatusFilter) tableStatusFilter.addEventListener('change', renderPemerintahTable);
  if (tableKelurahanFilter) tableKelurahanFilter.addEventListener('change', renderPemerintahTable);
}

// --- RENDER APP ---
function renderApp() {
  if (!window.tracesStore) return;

  const role = window.tracesStore.activeRole || "PEMERINTAH";
  const packages = window.tracesStore.getPackages() || [];

  // 1. Update Role Buttons UI dengan kontras warna yang jelas
  document.querySelectorAll('[data-role-btn]').forEach(btn => {
    const btnRole = btn.getAttribute('data-role-btn');
    if (btnRole === role) {
      btn.className = "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md transition-all whitespace-nowrap";
    } else {
      btn.className = "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-gov-800 transition-all whitespace-nowrap";
    }
  });

  // 2. Tampilkan Role Container yang Aktif
  const elPem = document.getElementById('viewPemerintah');
  const elKel = document.getElementById('viewKelurahan');
  const elPen = document.getElementById('viewPenerima');

  if (elPem) elPem.classList.toggle('hidden', role !== 'PEMERINTAH');
  if (elKel) elKel.classList.toggle('hidden', role !== 'KELURAHAN');
  if (elPen) elPen.classList.toggle('hidden', role !== 'PENERIMA');

  // 3. Render Spesifik View dengan perlindungan try-catch
  try {
    if (role === 'PEMERINTAH') {
      renderPemerintahView(packages);
    } else if (role === 'KELURAHAN') {
      renderKelurahanView(packages);
    } else if (role === 'PENERIMA') {
      renderPenerimaView(packages);
    }
  } catch (err) {
    console.error("Error rendering view for role:", role, err);
  }
}

// ==========================================
// 🏛️ ROLE 1: PEMERINTAH (DASHBOARD PUSAT)
// ==========================================
function renderPemerintahView(packages) {
  const total = packages.length;
  const dibuat = packages.filter(p => p.status === 'DIBUAT').length;
  const kelurahan = packages.filter(p => p.status === 'DITERIMA_KELURAHAN').length;
  const kirim = packages.filter(p => p.status === 'DALAM_PENGIRIMAN').length;
  const selesai = packages.filter(p => p.status === 'SELESAI').length;
  const masalah = packages.filter(p => p.status === 'BERMASALAH').length;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setTxt('statTotal', total);
  setTxt('statDibuat', dibuat);
  setTxt('statKelurahan', kelurahan);
  setTxt('statPengiriman', kirim);
  setTxt('statSelesai', selesai);
  setTxt('statMasalah', masalah);

  renderPemerintahTable();
}

function renderPemerintahTable() {
  if (!window.tracesStore) return;
  const packages = window.tracesStore.getPackages();
  const search = (document.getElementById('tableSearchInput')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('tableStatusFilter')?.value || 'ALL';
  const kelurahanFilter = document.getElementById('tableKelurahanFilter')?.value || 'ALL';

  const tbody = document.getElementById('packagesTableBody');
  if (!tbody) return;

  const filtered = packages.filter(pkg => {
    const matchSearch = !search ||
      pkg.id.toLowerCase().includes(search) ||
      pkg.penerima?.nama?.toLowerCase().includes(search) ||
      pkg.penerima?.nik?.includes(search);
    const matchStatus = statusFilter === 'ALL' || pkg.status === statusFilter;
    const matchKelurahan = kelurahanFilter === 'ALL' || pkg.penerima?.kelurahan === kelurahanFilter;
    return matchSearch && matchStatus && matchKelurahan;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-slate-400">
          Tidak ada data paket bansos yang sesuai dengan filter pencarian.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(pkg => {
    const statusBadge = getStatusBadgeHTML(pkg.status);
    const itemsPreview = pkg.items ? pkg.items.map(it => `${it.nama} (${it.jumlah})`).join(', ') : '-';
    const lastBlock = pkg.auditTrail && pkg.auditTrail.length > 0 ? pkg.auditTrail[pkg.auditTrail.length - 1] : null;
    const hashPreview = lastBlock?.hash ? lastBlock.hash.substring(0, 10) + '...' : '-';

    return `
      <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
        <td class="py-3 px-4 font-mono-code font-bold text-blue-900 text-xs">
          ${pkg.id}
          <div class="text-[10px] text-slate-400 font-normal">${pkg.createdAt || ''}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-800 text-sm">${pkg.penerima?.nama || '-'}</div>
          <div class="text-xs text-slate-500 font-mono-code">NIK: ${formatMaskedNIK(pkg.penerima?.nik)}</div>
          <div class="text-[11px] text-slate-400 truncate max-w-xs">${pkg.penerima?.alamat || ''}</div>
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
            ${pkg.penerima?.kelurahan || '-'}
          </span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title="${itemsPreview}">
          ${itemsPreview}
        </td>
        <td class="py-3 px-4">
          ${statusBadge}
        </td>
        <td class="py-3 px-4 font-mono-code text-[11px] text-slate-500">
          <span title="${lastBlock?.hash || ''}">
            ${hashPreview}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="openStickerModal('${pkg.id}')" title="Cetak QR Sticker" class="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-medium">
              🏷️ QR & Label
            </button>
            <button onclick="openAuditModal('${pkg.id}')" title="Lihat Riwayat Audit Blockchain" class="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs">
              📜 Audit
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleNewPackageSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const namaPenerima = form.namaPenerima?.value?.trim() || "";
  let nik = form.nik?.value?.trim() || "";
  const kelurahan = form.kelurahan?.value || "Menteng";
  const noHp = form.noHp?.value?.trim() || "0812-0000-0000";
  const alamat = form.alamat?.value?.trim() || "";
  const operator = form.operator?.value?.trim() || "Admin Kemensos RI";

  if (!namaPenerima || !nik || !alamat) {
    alert("Harap lengkapi semua kolom wajib (Nama Penerima, NIK, dan Alamat)!");
    return;
  }

  // Bersihkan NIK: ambil angka saja
  nik = nik.replace(/\D/g, '');
  if (!nik) {
    alert("NIK harus berupa angka!");
    return;
  }
  // Auto-pad jika kurang dari 16 digit untuk mempermudah testing
  if (nik.length < 16) {
    nik = nik.padEnd(16, '0');
  }

  const items = [
    { nama: "Beras Premium", jumlah: "5 kg", checked: true },
    { nama: "Minyak Goreng Kemasan", jumlah: "1 Liter", checked: true },
    { nama: "Gula Pasir Kristal", jumlah: "1 kg", checked: true }
  ];

  if (form.itemSarden?.checked) {
    items.push({ nama: "Sarden Saus Tomat", jumlah: "2 Kaleng", checked: true });
  }
  if (form.itemMie?.checked) {
    items.push({ nama: "Mie Instan", jumlah: "10 Bungkus", checked: true });
  }

  // Reset filter tabel agar paket baru langsung tampil di urutan teratas
  const searchInp = document.getElementById('tableSearchInput');
  const statFilt = document.getElementById('tableStatusFilter');
  const kelFilt = document.getElementById('tableKelurahanFilter');
  if (searchInp) searchInp.value = '';
  if (statFilt) statFilt.value = 'ALL';
  if (kelFilt) kelFilt.value = 'ALL';

  const newPkg = window.tracesStore.addPackage({
    namaPenerima,
    nik,
    kelurahan,
    noHp,
    alamat,
    operator,
    items
  });

  form.reset();
  sfx.playSuccess();

  // Buka modal stiker label untuk paket yang baru dibuat
  setTimeout(() => {
    openStickerModal(newPkg.id);
  }, 100);
}

// ==========================================
// 🏢 ROLE 2: KELURAHAN (ADMIN DISTRIBUSI)
// ==========================================
function renderKelurahanView(packages) {
  // Dropdown list paket untuk GPS Map
  const kelurahanPkgSelect = document.getElementById('kelurahanPkgSelect');
  if (kelurahanPkgSelect) {
    const activePackages = packages.filter(p => p.status === 'DALAM_PENGIRIMAN' || p.status === 'DITERIMA_KELURAHAN');
    const curVal = kelurahanPkgSelect.value;

    if (activePackages.length > 0) {
      kelurahanPkgSelect.innerHTML = activePackages.map(p => `
        <option value="${p.id}" ${p.id === curVal ? 'selected' : ''}>
          ${p.id} - ${p.penerima?.nama || ''} (${p.penerima?.kelurahan || ''}) [${p.status}]
        </option>
      `).join('');
    } else {
      kelurahanPkgSelect.innerHTML = packages.map(p => `
        <option value="${p.id}" ${p.id === curVal ? 'selected' : ''}>
          ${p.id} - ${p.penerima?.nama || ''} [${p.status}]
        </option>
      `).join('');
    }

    const selectedPkg = window.tracesStore.getPackageById(kelurahanPkgSelect.value) ||
      packages.find(p => p.status === 'DALAM_PENGIRIMAN') ||
      packages[0];

    if (window.gpsTracker) {
      window.gpsTracker.init(selectedPkg);
    }
  }

  renderKelurahanPendingScan(packages);
  renderKelurahanReadyDispatch(packages);
  renderKelurahanIncidentInbox(packages);
}

function renderKelurahanPendingScan(packages) {
  const container = document.getElementById('kelurahanPendingScanList');
  if (!container) return;

  const pending = packages.filter(p => p.status === 'DIBUAT');

  if (pending.length === 0) {
    container.innerHTML = `
      <div class="text-xs text-slate-400 italic p-4 text-center">
        Tidak ada paket baru dari Pusat yang menunggu scan masuk.
      </div>
    `;
    return;
  }

  container.innerHTML = pending.map(pkg => `
    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div>
        <div class="text-xs font-mono-code font-bold text-blue-900">${pkg.id}</div>
        <div class="text-sm font-semibold text-slate-800">${pkg.penerima?.nama || '-'}</div>
        <div class="text-xs text-slate-500">Kelurahan: ${pkg.penerima?.kelurahan || '-'}</div>
      </div>
      <button onclick="executeScanKelurahan('${pkg.id}')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5">
        <span>📷</span> Scan Terima
      </button>
    </div>
  `).join('');
}

function executeScanKelurahan(pkgId) {
  sfx.playBeep();
  if (!window.tracesStore) return;
  const res = window.tracesStore.scanKelurahanMasuk(pkgId, "Admin Posko Kelurahan");
  if (res.success) {
    sfx.playSuccess();
    alert(`Berhasil Scan Masuk!\nPaket ${pkgId} telah diverifikasi tiba di kantor Kelurahan dan modul GPS siap diaktifkan.`);
  } else {
    alert(res.message);
  }
}

function renderKelurahanReadyDispatch(packages) {
  const container = document.getElementById('kelurahanReadyDispatchList');
  if (!container) return;

  const ready = packages.filter(p => p.status === 'DITERIMA_KELURAHAN');

  if (ready.length === 0) {
    container.innerHTML = `
      <div class="text-xs text-slate-400 italic p-4 text-center">
        Tidak ada paket yang menunggu penugasan kurir.
      </div>
    `;
    return;
  }

  container.innerHTML = ready.map(pkg => `
    <div class="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
      <div>
        <div class="text-xs font-mono-code font-bold text-emerald-900">${pkg.id}</div>
        <div class="text-sm font-semibold text-slate-800">${pkg.penerima?.nama || '-'}</div>
        <div class="text-xs text-slate-500">${pkg.penerima?.alamat || ''}</div>
      </div>
      <button onclick="executeDispatchKurir('${pkg.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5">
        <span>🚚</span> Kirim ke Alamat
      </button>
    </div>
  `).join('');
}

function executeDispatchKurir(pkgId) {
  const kurirNama = prompt("Masukkan Nama Petugas Kurir:", "Budi Santoso");
  if (!kurirNama) return;

  sfx.playBeep();
  if (!window.tracesStore) return;
  const res = window.tracesStore.dispatchKurir(pkgId, {
    nama: kurirNama,
    kendaraan: "Motor Logistik Bansos (B 3341 PKM)",
    telepon: "0812-3344-5566"
  });

  if (res.success) {
    sfx.playSuccess();
    alert(`Kurir Ditugaskan!\nPaket ${pkgId} kini 'Dalam Pengiriman' menuju alamat warga. Pelacakan GPS real-time aktif.`);
  }
}

function renderKelurahanIncidentInbox(packages) {
  const container = document.getElementById('kelurahanIncidentInbox');
  const badgeCount = document.getElementById('incidentBadgeCount');
  if (!container) return;

  const reported = packages.filter(p => p.status === 'BERMASALAH' && p.laporan);

  if (badgeCount) {
    badgeCount.innerText = reported.length;
    badgeCount.classList.toggle('hidden', reported.length === 0);
  }

  if (reported.length === 0) {
    container.innerHTML = `
      <div class="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-xl col-span-2">
        🎉 Tidak ada laporan ketidaksesuaian aktif. Semua distribusi berjalan lancar.
      </div>
    `;
    return;
  }

  container.innerHTML = reported.map(pkg => `
    <div class="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2">
      <div class="flex items-center justify-between">
        <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white font-mono-code">
          TIKET: ${pkg.laporan.idTiket}
        </span>
        <span class="text-xs text-red-600 font-medium">${pkg.laporan.waktuLapor}</span>
      </div>

      <div class="font-bold text-slate-800 text-sm">
        ${pkg.penerima?.nama || '-'} (NIK: ${formatMaskedNIK(pkg.penerima?.nik)})
      </div>
      <div class="text-xs text-red-700 font-semibold">
        Kendala: ${pkg.laporan.kategoriTeks}
      </div>
      <div class="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-red-100 italic">
        "${pkg.laporan.keterangan}"
      </div>

      ${pkg.laporan.fotoUrl ? `
        <div class="mt-2">
          <div class="text-[11px] font-semibold text-slate-500 mb-1">Bukti Foto dari Penerima:</div>
          <div class="w-full max-h-36 overflow-hidden rounded-lg border border-red-200">
            <img src="${pkg.laporan.fotoUrl}" class="w-full object-cover" alt="Bukti Foto">
          </div>
        </div>
      ` : ''}

      <div class="pt-2 flex items-center justify-between border-t border-red-200">
        <span class="text-xs text-slate-500">Status: <b class="text-red-700">${pkg.laporan.statusTindakLanjut}</b></span>
        <button onclick="openResolveModal('${pkg.id}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm">
          Tindak Lanjut & Selesaikan
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 📱 ROLE 3: PENERIMA BANTUAN (MOBILE APP)
// ==========================================
function renderPenerimaView(packages) {
  if (!window.tracesStore) return;
  const activeCitizenId = window.tracesStore.activeCitizenId;
  const pkg = window.tracesStore.getPackageById(activeCitizenId) || packages[0];
  if (!pkg) return;

  const select = document.getElementById('citizenSelect');
  if (select) {
    select.innerHTML = packages.map(p => `
      <option value="${p.id}" ${p.id === pkg.id ? 'selected' : ''}>
        ${p.penerima?.nama || ''} (${p.id} - ${p.status})
      </option>
    `).join('');
  }

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setTxt('mobileCitizenName', pkg.penerima?.nama || '-');
  setTxt('mobileCitizenNik', `NIK: ${formatMaskedNIK(pkg.penerima?.nik)}`);
  setTxt('mobilePackageId', pkg.id);

  renderMobileTrackingCard(pkg);
  renderMobileItemsChecklist(pkg);

  const actionContainer = document.getElementById('mobileActionButtonsContainer');
  if (actionContainer) {
    if (pkg.status === 'SELESAI') {
      actionContainer.innerHTML = `
        <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center space-y-2">
          <div class="text-emerald-700 font-bold text-sm flex items-center justify-center gap-1.5">
            <span>✅</span> Paket Telah Diterima & Terverifikasi Resmi
          </div>
          <button onclick="openBastModal('${pkg.id}')" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all">
            📄 Lihat Bukti Tanda Terima (BAST Digital)
          </button>
        </div>
      `;
    } else if (pkg.status === 'BERMASALAH') {
      actionContainer.innerHTML = `
        <div class="p-3 bg-red-50 rounded-xl border border-red-300 text-center space-y-2">
          <div class="text-red-700 font-bold text-sm flex items-center justify-center gap-1.5">
            <span>⚠️</span> Laporan Ketidaksesuaian Sedang Diproses
          </div>
          <div class="text-xs text-slate-600">
            Nomor Tiket: <b>${pkg.laporan?.idTiket || '-'}</b>. Tim posko Kelurahan akan segera menghubungi Anda.
          </div>
        </div>
      `;
    } else {
      actionContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-2.5">
          <button onclick="openSignatureModal('${pkg.id}')" class="flex flex-col items-center justify-center p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all">
            <span class="text-lg">✅</span>
            <span class="text-xs mt-0.5">Sesuai & Terima</span>
          </button>
          <button onclick="openReportModal('${pkg.id}')" class="flex flex-col items-center justify-center p-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all">
            <span class="text-lg">⚠️</span>
            <span class="text-xs mt-0.5">Tidak Sesuai / Lapor</span>
          </button>
        </div>
      `;
    }
  }

  // Update Mobile GPS Tracker
  const mapWrap = document.getElementById('mobileMapWrapper');
  if (pkg.status === 'DALAM_PENGIRIMAN') {
    if (mapWrap) mapWrap.classList.remove('hidden');
    if (window.mobileGPSTracker) {
      window.mobileGPSTracker.init(pkg);
    }
  } else {
    if (mapWrap) mapWrap.classList.add('hidden');
  }
}

function renderMobileTrackingCard(pkg) {
  const container = document.getElementById('mobileTimelineContainer');
  if (!container) return;

  const steps = [
    { key: "DIBUAT", label: "Didaftarkan di Dinsos", desc: pkg.createdAt || '' },
    { key: "DITERIMA_KELURAHAN", label: "Tiba di Posko Kelurahan", desc: pkg.status === 'DIBUAT' ? 'Menunggu kiriman' : 'Terkonfirmasi scan' },
    { key: "DALAM_PENGIRIMAN", label: "Kurir Menuju Alamat", desc: pkg.kurir ? `${pkg.kurir.nama} (ETA: ${pkg.kurir.eta})` : 'Menunggu jadwal armada' },
    { key: "SELESAI", label: "Paket Diterima Warga", desc: pkg.status === 'SELESAI' ? 'Terverifikasi Berita Acara Digital' : (pkg.status === 'BERMASALAH' ? 'Ada Kendala Dilaporkan' : 'Verifikasi saat kurir tiba') }
  ];

  const statusOrder = ["DIBUAT", "DITERIMA_KELURAHAN", "DALAM_PENGIRIMAN", "SELESAI"];
  let activeIdx = statusOrder.indexOf(pkg.status);
  if (pkg.status === 'BERMASALAH') activeIdx = 2;

  container.innerHTML = steps.map((step, idx) => {
    const isCompleted = idx < activeIdx || (pkg.status === 'SELESAI' && idx === 3);
    const isCurrent = idx === activeIdx && pkg.status !== 'SELESAI';
    const isProblem = pkg.status === 'BERMASALAH' && idx === 3;

    let dotClass = "bg-slate-200 border-slate-300 text-slate-400";
    let lineClass = "bg-slate-200";

    if (isCompleted) {
      dotClass = "bg-emerald-600 border-emerald-600 text-white";
      lineClass = "bg-emerald-600";
    } else if (isCurrent) {
      dotClass = "bg-blue-600 border-blue-600 text-white animate-pulse";
    } else if (isProblem) {
      dotClass = "bg-red-600 border-red-600 text-white";
    }

    return `
      <div class="flex items-start gap-3 relative pb-4">
        ${idx < steps.length - 1 ? `
          <div class="absolute left-3.5 top-6 bottom-0 w-0.5 ${lineClass}"></div>
        ` : ''}
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${dotClass} z-10 shrink-0">
          ${isCompleted ? '✓' : (idx + 1)}
        </div>
        <div class="pt-0.5">
          <div class="text-xs font-bold text-slate-800">${step.label}</div>
          <div class="text-[11px] text-slate-500">${step.desc}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderMobileItemsChecklist(pkg) {
  const container = document.getElementById('mobileItemsChecklist');
  if (!container || !pkg.items) return;

  container.innerHTML = pkg.items.map(item => `
    <div class="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
      <div class="flex items-center gap-2.5">
        <div class="w-5 h-5 rounded-md flex items-center justify-center bg-emerald-100 text-emerald-700 text-xs font-bold">
          ✓
        </div>
        <div>
          <div class="text-xs font-bold text-slate-800">${item.nama}</div>
          <div class="text-[11px] text-slate-500">Standar Bantuan Pemerintah RI</div>
        </div>
      </div>
      <div class="text-xs font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
        ${item.jumlah}
      </div>
    </div>
  `).join('');
}

// ==========================================
// 🔍 SCAN QR SIMULATOR FOR PENERIMA
// ==========================================
function triggerMobileScan() {
  if (!window.tracesStore) return;
  const activeCitizenId = window.tracesStore.activeCitizenId;
  const pkg = window.tracesStore.getPackageById(activeCitizenId);
  sfx.playBeep();

  const confirmed = confirm(
    `[SIMULASI SCAN KAMERA QR PENERIMA]\n\n` +
    `Mendeteksi QR Code pada Kardus Bansos:\n` +
    `ID Paket: ${pkg ? pkg.id : '-'}\n` +
    `Penerima: ${pkg?.penerima?.nama || '-'}\n\n` +
    `Lanjutkan ke Pemeriksaan & Verifikasi Fisik Isi Paket?`
  );

  if (confirmed) {
    sfx.playSuccess();
    document.getElementById('mobileVerificationSection')?.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==========================================
// ✍️ VERIFIKASI SUKSES & TANDA TANGAN DIGITAL
// ==========================================
let currentSignPkgId = null;

function openSignatureModal(pkgId) {
  currentSignPkgId = pkgId;
  if (!window.tracesStore) return;
  const pkg = window.tracesStore.getPackageById(pkgId);
  if (!pkg) return;

  const nameEl = document.getElementById('signModalPenerimaNama');
  const pkgEl = document.getElementById('signModalPackageId');
  if (nameEl) nameEl.innerText = pkg.penerima?.nama || '-';
  if (pkgEl) pkgEl.innerText = pkg.id;

  const modal = document.getElementById('signatureModal');
  if (modal) modal.classList.remove('hidden');

  // Inisialisasi kanvas setelah modal terbuka
  setTimeout(() => {
    if (signPad) {
      signPad.init();
      signPad.clear();
    }
  }, 50);
}

function closeSignatureModal() {
  const modal = document.getElementById('signatureModal');
  if (modal) modal.classList.add('hidden');
  currentSignPkgId = null;
}

function handleVerifySuccessSubmit() {
  if (!currentSignPkgId || !window.tracesStore) return;

  let signData = signPad ? signPad.getDataURL() : null;
  if (!signData) {
    signData = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='70'><path d='M20 40 Q 50 15 80 40 T 150 35' stroke='%23059669' stroke-width='3' fill='none'/></svg>";
  }

  const catatan = document.getElementById('signCatatan')?.value || "Bantuan telah diterima utuh dan sesuai rincian.";
  const res = window.tracesStore.verifySuccess(currentSignPkgId, signData, catatan);

  closeSignatureModal();

  if (res.success) {
    sfx.playSuccess();
    triggerConfetti();
    openBastModal(currentSignPkgId);
  }
}

function triggerConfetti() {
  if (typeof window.confetti === 'function') {
    try {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }
}

// ==========================================
// 📄 BAST DIGITAL MODAL (BERITA ACARA)
// ==========================================
function openBastModal(pkgId) {
  if (!window.tracesStore) return;
  const pkg = window.tracesStore.getPackageById(pkgId);
  if (!pkg || !pkg.tandaTerima) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setTxt('bastNomor', pkg.tandaTerima.nomorBAST);
  setTxt('bastWaktu', pkg.tandaTerima.waktuPenerimaan);
  setTxt('bastNama', pkg.penerima?.nama || '-');
  setTxt('bastNik', pkg.penerima?.nik || '-');
  setTxt('bastAlamat', pkg.penerima?.alamat || '-');
  setTxt('bastKelurahan', pkg.penerima?.kelurahan || '-');

  const itemsList = document.getElementById('bastItemsList');
  if (itemsList && pkg.items) {
    itemsList.innerHTML = pkg.items.map(it => `
      <li class="flex justify-between border-b border-slate-100 py-1 text-xs">
        <span>${it.nama}</span>
        <span class="font-bold text-slate-800">${it.jumlah}</span>
      </li>
    `).join('');
  }

  const signImg = document.getElementById('bastSignImage');
  if (signImg && pkg.tandaTerima.signatureData) {
    signImg.src = pkg.tandaTerima.signatureData;
  }

  const qrContainer = document.getElementById('bastQRContainer');
  if (qrContainer && window.QRHelper) {
    window.QRHelper.renderQR(qrContainer, `TRACES-BAST|${pkg.tandaTerima.nomorBAST}|${pkg.penerima?.nik}`, 110);
  }

  document.getElementById('bastModal')?.classList.remove('hidden');
}

function closeBastModal() {
  document.getElementById('bastModal')?.classList.add('hidden');
}

// ==========================================
// ⚠️ LAPORAN KETIDAKSESUAIAN MODAL
// ==========================================
let currentReportPkgId = null;

function openReportModal(pkgId) {
  currentReportPkgId = pkgId;
  if (!window.tracesStore) return;
  const pkg = window.tracesStore.getPackageById(pkgId);
  if (!pkg) return;

  const idEl = document.getElementById('reportPackageId');
  const nameEl = document.getElementById('reportPenerimaNama');
  if (idEl) idEl.innerText = pkg.id;
  if (nameEl) nameEl.innerText = pkg.penerima?.nama || '-';

  const container = document.getElementById('reportItemsCheckboxContainer');
  if (container && pkg.items) {
    container.innerHTML = pkg.items.map(it => `
      <label class="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs cursor-pointer">
        <input type="checkbox" name="itemReport" value="${it.nama}" class="rounded text-red-600 focus:ring-red-500">
        <span>${it.nama} (${it.jumlah})</span>
      </label>
    `).join('');
  }

  document.getElementById('reportModal')?.classList.remove('hidden');
}

function closeReportModal() {
  document.getElementById('reportModal')?.classList.add('hidden');
  currentReportPkgId = null;
}

function handleReportIssueSubmit(e) {
  e.preventDefault();
  if (!currentReportPkgId || !window.tracesStore) return;

  const form = e.target;
  const kategori = form.kategoriMasalah?.value || "ISI_KURANG";
  const kategoriSelect = form.kategoriMasalah;
  const kategoriTeks = kategoriSelect?.options[kategoriSelect.selectedIndex]?.text || kategori;
  const keterangan = form.keterangan?.value?.trim() || "Tidak ada rincian tambahan";

  const checkedBoxes = form.querySelectorAll('input[name="itemReport"]:checked');
  const itemBermasalah = Array.from(checkedBoxes).map(cb => cb.value);

  const fotoUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23fee2e2'/><text x='150' y='95' fill='%23dc2626' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'>[BUKTI FOTO KENDALA]</text><text x='150' y='125' fill='%23991b1b' font-family='sans-serif' font-size='12' text-anchor='middle'>" + encodeURIComponent(kategoriTeks) + "</text></svg>";

  const res = window.tracesStore.reportIssue(currentReportPkgId, {
    kategori,
    kategoriTeks,
    itemBermasalah,
    keterangan,
    fotoUrl
  });

  closeReportModal();
  form.reset();

  if (res.success) {
    sfx.playAlert();
    alert(
      `Laporan Kendala Berhasil Terkirim!\n\n` +
      `Nomor Tiket: ${res.tiketId}\n` +
      `Status paket berubah menjadi 'Bermasalah' dan notifikasi prioritas telah dikirimkan ke Dashboard Kelurahan & Dinsos Pusat.`
    );
  }
}

// ==========================================
// 🛠️ RESOLUSI PENGADUAN MODAL (KELURAHAN)
// ==========================================
let currentResolvePkgId = null;

function openResolveModal(pkgId) {
  currentResolvePkgId = pkgId;
  if (!window.tracesStore) return;
  const pkg = window.tracesStore.getPackageById(pkgId);
  if (!pkg || !pkg.laporan) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setTxt('resolveTiketId', pkg.laporan.idTiket);
  setTxt('resolvePenerimaNama', pkg.penerima?.nama || '-');
  setTxt('resolveKendala', pkg.laporan.kategoriTeks);
  setTxt('resolveCatatanWarga', `"${pkg.laporan.keterangan}"`);

  document.getElementById('resolveModal')?.classList.remove('hidden');
}

function closeResolveModal() {
  document.getElementById('resolveModal')?.classList.add('hidden');
  currentResolvePkgId = null;
}

function handleResolveSubmit() {
  if (!currentResolvePkgId || !window.tracesStore) return;

  const solusi = document.getElementById('resolveSolusiSelect')?.value || "PAKET_PENGGANTI_DIKIRIM";
  const catatanAdmin = document.getElementById('resolveCatatanAdmin')?.value?.trim() || "Telah dilakukan penanganan oleh posko Kelurahan.";

  const res = window.tracesStore.resolveIssue(currentResolvePkgId, solusi, catatanAdmin);

  closeResolveModal();

  if (res.success) {
    sfx.playSuccess();
    alert(`Laporan Berhasil Ditindaklanjuti!\nStatus: ${solusi}\nAudit blockchain telah mencatat penyelesaian kendala.`);
  }
}

// ==========================================
// 🏷️ QR CODE & STICKER LABEL MODAL
// ==========================================
function openStickerModal(pkgId) {
  if (!window.tracesStore) return;
  const pkg = window.tracesStore.getPackageById(pkgId);
  if (!pkg) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setTxt('stickerId', pkg.id);
  setTxt('stickerNama', pkg.penerima?.nama || '-');
  setTxt('stickerNik', formatMaskedNIK(pkg.penerima?.nik));
  setTxt('stickerKelurahan', pkg.penerima?.kelurahan || '-');
  setTxt('stickerAlamat', pkg.penerima?.alamat || '-');

  const itemsList = document.getElementById('stickerItemsList');
  if (itemsList && pkg.items) {
    itemsList.innerHTML = pkg.items.map(it => `
      <div class="flex justify-between border-b border-dashed border-slate-200 py-0.5 text-xs">
        <span>• ${it.nama}</span>
        <span class="font-bold text-slate-800">${it.jumlah}</span>
      </div>
    `).join('');
  }

  const qrContainer = document.getElementById('stickerQRContainer');
  if (qrContainer && window.QRHelper) {
    window.QRHelper.renderQR(qrContainer, `TRACES|${pkg.id}|${pkg.penerima?.nik}`, 140);
  }

  const barcodeTarget = document.getElementById('stickerBarcodeTarget');
  if (barcodeTarget && window.QRHelper) {
    window.QRHelper.renderBarcode(barcodeTarget, pkg.barcode || pkg.id, { width: 2, height: 42 });
  }

  document.getElementById('stickerModal')?.classList.remove('hidden');
}

function closeStickerModal() {
  document.getElementById('stickerModal')?.classList.add('hidden');
}

function shortcutScanKelurahanFromModal() {
  const pkgId = document.getElementById('stickerId')?.innerText?.trim();
  closeStickerModal();
  if (window.tracesStore) {
    window.tracesStore.setRole('KELURAHAN');
    if (pkgId) {
      setTimeout(() => {
        executeScanKelurahan(pkgId);
      }, 300);
    }
  }
}

// ==========================================
// 📜 BLOCKCHAIN AUDIT TRAIL MODAL
// ==========================================
function openAuditModal(pkgId) {
  if (!window.tracesStore) return;
  const pkg = window.tracesStore.getPackageById(pkgId);
  if (!pkg) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setTxt('auditModalPackageId', pkg.id);
  setTxt('auditModalPenerima', `${pkg.penerima?.nama || '-'} (Kel. ${pkg.penerima?.kelurahan || '-'})`);

  const list = document.getElementById('auditTrailList');
  if (list && pkg.auditTrail) {
    list.innerHTML = pkg.auditTrail.map((block, idx) => `
      <div class="relative pl-6 pb-6 border-l-2 ${idx === pkg.auditTrail.length - 1 ? 'border-emerald-500' : 'border-blue-400'} last:pb-0">
        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full ${idx === pkg.auditTrail.length - 1 ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-blue-600'}"></div>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-mono-code font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
              BLOCK #${block.block}: ${block.aksi}
            </span>
            <span class="text-slate-500">${block.waktu}</span>
          </div>
          <div class="text-xs font-semibold text-slate-700">Aktor: ${block.aktor}</div>
          <div class="text-xs text-slate-600">${block.deskripsi}</div>
          <div class="pt-1 border-t border-slate-200/60 font-mono-code text-[11px] text-slate-400 truncate">
            Hash: <span class="text-blue-700 font-bold">${block.hash}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('auditModal')?.classList.remove('hidden');
}

function closeAuditModal() {
  document.getElementById('auditModal')?.classList.add('hidden');
}

// --- HELPER UTILITIES ---
function getStatusBadgeHTML(status) {
  switch (status) {
    case 'DIBUAT':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-dibuat">📦 Dibuat</span>`;
    case 'DITERIMA_KELURAHAN':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-kelurahan">🏢 Di Kelurahan</span>`;
    case 'DALAM_PENGIRIMAN':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-pengiriman">🚚 Pengiriman (GPS)</span>`;
    case 'SELESAI':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-selesai">✅ Selesai Terverifikasi</span>`;
    case 'BERMASALAH':
      return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-bermasalah">⚠️ Bermasalah</span>`;
    default:
      return `<span class="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">${status}</span>`;
  }
}

function formatMaskedNIK(nik) {
  if (!nik || nik.length < 10) return nik || '-';
  return nik.substring(0, 6) + "******" + nik.substring(nik.length - 4);
}
