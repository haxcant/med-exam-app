# v0.1.24 AI 查證與搜尋修正報告

## 修改範圍

本 patch 只修改：

- `app.js`
- `index.html`
- `service-worker.js`
- `AI_VERIFY_SEARCH_FIX_REPORT_v024.md`

未修改：

- `med_questions.js`
- Firebase / Firestore / admin / 錯題本 / 同步邏輯

## 修正內容

### 1. 修正「搜尋此題」殘留駕駛人手冊字眼

原本 `buildQuestionSearchQuery()` 會無條件加入：

```js
駕駛人手冊
```

導致金匱題搜尋時出現不相關字串。新版改成依題型判斷：

- 金匱題：加入 `金匱要略 醫宗金鑑 方證 白話註解`
- 交通題：才加入 `駕駛人手冊`
- 其他題：加入 `醫學考試 題庫 查證`

### 2. 增加 AI 查證按鈕

在「搜尋此題」右側增加簡短按鈕：

- `GPT`
- `Gemini`
- `Perp`
- `Grok`

作答區與詳解區都會出現。

### 3. 外跳時自動暫停計時

點擊任一 AI 查證按鈕時，若正在倒數，會先呼叫 `pauseActiveTimer()` 暫停計時。

### 4. 避免既有註解注入外部 AI

AI 查證 prompt 不帶入目前題庫既有 `explanation`，避免外部 AI 被本系統註解誘導。

帶入內容只包含：

- 題目 ID
- 分類
- 題幹／原文
- 選項
- 題庫暫定答案
- 題庫來源與網頁來源線索

並要求外部 AI 主動上網查證，不可預設答案正確。

### 5. 加入 14 點查證要求

prompt 要求外部 AI 回答：

1. 正確答案判定
2. 原文定位與版本校對
3. 詞句註釋
4. 白話翻譯
5. 辨證要點
6. 病機
7. 方子性質
8. 治法
9. 方義與藥物組成
10. 類方鑑別
11. 關鍵字記憶點
12. 可疑錯誤／需人工審閱處
13. 參考來源
14. 簡短考試筆記

### 6. Gemini / Grok 採「複製 prompt + 開頁」

Gemini 與 Grok 不保證可透過 URL 穩定預填 prompt，所以新版會：

1. 複製完整 prompt 到剪貼簿
2. 開啟 Gemini / Grok 頁面
3. 提醒使用者貼上 prompt

ChatGPT 與 Perplexity 會在 prompt 不過長時嘗試用 URL query 帶入；若過長則同樣退回「複製 + 開頁」。

## 驗證

已執行：

```powershell
node --check app.js
```

結果：語法通過。
