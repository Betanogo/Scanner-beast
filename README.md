# Scanner beast

CamScanner-style document scanner that runs entirely in the browser (installable PWA).

- Opens on a library of saved scans (default: newest first; sort by name or size, top right)
- **Scan** opens the phone's own camera app; after the photo, the app finds the paper and
  shows the four corners (좌상/우상/우하/좌하) with a magnifier for fine adjustment
- **Scan it** flattens the perspective, removes shadows/uneven light and gives a clean scan
  (Magic color / B&W document / Gray / Original)
- Detection and post-processing use OpenCV.js (loaded once, then cached for offline use);
  a pure-JS fallback is used if OpenCV cannot be loaded
- Multi-page documents, rename / reorder / delete, export to PDF / JPG / PNG
- Scans are stored locally in the browser (IndexedDB)

Needs https (GitHub Pages works) for install and offline use.
