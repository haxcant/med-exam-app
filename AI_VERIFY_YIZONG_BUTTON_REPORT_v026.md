# v0.1.26 AI 查證工具：新增醫宗金鑑來源按鈕

## 修改目的

在既有「搜尋此題 / GPT / Gemini / Perp / Grok」工具列中，新增一個簡短的「醫宗」按鈕，讓金匱題可直接外開該題在醫宗金鑑《金匱要略註》校刊網頁的來源。

## 修改檔案

- `app.js`
- `index.html`
- `service-worker.js`

未修改：

- `med_questions.js`
- Firebase 相關檔案
- admin 相關檔案
- Firestore rules

## 新增行為

### 1. 作答畫面題目下方

在「搜尋此題」右側新增：

```text
醫宗
```

按下後會：

1. 自動暫停目前作答計時。
2. 讀取該題 `source.webReferences` 中的醫宗金鑑網址。
3. 外開對應醫宗金鑑網頁。
4. 若瀏覽器阻擋外開，會嘗試將網址複製到剪貼簿。

### 2. 作答後詳解區

在詳解區工具列同樣新增「醫宗」按鈕，方便作答後直接看來源。

## 來源讀取邏輯

優先順序：

1. `question.source.webReferences` 中含有「醫宗金鑑」或 `tchaa.uncma.com.tw/u5/book12/` 的項目。
2. `question.explanation` 中「醫宗金鑑網頁來源：...」的網址。
3. 若上述都沒有，才退回到第一個可用外部 URL。

目前 v0.1.21 之後的 `med_questions.js` 每題理論上已有醫宗金鑑來源，因此多數金匱題都能直接開啟。

## 驗證

已執行：

```powershell
node --check app.js
```

結果：通過。

## 上線建議

建議用 cache busting 測試：

```text
https://你的GitHub帳號.github.io/med-exam-app/index.html?v=026
```

測試題目建議：

- JGYL-0001 栝蔞桂枝湯
- JGYL-0038 射干麻黃湯
- JGYL-0127 赤小豆當歸散
- JGYL-0199 膏髮煎
