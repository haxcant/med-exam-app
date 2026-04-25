# v0.1.29 Web Empty Screen / No Response Full Fix

## Root cause found in uploaded zip

The uploaded working tree had many tracked runtime files deleted from the visible folder. The critical missing files included:

- `index.html`
- `styles.css`
- `med_questions.js`
- `service-worker.js`
- `manifest.webmanifest`
- `icons/icon-192.png`, `icons/icon-512.png`
- Firebase browser modules such as `firebase-init.js`, `firebase-ui.js`, `firebase-backup.js`

Only `app.js`, `admin.js`, `admin.html`, and `assets/` were present at the top level. This is enough to cause a blank page, a non-responsive start button, failed PWA install/cache, or 404 script loading errors on GitHub Pages / static hosting.

## Repairs applied

1. Restored the full tracked project from the bundled Git repository (`HEAD`, v0.1.28 baseline).
2. Verified that all `index.html` local script/style/icon/manifest references exist.
3. Verified that all `service-worker.js` `CORE_ASSETS` local references exist.
4. Parsed main non-module scripts with Node:
   - `app.js`
   - `med_questions.js`
   - `memory-bridge.js`
   - `service-worker.js`
5. Parsed Firebase/admin ES modules with Node VM module parser:
   - `admin.js`
   - `firebase-init.js`
   - `firebase-auth.js`
   - `firebase-access.js`
   - `firebase-backup.js`
   - `firebase-sync-smoke.js`
   - `firebase-ui.js`
6. Bumped web cache identifiers from v0.1.28 to v0.1.29 / `20260425fix29`.
7. Added an emergency boot guard in `index.html`: if the main app API does not load, it shows visible recovery buttons instead of leaving a silent blank page. The recovery button unregisters Service Workers, deletes Cache Storage entries, and reloads with a cache-busting query string.

## Files changed by this fix

- Restored deleted tracked files from Git.
- Modified:
  - `index.html`
  - `service-worker.js`
  - `WEB_EMPTY_SCREEN_FULL_FIX_v029.md`

## Deployment notes

Upload the contents of this folder as the site root. Do not upload only `app.js`. For GitHub Pages, `index.html` must be at repository root or the configured Pages root.

After deploying, open:

```text
https://your-site/index.html?v=20260425fix29
```

If a phone still shows a stale blank page, use the new `清快取並重新載入` recovery button or clear site data once.
