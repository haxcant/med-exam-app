# v0.1.27 Mobile Empty Screen Fix

## Problem
On mobile refresh, the page could show only the title, cloud sync panel, and an empty-state message while the main controls were hidden. This happened when the page kept `quiz-mode-active` chrome state although no valid visible quiz UI was rendered.

## Fixes

1. Added `empty-mode` UI state.
   - Empty state now explicitly removes quiz chrome and restores controls/stat/info panels.

2. Added session validation and repair.
   - Removes stale question IDs from saved sessions.
   - Discards empty or incompatible old sessions safely.
   - Does not clear learning progress, wrong book, scores, or cloud data.

3. Added rescue buttons in the empty-state card.
   - `開始練習`
   - `解除卡住狀態`

4. Added mobile recovery guard.
   - On `pageshow`, `focus`, and visibility return, if the page is empty but still in quiz mode, it resets the chrome to idle.

5. Updated service worker/cache busting to v0.1.27.

## Files changed

- `app.js`
- `index.html`
- `styles.css`
- `service-worker.js`

## Verification

- `node --check app.js` passed.

## Notes

This patch does not modify `med_questions.js`, Firebase files, Firestore rules, admin files, or user data schema.
