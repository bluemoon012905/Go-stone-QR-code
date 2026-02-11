const form = document.querySelector('#qr-form');
const urlInput = document.querySelector('#url-input');
const styleSelect = document.querySelector('#style-select');
const message = document.querySelector('#message');
const downloadBtn = document.querySelector('#download-btn');
const canvas = document.querySelector('#qr-canvas');
const ctx = canvas.getContext('2d');

let hasQr = false;

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

function drawQr(qr, palette) {
  const quietZone = 4;
  const cellCount = qr.getModuleCount();
  const totalCells = cellCount + quietZone * 2;
  const cellSize = canvas.width / totalCells;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = palette.light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < cellCount; row += 1) {
    for (let col = 0; col < cellCount; col += 1) {
      if (!qr.isDark(row, col)) continue;
      ctx.fillStyle = palette.dark;
      ctx.fillRect((col + quietZone) * cellSize, (row + quietZone) * cellSize, cellSize, cellSize);
    }
  }
}

function buildQrCode(url) {
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  return qr;
}

function drawPlaceholder() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2c2c2c';
  ctx.font = '600 24px "Source Sans 3", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Enter a link to generate QR', canvas.width / 2, canvas.height / 2);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const normalized = normalizeUrl(urlInput.value);
  if (!normalized) {
    hasQr = false;
    drawPlaceholder();
    message.textContent = 'Please provide a valid link.';
    return;
  }

  const qr = buildQrCode(normalized);
  drawQr(qr, { dark: '#111111', light: '#ffffff' });
  hasQr = true;

  urlInput.value = normalized;
  message.textContent = `Generated QR code for ${normalized}`;
});

downloadBtn.addEventListener('click', () => {
  if (!hasQr) {
    message.textContent = 'Generate a QR code before downloading.';
    return;
  }

  const anchor = document.createElement('a');
  anchor.download = 'go-stone-qr.png';
  anchor.href = canvas.toDataURL('image/png');
  anchor.click();
});

styleSelect.addEventListener('change', () => {
  if (!hasQr) return;
  form.requestSubmit();
});

drawPlaceholder();
