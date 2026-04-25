# v0.1.22 AI 查證外跳按鈕 Patch

## 修改範圍

本 patch 只修改：

- `app.js`
- `index.html`
- `service-worker.js`
- `AI_VERIFY_BUTTONS_REPORT_v022.md`

沒有修改題庫資料、Firebase、Firestore rules、admin、同步、錯題本資料結構或 localStorage key。

## 新增功能

在題目作答畫面與詳解查證工具列中，於「搜尋此題」右側新增三個簡短按鈕：

- `GPT`：嘗試以 ChatGPT URL query 開啟查證 prompt。
- `Gemini`：開啟 Gemini，並先將完整查證 prompt 複製到剪貼簿；若 Gemini 未自動帶入，可直接貼上。
- `Perp`：嘗試以 Perplexity Search URL query 開啟查證 prompt。

## Prompt 內容

外跳 AI 時會組合目前題目的：

- 題目 ID
- 題幹／原文
- 選項
- 題庫答案
- 題庫來源與網頁來源
- 目前題庫註解
- 要求 AI 回覆的 11 點格式：
  1. 正確答案與原文定位
  2. 詞句註釋
  3. 白話翻譯
  4. 辨證要點
  5. 病機
  6. 方子性質
  7. 治法
  8. 方義
  9. 關鍵字記憶點
  10. 可疑錯誤／需人工審閱處
  11. 參考來源

## 計時行為

使用任一 AI 查證按鈕時，若目前有作答倒數或下一題倒數，會自動呼叫既有 `pauseActiveTimer()` 暫停計時。

## 相容性說明

- ChatGPT 與 Perplexity 會嘗試用 URL query 帶入 prompt。
- Gemini Web 對 URL 預填 prompt 的支援不穩定，因此本版採「先複製完整 prompt，再開啟 Gemini」的保守方案。
- 若瀏覽器封鎖外部彈窗，會嘗試把 prompt 複製到剪貼簿，並提示使用者手動貼上。

## 驗證

已執行：

```powershell
node --check app.js
node --check service-worker.js
```

兩者皆通過語法檢查。
