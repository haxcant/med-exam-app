# med-exam-app v0.1.4 patch

這是覆蓋用 patch，不包含 `firebase-init.js`，避免覆蓋你已經改好的新 Firebase 專案設定。

請將本資料夾內檔案覆蓋到你的 `med-exam-app/` 專案根目錄：

- `app.js`
- `index.html`
- `firebase-ui.js`
- `service-worker.js`
- `CHANGELOG.md`

覆蓋後執行：

```powershell
git status
git add app.js index.html firebase-ui.js service-worker.js CHANGELOG.md
git commit -m "Improve wrong-book export import and sync reminders"
git push
```

部署後請清除 PWA 快取：

```text
F12 → Application → Service Workers → Unregister
F12 → Application → Storage / Clear storage → Clear site data
```

再用 `?v=014` 開啟測試。
