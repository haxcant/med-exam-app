# Driver Quiz Current Baseline (2026-04-13)

這份資料夾是目前完整可覆蓋基底，不是 patch 鏈。

## 主要前端檔案
- `index.html`：頁面骨架
- `styles.css`：樣式
- `app.js`：筆試主流程
- `road-test-sim.js`：路考模擬與字幕接龍
- `road_test_reference_data.js`：路考題庫來源
- `service-worker.js`：PWA 快取

## 本次整理重點
- 保留目前可用的四選一路考影片考試
- 字幕接龍改為直接共用同一題庫，不再額外切另一套資料
- 修正字幕接龍上一題/下一題/隨機一題切換後的顯示與累積
- 目前這一步移到接龍輔助影片下面

## 建議後續規則
1. 後續若再修改，優先以這份完整基底繼續改
2. 小修可 patch，但關鍵節點請重新輸出完整 zip
3. 若要回溯，請直接指定完整 zip 檔名
