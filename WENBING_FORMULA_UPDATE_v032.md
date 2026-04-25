# med-exam-app v0.1.32 檢查報告

## 新增
- 新增第三個同級題庫：溫病條文題庫
- 題數：137 題
- 題目顯示：標題 + 題幹
- 答案：方劑
- 分層與證型／條目：已放入 source 與 explanation

## 題庫數量
- 金匱條文填空：199 題
- 中醫內科方劑題庫：277 題
- 溫病條文題庫：137 題
- 全部題庫：613 題

## 檢查
- med_questions.js 可解析為有效題庫陣列
- 所有 text_choice 題目至少有 2 個選項，且選項包含正確答案
- 三題庫 scope 過濾可分別取得正確題數
- index.html 已加入溫病條文題庫選項
- app.js 已加入 wenbing_formula 分類、scope、來源顯示
- service-worker.js 快取版本已更新為 med-exam-app-v0.1.32
- cache busting 已更新為 20260425fix32
- app.js、med_questions.js、memory-bridge.js、service-worker.js、firebase-ui.js、firebase-backup.js 通過 node --check
- 本機完整匯出／匯入與雲端備份使用 progress.byQuestion 與 settings.examScope，不限定特定題庫；新增 WBTF-* 題目會隨同進度一起保存與還原
