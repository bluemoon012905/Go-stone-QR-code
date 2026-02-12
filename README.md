# Go Stone QR Generator

A lightweight static web app that turns any link into a QR code with Go-stone inspired rendering styles.

## Features

- Generate QR codes from links (auto-adds `https://` when missing).
- Toggle styles: `simple`, `shell-slate` (slate black + shell white textures).
- Select board style beneath the QR: `bamboo`, `maple`, `walnut`, `black + white`.
- Add an optional center logo (`Go Badge` or uploaded image) with adjustable size.
- Render both dark and light QR modules as stones for a full-board look.
- Draw wood grain + Go board lines (with star points) so stones sit on visible intersections.
- Download generated QR as PNG.
- GitHub Pages deployment workflow included.

## Run locally

Because this is a static site, you can open `index.html` directly, or serve the folder with a local static server.

Example using Python:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy on GitHub Pages

This repository includes `.github/workflows/deploy.yml`.


## Project structure

- `index.html`: app markup.
- `styles.css`: responsive styling and layout.
- `script.js`: URL validation, QR generation, style/board rendering, texture loading, center logo logic, download logic.
- `.github/workflows/deploy.yml`: automated GitHub Pages deploy.

## Notes

- The app uses the `qrcode-generator` browser library from CDN.
- Finder patterns remain square for better scan reliability while other modules are rendered as stones.
- Logo overlays use higher QR error correction to preserve scan tolerance.
- Texture assets are loaded from `go-stones/` (`b.png` for black stones and `w1..w14` randomized for white shell stones).
