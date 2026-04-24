# v0.1.5

- 統一主要按鈕命名，明確區分「本機檔案備份」與「雲端同步」。
- 將「匯出完整記憶」改為「匯出本機完整記憶備份」。
- 將「匯入學習檔案」改為「匯入本機備份／錯題檔」。
- 將雲端同步按鈕改為「上傳本機記憶到雲端」與「下載雲端記憶到本機」。
- 使用說明新增按鈕用途速查，提醒錯題本 JSON / 列印版可交給 GPT、NotebookLM 等 AI 做筆記整理。
- Service Worker cache bump 至 `med-exam-app-v0.1.5`。

# v0.1.4

- 將「下載本輪錯題（列印版）」改為「下載全部錯題本（列印版）」。
- 強化錯題 JSON / 錯題列印 HTML 匯入相容性，支援較鬆散的 wrong items envelope，並用題目 id / 題幹 / 答案嘗試對應目前題庫。
- 說明區新增 Chrome 相容性建議。
- 雲端下載套用成功後自動刷新一次，並提示若數據未更新可手動刷新。
- 說明區提示可將錯題檔交給 GPT / NotebookLM 等 AI 工具整理筆記。

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
