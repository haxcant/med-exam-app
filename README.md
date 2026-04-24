# med-exam-app

醫學考試題庫 PWA scaffold。

## v0.1.1

- 主題庫改為 `med_questions.js`。
- 以《金匱要略純條文整理100-111.pdf》抽取方名作為答案選項，原條文挖空作為題幹；目前內建 199 題。
- 舊駕訓班／路考相關檔案仍保留在專案內，但預設不載入、不顯示。
- localStorage namespace 使用 `med-exam-*`。
- Firebase Firestore namespace 使用 `apps/med-exam-app/users/{uid}/...`。
- Service Worker cache name: `med-exam-app-v0.1.1`。

## GitHub Pages

建議部署於：

```text
https://<你的帳號>.github.io/med-exam-app/
```

## 注意

目前 PDF 題庫抽取採規則式處理：優先抓取「X主之」、「可與X」、「宜X」、「X以溫之」等方名結構。若日後要精準使用 PDF 的所有粗體／框線文字，需要進一步做字型或版面標記解析。
