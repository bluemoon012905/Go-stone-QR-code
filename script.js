const form = document.querySelector('#qr-form');
const urlInput = document.querySelector('#url-input');
const message = document.querySelector('#message');
const downloadBtn = document.querySelector('#download-btn');
const canvas = document.querySelector('#qr-canvas');
const ctx = canvas.getContext('2d');

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
  message.textContent = 'QR generation will be added next.';
});

downloadBtn.addEventListener('click', () => {
  message.textContent = 'Generate a QR code before downloading.';
});

drawPlaceholder();
