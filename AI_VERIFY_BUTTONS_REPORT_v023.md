# v0.1.23 AI 查證外跳按鈕修正版

## 修改檔案

- `app.js`
- `index.html`
- `service-worker.js`

未修改：`med_questions.js`、Firebase 相關檔案、Firestore rules、admin 檔案與資料結構。

## 重點修正

1. 在作答畫面與詳解區的搜尋工具旁新增簡短 AI 查證按鈕：`GPT`、`Gemini`、`Perp`。
2. 點擊 AI 查證時會先暫停目前作答倒數或自動跳題倒數。
3. 會自動產生完整查證 prompt 並嘗試複製到剪貼簿。
4. Gemini 改為「複製 prompt + 開啟 Gemini 首頁」模式，不再依賴不穩定的 URL 預填。
5. prompt 不再帶入本系統既有 `explanation`，避免既有註解誘導其他 AI。
6. prompt 只帶入題目 ID、題幹、選項、題庫暫定答案、來源線索與醫宗金鑑等 URL，並明確要求 AI 不可預設暫定答案正確。
7. prompt 加入 14 點中醫／國文／方劑查證格式：正確答案、原文定位、詞句註釋、白話翻譯、辨證要點、病機、方子性質、治法、方義、類方鑑別、記憶點、可疑錯誤、參考來源、考試筆記。

## 測試

已執行：

```powershell
node --check app.js
```

語法通過。

## 使用提醒

ChatGPT / Perplexity 可能可透過 URL 帶入查證 prompt，但平台規格可能改變；因此本版一律先複製 prompt 作為保險。Gemini Web 對 URL 預填支援不穩定，本版只開啟 Gemini 頁面，使用者需手動貼上已複製內容。
