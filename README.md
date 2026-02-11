# Go Stone QR Generator

A lightweight static web app that turns any link into a QR code with Go-stone inspired rendering styles.

## Features

- Generate QR codes from links (auto-adds `https://` when missing).
- Toggle styles: `simple`, `shell`, `jade`, `slate`.
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

1. Push this repo to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `Source: GitHub Actions`.
4. Push to `main` (or run the workflow manually from `Actions`).

After workflow success, your site will be available at:

- `https://<your-username>.github.io/<your-repo>/`

## Project structure

- `index.html`: app markup.
- `styles.css`: responsive styling and layout.
- `script.js`: URL validation, QR generation, style rendering, download logic.
- `.github/workflows/deploy.yml`: automated GitHub Pages deploy.

## Notes

- The app uses the `qrcode-generator` browser library from CDN.
- Finder patterns remain square for better scan reliability while other dark modules are rendered as stones.
