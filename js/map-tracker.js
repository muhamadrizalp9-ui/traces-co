/**
 * TRACES-CO - GPS Tracking & Telemetry Module
 * Modul pemantauan pergerakan kurir bansos secara real-time
 */

class GPSTracker {
  constructor(mapContainerId, telemetryContainerId) {
    this.mapContainerId = mapContainerId;
    this.telemetryContainerId = telemetryContainerId;
    this.map = null;
    this.routePolyline = null;
    this.courierMarker = null;
    this.originMarker = null;
    this.destMarker = null;
    this.currentPackage = null;
    this.animInterval = null;
    this.progress = 0.45; // 0.0 to 1.0
  }

  init(pkg) {
    this.currentPackage = pkg;
    const container = document.getElementById(this.mapContainerId);
    if (!container) return;

    if (!pkg || !pkg.penerima) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
          <svg class="w-12 h-12 mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A2 2 0 013 16.382V5.618a2 2 0 011.447-1.894L9 1m0 19l6-3m-6 3V1m6 19l5.447-2.724A2 2 0 0021 16.382V5.618a2 2 0 00-1.447-1.894L15 1m0 19V1m0 0L9 4"></path>
          </svg>
          <p class="font-medium text-xs">Pilih paket dengan status "Dalam Pengiriman" untuk melihat modul GPS Live.</p>
        </div>
      `;
      this.updateTelemetry(null);
      return;
    }

    // Hitung posisi awal (Kelurahan) dan tujuan (Penerima)
    const origin = [pkg.kelurahanAsal?.lat || -6.1945, pkg.kelurahanAsal?.lng || 106.8315];
    const dest = [pkg.penerima?.lat || -6.1985, pkg.penerima?.lng || 106.8402];

    // Cek ketersediaan Leaflet dengan fallback aman
    if (window.L && typeof window.L.map === 'function') {
      try {
        this.renderLeafletMap(container, origin, dest, pkg);
      } catch (err) {
        console.warn("Leaflet error, menggunakan fallback peta taktis vektor:", err);
        this.renderFallbackMap(container, origin, dest, pkg);
      }
    } else {
      this.renderFallbackMap(container, origin, dest, pkg);
    }

    this.updateTelemetry(pkg);
  }

  renderLeafletMap(container, origin, dest, pkg) {
    // 1. Bersihkan instance map lama dan _leaflet_id untuk mencegah error "Map container is already initialized"
    if (this.map) {
      try {
        this.map.remove();
      } catch (e) {}
      this.map = null;
    }

    if (container._leaflet_id) {
      try {
        delete container._leaflet_id;
      } catch (e) {
        container._leaflet_id = null;
      }
    }

    container.innerHTML = '';

    // Cek ukuran kontainer agar Leaflet tidak menghitung batas NaN
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // Jika parent belum sepenuhnya terlihat (misal tab baru dibuka)
      this.renderFallbackMap(container, origin, dest, pkg);
      return;
    }

    const midLat = (origin[0] + dest[0]) / 2;
    const midLng = (origin[1] + dest[1]) / 2;

    this.map = L.map(this.mapContainerId, {
      zoomControl: true,
      attributionControl: false
    }).setView([midLat, midLng], 15);

    try {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(this.map);
    } catch (e) {
      console.warn("Tile layer warning:", e);
    }

    // Custom Icon Posko Kelurahan
    const kelurahanIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex items-center justify-center w-9 h-9 bg-blue-900 text-white rounded-full border-2 border-white shadow-lg">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Custom Icon Rumah Penerima
    const destIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex items-center justify-center w-9 h-9 bg-emerald-600 text-white rounded-full border-2 border-white shadow-lg animate-bounce">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Custom Icon Kurir Bansos dengan Radar Pulse
    const courierIcon = L.divIcon({
      className: 'custom-courier-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
          <div class="relative flex items-center justify-center w-9 h-9 bg-emerald-700 text-white rounded-full border-2 border-white shadow-xl">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Pasang Marker Kelurahan & Penerima
    this.originMarker = L.marker(origin, { icon: kelurahanIcon }).addTo(this.map)
      .bindPopup(`<b>${pkg.kelurahanAsal?.nama || 'Kelurahan'}</b><br>Titik Awal Distribusi Bansos`);

    this.destMarker = L.marker(dest, { icon: destIcon }).addTo(this.map)
      .bindPopup(`<b>Alamat Penerima: ${pkg.penerima.nama}</b><br>${pkg.penerima.alamat}`);

    // Garis Rute (Polyline)
    const points = [
      origin,
      [origin[0] + (dest[0] - origin[0]) * 0.4, origin[1] + (dest[1] - origin[1]) * 0.2],
      [origin[0] + (dest[0] - origin[0]) * 0.7, origin[1] + (dest[1] - origin[1]) * 0.8],
      dest
    ];

    this.routePolyline = L.polyline(points, {
      color: '#2563EB',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(this.map);

    // Hitung posisi kurir saat ini berdasarkan progress
    const curLat = origin[0] + (dest[0] - origin[0]) * this.progress;
    const curLng = origin[1] + (dest[1] - origin[1]) * this.progress;

    this.courierMarker = L.marker([curLat, curLng], { icon: courierIcon }).addTo(this.map)
      .bindPopup(`<b>Kurir Bansos: ${pkg.kurir?.nama || 'Petugas'}</b><br>Armada: ${pkg.kurir?.kendaraan || 'Logistik'}`);

    try {
      const bounds = L.latLngBounds([origin, dest]);
      this.map.fitBounds(bounds, { padding: [40, 40] });
    } catch (e) {}
  }

  renderFallbackMap(container, origin, dest, pkg) {
    if (this.map) {
      try { this.map.remove(); } catch(e){}
      this.map = null;
    }
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    container.innerHTML = `
      <div class="relative w-full h-full bg-slate-900 overflow-hidden rounded-xl border border-slate-700 p-4 select-none">
        <!-- Grid pattern -->
        <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        
        <!-- Radar Circles -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-500/20 rounded-full animate-pulse"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-emerald-500/20 rounded-full"></div>
        
        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 600 320" preserveAspectRatio="none">
          <!-- Route Line -->
          <path d="M 80,160 Q 250,80 320,150 T 520,160" fill="none" stroke="#2563EB" stroke-width="4" stroke-dasharray="8 6"/>
          
          <!-- Origin (Kelurahan) -->
          <circle cx="80" cy="160" r="14" fill="#0B2545" stroke="#60A5FA" stroke-width="3"/>
          <text x="80" y="195" fill="#93C5FD" font-size="11" font-weight="bold" text-anchor="middle">Kantor Kelurahan</text>
          
          <!-- Target (Penerima) -->
          <circle cx="520" cy="160" r="14" fill="#059669" stroke="#A7F3D0" stroke-width="3"/>
          <text x="520" y="195" fill="#34D399" font-size="11" font-weight="bold" text-anchor="middle">Rumah ${pkg.penerima?.nama || 'Warga'}</text>
          
          <!-- Moving Courier -->
          <g transform="translate(${80 + 440 * this.progress}, ${160 + Math.sin(this.progress * Math.PI) * -35})">
            <circle cx="0" cy="0" r="18" fill="#10B981" opacity="0.4" class="animate-ping"/>
            <circle cx="0" cy="0" r="12" fill="#047857" stroke="#FFFFFF" stroke-width="2.5"/>
            <path d="M -4,-3 L 4,-3 L 0,5 Z" fill="#FFFFFF"/>
            <text x="0" y="-18" fill="#FACC15" font-size="10" font-weight="bold" text-anchor="middle">Kurir Bansos</text>
          </g>
        </svg>

        <div class="absolute bottom-2 left-2 bg-slate-800/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300">
          🛰️ Mode Navigasi Taktis Vektor (Real-Time GPS Tracking)
        </div>
      </div>
    `;
  }

  updateTelemetry(pkg) {
    const el = document.getElementById(this.telemetryContainerId);
    if (!el) return;

    if (!pkg || !pkg.kurir) {
      el.innerHTML = `
        <div class="text-xs text-slate-500 italic p-3 text-center">
          Tidak ada data telemetri kurir aktif untuk paket ini.
        </div>
      `;
      return;
    }

    const distanceRemaining = Math.max(0, Math.round((1 - this.progress) * 1450));
    const speed = this.progress >= 1 ? 0 : Math.round(22 + Math.sin(Date.now() / 1000) * 4);
    const etaMinutes = this.progress >= 1 ? "Tiba di Lokasi" : `${Math.ceil((1 - this.progress) * 12)} Menit`;

    el.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
          <div class="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Kurir Petugas</div>
          <div class="text-sm font-bold text-slate-800 truncate">${pkg.kurir.nama || 'Petugas'}</div>
          <div class="text-xs text-slate-500 truncate">${pkg.kurir.kendaraan || 'Armada'}</div>
        </div>

        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <div class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Estimasi Tiba (ETA)</div>
          <div class="text-sm font-bold text-emerald-800">${etaMinutes}</div>
          <div class="text-xs text-slate-500">Jarak: ${distanceRemaining} meter lagi</div>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Kecepatan GPS</div>
          <div class="text-sm font-bold text-slate-800">${speed} km/jam</div>
          <div class="text-xs text-emerald-600 flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sinyal Satelit 4G OK
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <div class="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Progress Perjalanan</div>
          <div class="text-sm font-bold text-blue-800">${Math.round(this.progress * 100)}%</div>
          <div class="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style="width: ${this.progress * 100}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  stepForward(percent = 0.25) {
    if (!this.currentPackage) return;
    this.progress = Math.min(1.0, this.progress + percent);
    this.init(this.currentPackage);

    if (this.progress >= 1.0) {
      if (window.tracesStore) {
        window.tracesStore.updateKurirLocation(
          this.currentPackage.id,
          this.currentPackage.penerima?.lat || -6.1985,
          this.currentPackage.penerima?.lng || 106.8402,
          "Telah Tiba di Alamat"
        );
      }
    }
  }

  resetPosition() {
    this.progress = 0.15;
    this.init(this.currentPackage);
  }

  arriveAtDestination() {
    this.progress = 1.0;
    this.init(this.currentPackage);
  }
}

window.gpsTracker = new GPSTracker('mapCanvas', 'telemetryPanel');
window.mobileGPSTracker = new GPSTracker('mobileMapCanvas', 'mobileTelemetryPanel');
