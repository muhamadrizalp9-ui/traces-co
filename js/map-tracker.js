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
          <p class="font-medium">Pilih paket dengan status "Dalam Pengiriman" untuk melihat modul GPS Live.</p>
        </div>
      `;
      this.updateTelemetry(null);
      return;
    }

    // Hitung posisi awal (Kelurahan) dan tujuan (Penerima)
    const origin = [pkg.kelurahanAsal.lat, pkg.kelurahanAsal.lng];
    const dest = [pkg.penerima.lat, pkg.penerima.lng];

    // Cek ketersediaan Leaflet
    if (window.L) {
      this.renderLeafletMap(container, origin, dest, pkg);
    } else {
      this.renderFallbackMap(container, origin, dest, pkg);
    }

    this.updateTelemetry(pkg);
  }

  renderLeafletMap(container, origin, dest, pkg) {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    container.innerHTML = '';

    const midLat = (origin[0] + dest[0]) / 2;
    const midLng = (origin[1] + dest[1]) / 2;

    this.map = L.map(this.mapContainerId, {
      zoomControl: true,
      attributionControl: false
    }).setView([midLat, midLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Custom Icon Posko Kelurahan
    const kelurahanIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-blue-900 text-white rounded-full border-2 border-white shadow-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Custom Icon Rumah Penerima
    const destIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-emerald-600 text-white rounded-full border-2 border-white shadow-lg animate-bounce">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Custom Icon Kurir Bansos dengan Radar Pulse
    const courierIcon = L.divIcon({
      className: 'custom-courier-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
          <div class="relative flex items-center justify-center w-11 h-11 bg-emerald-700 text-white rounded-full border-2 border-white shadow-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    // Pasang Marker Kelurahan & Penerima
    this.originMarker = L.marker(origin, { icon: kelurahanIcon }).addTo(this.map)
      .bindPopup(`<b>${pkg.kelurahanAsal.nama}</b><br>Titik Awal Distribusi Bansos`);

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
      weight: 5,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(this.map);

    // Hitung posisi kurir saat ini berdasarkan progress
    const curLat = origin[0] + (dest[0] - origin[0]) * this.progress;
    const curLng = origin[1] + (dest[1] - origin[1]) * this.progress;

    this.courierMarker = L.marker([curLat, curLng], { icon: courierIcon }).addTo(this.map)
      .bindPopup(`<b>Kurir Bansos: ${pkg.kurir?.nama || 'Petugas'}</b><br>Armada: ${pkg.kurir?.kendaraan || 'Logistik'}`);

    // Fit bounds
    const bounds = L.latLngBounds([origin, dest]);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  renderFallbackMap(container, origin, dest, pkg) {
    container.innerHTML = `
      <div class="relative w-full h-full bg-slate-900 overflow-hidden rounded-xl border border-slate-700 p-4 select-none">
        <!-- Grid pattern -->
        <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        
        <!-- Radar Circles -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-500/20 rounded-full animate-pulse"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-emerald-500/20 rounded-full"></div>
        
        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 600 350">
          <!-- Route Line -->
          <path d="M 80,180 Q 250,90 320,170 T 520,180" fill="none" stroke="#2563EB" stroke-width="4" stroke-dasharray="8 6"/>
          
          <!-- Origin (Kelurahan) -->
          <circle cx="80" cy="180" r="14" fill="#0B2545" stroke="#60A5FA" stroke-width="3"/>
          <text x="80" y="215" fill="#93C5FD" font-size="12" font-weight="bold" text-anchor="middle">Kantor Kelurahan</text>
          
          <!-- Target (Penerima) -->
          <circle cx="520" cy="180" r="16" fill="#059669" stroke="#A7F3D0" stroke-width="3"/>
          <text x="520" y="215" fill="#34D399" font-size="12" font-weight="bold" text-anchor="middle">Rumah ${pkg.penerima.nama}</text>
          
          <!-- Moving Courier -->
          <g transform="translate(${80 + 440 * this.progress}, ${180 + Math.sin(this.progress * Math.PI) * -35})">
            <circle cx="0" cy="0" r="20" fill="#10B981" opacity="0.4" class="animate-ping"/>
            <circle cx="0" cy="0" r="14" fill="#047857" stroke="#FFFFFF" stroke-width="2.5"/>
            <path d="M -5,-3 L 5,-3 L 0,6 Z" fill="#FFFFFF"/>
            <text x="0" y="-22" fill="#FACC15" font-size="11" font-weight="bold" text-anchor="middle">Kurir Bansos</text>
          </g>
        </svg>

        <div class="absolute bottom-3 left-3 bg-slate-800/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
          🛰️ Mode Navigasi Taktis Vektor (GPS Akurasi Tinggi)
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
          Tidak ada data telemetri kurir aktif.
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
          <div class="text-sm font-bold text-slate-800 truncate">${pkg.kurir.nama}</div>
          <div class="text-xs text-slate-500 truncate">${pkg.kurir.kendaraan}</div>
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

  // Aksi simulasi maju pergerakan kurir
  stepForward(percent = 0.25) {
    if (!this.currentPackage) return;
    this.progress = Math.min(1.0, this.progress + percent);
    this.init(this.currentPackage);

    if (this.progress >= 1.0) {
      if (window.tracesStore) {
        window.tracesStore.updateKurirLocation(
          this.currentPackage.id,
          this.currentPackage.penerima.lat,
          this.currentPackage.penerima.lng,
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
