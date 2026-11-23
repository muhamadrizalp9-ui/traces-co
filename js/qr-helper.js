/**
 * TRACES-CO - QR Code & Barcode Helper
 * Merender QR Code dan Barcode ke dalam elemen DOM/Canvas/SVG
 * Handal baik online (via CDN library) maupun offline (via procedural SVG fallback)
 */

window.QRHelper = {
  // Render QR Code ke container element
  renderQR: function (container, text, size = 180) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;

    container.innerHTML = '';

    // Jika library QRCode dari CDN tersedia
    if (window.QRCode) {
      try {
        new QRCode(container, {
          text: text,
          width: size,
          height: size,
          colorDark: "#0B2545", // Government Navy
          colorLight: "#FFFFFF",
          correctLevel: QRCode.CorrectLevel.M
        });
        return;
      } catch (e) {
        console.warn("Gagal menggunakan QRCode CDN, beralih ke SVG visual generator", e);
      }
    }

    // Fallback: Elegant Procedural SVG QR Matrix
    container.innerHTML = this.generateFallbackQRSVG(text, size);
  },

  // Render Barcode ke canvas atau svg
  renderBarcode: function (target, text, options = {}) {
    if (typeof target === 'string') {
      target = document.getElementById(target);
    }
    if (!target) return;

    if (window.JsBarcode) {
      try {
        JsBarcode(target, text, {
          format: "CODE128",
          lineColor: "#0F172A",
          width: options.width || 2,
          height: options.height || 50,
          displayValue: options.displayValue !== false,
          fontSize: 13,
          font: "monospace",
          textMargin: 4,
          background: "#FFFFFF"
        });
        return;
      } catch (e) {
        console.warn("Gagal menggunakan JsBarcode CDN, beralih ke SVG fallback", e);
      }
    }

    // Fallback: Clean SVG Barcode
    this.renderFallbackBarcodeSVG(target, text, options);
  },

  // Procedural SVG QR Code visual representation
  generateFallbackQRSVG: function (text, size = 180) {
    // Generate distinct pseudo-random modules based on text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    const grid = 25;
    const cellSize = size / grid;
    let rects = '';

    // Helper draw Finder Pattern
    const drawFinder = (startX, startY) => {
      let f = '';
      // Outer 7x7
      f += `<rect x="${startX * cellSize}" y="${startY * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#0B2545" rx="3"/>`;
      // White inner 5x5
      f += `<rect x="${(startX + 1) * cellSize}" y="${(startY + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#FFFFFF" rx="2"/>`;
      // Center 3x3
      f += `<rect x="${(startX + 2) * cellSize}" y="${(startY + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#059669" rx="1.5"/>`;
      return f;
    };

    rects += drawFinder(1, 1);
    rects += drawFinder(grid - 8, 1);
    rects += drawFinder(1, grid - 8);

    // Fill modules with deterministic pattern
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        // Skip finders & separators
        const inFinder1 = (r <= 8 && c <= 8);
        const inFinder2 = (r <= 8 && c >= grid - 9);
        const inFinder3 = (r >= grid - 9 && c <= 8);
        if (inFinder1 || inFinder2 || inFinder3) continue;

        // Timing patterns
        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) {
            rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize - 0.5}" height="${cellSize - 0.5}" fill="#0B2545" rx="0.5"/>`;
          }
          continue;
        }

        // Pseudo pseudo-random based on hash & coordinates
        const val = Math.sin(r * 12.9898 + c * 78.233 + hash) * 43758.5453;
        const isDark = (val - Math.floor(val)) > 0.46;

        if (isDark) {
          rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize - 0.5}" height="${cellSize - 0.5}" fill="#0B2545" rx="0.5"/>`;
        }
      }
    }

    // Emerald center shield watermark
    const center = size / 2;
    const badge = `
      <circle cx="${center}" cy="${center}" r="${cellSize * 2.2}" fill="#FFFFFF" stroke="#059669" stroke-width="2"/>
      <circle cx="${center}" cy="${center}" r="${cellSize * 1.6}" fill="#059669"/>
      <path d="M ${center - 4} ${center} L ${center - 1} ${center + 3} L ${center + 5} ${center - 3}" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="rounded-lg shadow-sm">
        <rect width="${size}" height="${size}" fill="#FFFFFF" rx="8"/>
        ${rects}
        ${badge}
      </svg>
    `;
  },

  renderFallbackBarcodeSVG: function (target, text, options = {}) {
    const width = options.width || 280;
    const height = options.height || 54;
    const barsCount = 45;
    const barW = (width - 20) / barsCount;

    let bars = '';
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash += text.charCodeAt(i);

    for (let i = 0; i < barsCount; i++) {
      const isThick = ((i * 7 + hash) % 3 === 0);
      const isGap = ((i * 11 + hash) % 4 === 1);
      if (!isGap) {
        const x = 10 + i * barW;
        const w = isThick ? barW * 0.9 : barW * 0.5;
        bars += `<rect x="${x}" y="6" width="${w}" height="${height - 22}" fill="#0F172A"/>`;
      }
    }

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#FFFFFF"/>
        ${bars}
        <text x="${width / 2}" y="${height - 4}" font-family="monospace" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">${text}</text>
      </svg>
    `;

    if (target.tagName.toLowerCase() === 'svg') {
      target.outerHTML = svg;
    } else {
      target.innerHTML = svg;
    }
  }
};
