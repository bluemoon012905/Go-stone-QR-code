const form = document.querySelector('#qr-form');
const urlInput = document.querySelector('#url-input');
const styleSelect = document.querySelector('#style-select');
const message = document.querySelector('#message');
const downloadBtn = document.querySelector('#download-btn');
const canvas = document.querySelector('#qr-canvas');
const qrFrame = document.querySelector('#qr-frame');
const ctx = canvas.getContext('2d');

const STYLE_MAP = {
  simple: {
    dark: '#101010',
    light: '#ffffff',
    frame: '#f5efe1',
    edge: '#d6c39a',
    highlight: 'rgba(255, 255, 255, 0.18)',
    ring: 'rgba(255, 255, 255, 0.14)',
    veins: false,
  },
  shell: {
    dark: '#2d2824',
    light: '#fff7ea',
    frame: '#f2e1bc',
    edge: '#ceb078',
    highlight: 'rgba(255, 232, 212, 0.34)',
    ring: 'rgba(255, 251, 244, 0.2)',
    veins: true,
  },
  jade: {
    dark: '#0f4736',
    light: '#edf9f4',
    frame: '#d9f0e6',
    edge: '#93c8b2',
    highlight: 'rgba(197, 255, 228, 0.35)',
    ring: 'rgba(231, 255, 245, 0.18)',
    veins: true,
  },
  slate: {
    dark: '#262d34',
    light: '#e9edf1',
    frame: '#d8dde4',
    edge: '#a9b3bf',
    highlight: 'rgba(255, 255, 255, 0.24)',
    ring: 'rgba(255, 255, 255, 0.16)',
    veins: false,
  },
};

let lastUrl = '';
let lastQr = null;

function normalizeUrl(raw) {
  const value = raw.trim();
  if (!value) return null;

  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(`https://${value}`).toString();
    } catch {
      return null;
    }
  }
}

function buildQrCode(url) {
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  return qr;
}

function isFinderCell(row, col, count) {
  const topLeft = row < 7 && col < 7;
  const topRight = row < 7 && col >= count - 7;
  const bottomLeft = row >= count - 7 && col < 7;
  return topLeft || topRight || bottomLeft;
}

function drawStone(x, y, size, theme) {
  const radius = size * 0.45;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  const base = ctx.createRadialGradient(
    centerX - radius * 0.35,
    centerY - radius * 0.35,
    radius * 0.2,
    centerX,
    centerY,
    radius,
  );
  base.addColorStop(0, theme.highlight);
  base.addColorStop(0.32, theme.dark);
  base.addColorStop(1, '#050505');

  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = theme.ring;
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  if (!theme.veins) return;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.17)';
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.55, 0.8, 2.4);
  ctx.stroke();
}

function drawQr(qr, styleName) {
  const theme = STYLE_MAP[styleName] || STYLE_MAP.simple;
  const quietZone = 4;
  const cellCount = qr.getModuleCount();
  const totalCells = cellCount + quietZone * 2;
  const cellSize = canvas.width / totalCells;

  qrFrame.style.backgroundColor = theme.frame;
  qrFrame.style.borderColor = theme.edge;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < cellCount; row += 1) {
    for (let col = 0; col < cellCount; col += 1) {
      if (!qr.isDark(row, col)) continue;
      const x = (col + quietZone) * cellSize;
      const y = (row + quietZone) * cellSize;

      if (isFinderCell(row, col, cellCount)) {
        ctx.fillStyle = theme.dark;
        ctx.fillRect(x, y, cellSize, cellSize);
        continue;
      }

      drawStone(x, y, cellSize, theme);
    }
  }
}

function drawPlaceholder() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2c2c2c';
  ctx.font = '600 24px "Source Sans 3", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Enter a link to generate QR', canvas.width / 2, canvas.height / 2);
}

function renderFromState() {
  if (!lastQr) {
    drawPlaceholder();
    return;
  }
  drawQr(lastQr, styleSelect.value);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const normalized = normalizeUrl(urlInput.value);
  if (!normalized) {
    lastQr = null;
    lastUrl = '';
    drawPlaceholder();
    message.textContent = 'Please provide a valid link.';
    return;
  }

  lastUrl = normalized;
  lastQr = buildQrCode(normalized);
  renderFromState();

  urlInput.value = normalized;
  message.textContent = `Generated ${styleSelect.value} style QR for ${normalized}`;
});

styleSelect.addEventListener('change', () => {
  if (!lastQr) return;
  renderFromState();
  message.textContent = `Switched to ${styleSelect.value} style`;
});

downloadBtn.addEventListener('click', () => {
  if (!lastQr) {
    message.textContent = 'Generate a QR code before downloading.';
    return;
  }

  const anchor = document.createElement('a');
  anchor.download = `go-stone-qr-${styleSelect.value}.png`;
  anchor.href = canvas.toDataURL('image/png');
  anchor.click();
});

drawPlaceholder();
