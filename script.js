const form = document.querySelector('#qr-form');
const urlInput = document.querySelector('#url-input');
const styleSelect = document.querySelector('#style-select');
const boardSelect = document.querySelector('#board-select');
const logoSelect = document.querySelector('#logo-select');
const logoUploadRow = document.querySelector('#logo-upload-row');
const logoUploadInput = document.querySelector('#logo-upload');
const logoSizeInput = document.querySelector('#logo-size');
const message = document.querySelector('#message');
const downloadBtn = document.querySelector('#download-btn');
const canvas = document.querySelector('#qr-canvas');
const qrFrame = document.querySelector('#qr-frame');
const ctx = canvas.getContext('2d');

const STYLE_MAP = {
  simple: {
    dark: '#101010',
    light: '#ffffff',
    edge: '#d6c39a',
    darkHighlight: 'rgba(255, 255, 255, 0.18)',
    darkRing: 'rgba(255, 255, 255, 0.14)',
    lightHighlight: 'rgba(255, 255, 255, 0.95)',
    lightShadow: 'rgba(120, 120, 120, 0.18)',
    veins: false,
  },
  shell: {
    dark: '#2d2824',
    light: '#fff7ea',
    edge: '#ceb078',
    darkHighlight: 'rgba(255, 232, 212, 0.34)',
    darkRing: 'rgba(255, 251, 244, 0.2)',
    lightHighlight: 'rgba(255, 255, 255, 0.98)',
    lightShadow: 'rgba(199, 173, 134, 0.28)',
    veins: true,
  },
  slate: {
    dark: '#262d34',
    light: '#edf1f5',
    edge: '#a9b3bf',
    darkHighlight: 'rgba(255, 255, 255, 0.24)',
    darkRing: 'rgba(255, 255, 255, 0.16)',
    lightHighlight: 'rgba(255, 255, 255, 0.96)',
    lightShadow: 'rgba(141, 157, 173, 0.24)',
    veins: false,
  },
};

const BOARD_MAP = {
  bamboo: {
    border: '#bc9354',
    background:
      'linear-gradient(145deg, #f3d493, #e0b56b), repeating-linear-gradient(10deg, rgba(107, 69, 22, 0.1) 0 2px, rgba(255,255,255,0) 2px 10px)',
  },
  maple: {
    border: '#bb8e63',
    background:
      'linear-gradient(145deg, #efc9a5, #dca47a), repeating-linear-gradient(12deg, rgba(122, 76, 42, 0.09) 0 2px, rgba(255,255,255,0) 2px 10px)',
  },
  walnut: {
    border: '#725338',
    background:
      'linear-gradient(150deg, #a5774f, #7f5537), repeating-linear-gradient(8deg, rgba(50, 29, 16, 0.18) 0 2px, rgba(255,255,255,0) 2px 10px)',
  },
};

const SHELL_WHITE_TEXTURES = Array.from({ length: 14 }, (_, index) => `go-stones/w${index + 1}.png`);
const TEXTURE_FILES = {
  black: 'go-stones/b.png',
  slateWhite: 'go-stones/w.png',
  shellWhite: SHELL_WHITE_TEXTURES,
};

let lastUrl = '';
let lastQr = null;
let logoImage = null;
let logoObjectUrl = '';
let textureError = false;
const textureImages = {
  black: null,
  slateWhite: null,
  shellWhite: [],
};

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
  const errorLevel = logoSelect.value === 'none' ? 'M' : 'H';
  const qr = qrcode(0, errorLevel);
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

function applyBoardTheme(boardName) {
  const board = BOARD_MAP[boardName] || BOARD_MAP.bamboo;
  qrFrame.style.background = board.background;
  qrFrame.style.borderColor = board.border;
}

function drawSimpleStone(x, y, size, theme, dark) {
  const radius = size * 0.44;
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const startColor = dark ? theme.darkHighlight : theme.lightHighlight;
  const midColor = dark ? theme.dark : theme.light;
  const edgeColor = dark ? '#050505' : '#dfe5e2';

  const base = ctx.createRadialGradient(
    centerX - radius * 0.35,
    centerY - radius * 0.35,
    radius * 0.2,
    centerX,
    centerY,
    radius,
  );
  base.addColorStop(0, startColor);
  base.addColorStop(0.7, midColor);
  base.addColorStop(1, edgeColor);

  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = dark ? theme.darkRing : theme.lightShadow;
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.92, 0, Math.PI * 2);
  ctx.stroke();

  if (!dark || !theme.veins) return;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.17)';
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.55, 0.8, 2.4);
  ctx.stroke();
}

function drawTexturedStone(x, y, size, image, edgeColor) {
  const radius = size * 0.44;
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  if (!image) {
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, x + size * 0.06, y + size * 0.06, size * 0.88, size * 0.88);
  ctx.restore();

  const gloss = ctx.createRadialGradient(
    centerX - radius * 0.45,
    centerY - radius * 0.45,
    radius * 0.12,
    centerX,
    centerY,
    radius,
  );
  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
  gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.92, 0, Math.PI * 2);
  ctx.stroke();
}

function randomShellTexture() {
  const shells = textureImages.shellWhite;
  if (shells.length === 0) return null;
  const index = Math.floor(Math.random() * shells.length);
  return shells[index];
}

