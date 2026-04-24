# CHANGELOG

## v0.1.1 - 2026-04-24

- 依本地版本 `med-exam-app042401.zip` 續改。
- 保留舊駕訓班與路考模組檔案，但首頁預設隱藏並停止載入路考腳本。
- 新增 `med_questions.js`，共 199 題。
- 題型方向：PDF 方名作為答案選項，條文挖空作為題幹。
- 主畫面文字改為醫學考試題庫。
- Service Worker cache bump 至 `med-exam-app-v0.1.1`。
- Firebase Firestore path 已分離至 `apps/med-exam-app/users/{uid}/...`。
- Manifest 描述改為醫學題庫用途。
