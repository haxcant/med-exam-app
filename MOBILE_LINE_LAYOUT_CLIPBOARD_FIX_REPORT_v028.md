# v0.1.28 Mobile LINE Layout + AI Clipboard Toggle Fix

## 目的

修正手機／LINE 內建瀏覽器刷新後可能只剩黑畫面、作答後詳解區撐開但視窗仍停在原位置、查證按鈕過大，以及新增是否自動複製 AI 查證 prompt 的控制。

## 修改檔案

- `app.js`
- `index.html`
- `styles.css`
- `service-worker.js`

## 主要修正

1. **LINE / 手機空畫面恢復機制加強**
   - 增加 MutationObserver、focus、pageshow、resize 與定期守衛。
   - 若偵測到畫面沒有題目 UI、但控制區被隱藏，會顯示固定在底部的救援列：`開始`、`解除`。
   - `解除` 只清目前卡住題組 session，不會清錯題本、積分、Firebase 記憶。

2. **作答後自動捲到詳解區**
   - 手機或詳解內容較長時，作答後自動將視窗捲到 feedback / explanation 區域，避免頁面變長但使用者停在原位置。

3. **手機版查證工具按鈕縮小**
   - `搜尋此題`、`醫宗`、`GPT`、`Gemini`、`Perp`、`Grok`、`不會` 在手機版更緊湊。
   - 防止長 URL、長註解、長方名造成橫向撐版。

4. **新增 AI 複製 prompt 開關**
   - 在查證按鈕旁新增 `複製` checkbox。
   - 預設開啟。
   - 關閉後，AI 外跳仍會開頁與帶短版 URL query，但不會呼叫剪貼簿 API。
   - 設定會寫入 `med-exam-settings-v1`，重新整理後保留。

5. **快取版本更新**
   - `index.html` 與 `service-worker.js` 改為 `20260425ui28` / `v0.1.28`，避免手機繼續吃舊版快取。

## 驗證

- `node --check app.js` 通過。

## 注意

此 patch 沒有修改：

- `med_questions.js`
- `firebase-init.js`
- `firebase-backup.js`
- `firebase-ui.js`
- `firestore.rules`
- `admin.js`
- `admin.html`