function drawCenterLogo(cellCount, cellSize, theme) {
  if (logoSelect.value === 'none') return;
  if (logoSelect.value === 'upload' && !logoImage) return;

  const logoSizePercent = Number(logoSizeInput.value);
  const qrPixelSize = cellCount * cellSize;
  const logoSize = (qrPixelSize * logoSizePercent) / 100;
  const center = canvas.width / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.arc(center, center, logoSize * 0.56, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = theme.edge;
  ctx.lineWidth = Math.max(2, cellSize * 0.28);
  ctx.beginPath();
  ctx.arc(center, center, logoSize * 0.56, 0, Math.PI * 2);
  ctx.stroke();

  if (logoSelect.value === 'badge') {
    ctx.fillStyle = theme.dark;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.floor(logoSize * 0.48)}px "Marcellus", serif`;
    ctx.fillText('GO', center, center + logoSize * 0.03);
    return;
  }

  const imageSize = logoSize * 0.82;
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, imageSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(logoImage, center - imageSize / 2, center - imageSize / 2, imageSize, imageSize);
  ctx.restore();
}

function drawQr(qr, styleName) {
  const theme = STYLE_MAP[styleName] || STYLE_MAP.simple;
  const quietZone = 4;
  const cellCount = qr.getModuleCount();
  const totalCells = cellCount + quietZone * 2;
  const cellSize = canvas.width / totalCells;

  applyBoardTheme(boardSelect.value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < cellCount; row += 1) {
    for (let col = 0; col < cellCount; col += 1) {
      const x = (col + quietZone) * cellSize;
      const y = (row + quietZone) * cellSize;
      const isDark = qr.isDark(row, col);

      if (isFinderCell(row, col, cellCount)) {
        ctx.fillStyle = isDark ? theme.dark : '#ffffff';
        ctx.fillRect(x, y, cellSize, cellSize);
        continue;
      }

      if (styleName === 'simple' || textureError) {
        drawSimpleStone(x, y, cellSize, theme, isDark);
        continue;
      }

      if (styleName === 'shell') {
        if (isDark) {
          drawTexturedStone(x, y, cellSize, textureImages.black, 'rgba(255, 255, 255, 0.25)');
        } else {
          drawTexturedStone(x, y, cellSize, randomShellTexture(), 'rgba(196, 178, 146, 0.42)');
        }
        continue;
      }

      if (styleName === 'slate') {
        if (isDark) {
          drawTexturedStone(x, y, cellSize, textureImages.black, 'rgba(255, 255, 255, 0.22)');
        } else {
          drawTexturedStone(x, y, cellSize, textureImages.slateWhite, 'rgba(170, 170, 170, 0.34)');
        }
      }
    }
  }

  drawCenterLogo(cellCount, cellSize, theme);
}

function drawPlaceholder() {
  applyBoardTheme(boardSelect.value);
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

function rebuildAndRenderFromState() {
  if (!lastUrl) return;
  lastQr = buildQrCode(lastUrl);
  renderFromState();
}

function loadLogoImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({ img, objectUrl });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };

    img.src = objectUrl;
  });
}

function loadTexture(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${path}`));
    img.src = path;
  });
}

async function preloadTextures() {
  try {
    const [black, slateWhite, ...shells] = await Promise.all([
      loadTexture(TEXTURE_FILES.black),
      loadTexture(TEXTURE_FILES.slateWhite),
      ...TEXTURE_FILES.shellWhite.map((path) => loadTexture(path)),
    ]);

    textureImages.black = black;
    textureImages.slateWhite = slateWhite;
    textureImages.shellWhite = shells;
  } catch {
    textureError = true;
    message.textContent = 'Texture images could not be loaded. Falling back to simple stones.';
  }
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
  message.textContent = `Generated ${styleSelect.value} stones on ${boardSelect.value} board for ${normalized}`;
});

styleSelect.addEventListener('change', () => {
  if (!lastQr) return;
  renderFromState();
  message.textContent = `Switched stone style to ${styleSelect.value}`;
});

boardSelect.addEventListener('change', () => {
  renderFromState();
  if (lastQr) {
    message.textContent = `Switched board to ${boardSelect.value}`;
  }
});

logoSelect.addEventListener('change', () => {
  logoUploadRow.hidden = logoSelect.value !== 'upload';
  rebuildAndRenderFromState();

  if (!lastQr) return;
  if (logoSelect.value === 'upload' && !logoImage) {
    message.textContent = 'Upload an image to place your logo in the center.';
    return;
  }

  message.textContent = logoSelect.value === 'none' ? 'Center logo removed.' : `Center logo set to ${logoSelect.value}`;
});

logoSizeInput.addEventListener('input', () => {
  if (!lastQr || logoSelect.value === 'none') return;
  renderFromState();
});

logoUploadInput.addEventListener('change', async () => {
  const [file] = logoUploadInput.files;
  if (!file) {
    logoImage = null;
    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl);
      logoObjectUrl = '';
    }
    rebuildAndRenderFromState();
    return;
  }

  try {
    const { img, objectUrl } = await loadLogoImage(file);

    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl);
    }

    logoObjectUrl = objectUrl;
    logoImage = img;

    rebuildAndRenderFromState();
    if (lastQr && logoSelect.value === 'upload') {
      message.textContent = 'Uploaded logo and applied it to the center.';
    }
  } catch {
    logoImage = null;
    message.textContent = 'Logo image could not be loaded. Please try another file.';
  }
});

downloadBtn.addEventListener('click', () => {
  if (!lastQr) {
    message.textContent = 'Generate a QR code before downloading.';
    return;
  }

  const anchor = document.createElement('a');
  anchor.download = `go-stone-qr-${styleSelect.value}-${boardSelect.value}.png`;
  anchor.href = canvas.toDataURL('image/png');
  anchor.click();
});

drawPlaceholder();
preloadTextures().then(() => {
  if (lastQr) renderFromState();
});
