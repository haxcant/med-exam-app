# v0.1.25 AI 查證 URL 預填修復與查證工具區塊簡化

## 修改範圍

只修改：

- `app.js`
- `index.html`
- `service-worker.js`

不修改：

- `med_questions.js`
- Firebase 相關檔案
- Firestore rules
- admin 相關檔案
- 題庫資料結構

## 修正內容

### 1. GPT / Perplexity 自動帶入失效修正

v0.1.24 的完整 AI 查證 prompt 太長，部分平台 URL query 會失效或被退回首頁，因此此版改成雙軌：

- 剪貼簿：仍複製完整 14 點查證 prompt。
- 外跳 URL：使用較短的 compact prompt，包含題目 ID、題幹、選項、暫定答案、來源線索與必要查證要求。

這樣可以提高 ChatGPT / Perplexity / Grok 用 URL query 自動帶入的成功率；即使平台不接受 URL 預填，完整 prompt 仍在剪貼簿，可直接貼上。

### 2. URL 格式調整

- ChatGPT：`https://chatgpt.com/?hints=search&q=...`
- Perplexity：`https://www.perplexity.ai/search?q=...&focus=internet`
- Grok：`https://grok.com/?q=...`
- Gemini：仍採「複製 prompt + 開啟 Gemini」；不嘗試 URL 預填。

### 3. 查證工具區塊簡化

將詳解區原本的：

- 標題「查證工具」
- 文字「搜尋此題顯示本題查證重點；AI 按鈕會複製查證 prompt、暫停計時並外開頁面。」

改成只保留按鈕列與小字：

> AI 按鈕會複製查證 prompt、暫停計時並外開頁面。

## 驗證

已執行：

```powershell
node --check app.js
```

結果：通過。

## 注意

AI 網站的 URL query 預填不是所有平台都有正式穩定文件支援，因此仍保留剪貼簿備援流程。若某平台改版，使用者可直接貼上已複製的完整 prompt。
