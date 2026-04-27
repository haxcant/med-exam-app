# MED-EXAM 方劑精靈 Patch v0.1.45-formula-genie

## 目的

在 MED-EXAM 首頁新增一個可收納的「方劑精靈」區塊，區塊邏輯只取自 `formula_genie_game_v022190427_v5_8_rebuild_verified` 的「三、普通權重題幹資料庫匹配」。

本 patch **沒有**搬入 v5_8 的 Akinator 手動互動、全題庫自動批跑、選擇題流程或其他功能。

## 新增／修改檔案

覆蓋到 `med-exam-app/` 根目錄：

- `index.html`：新增可收納「方劑精靈」區塊，並載入外掛腳本。
- `index_fixed.html`：更新跳轉版本參數。
- `styles.css`：新增並修正方劑精靈 UI 樣式，使其沿用目前主題變數，避免字色與框色混在一起。
- `app.js`：只更新版本文字，主刷題邏輯未改。
- `service-worker.js`：更新 cache name 與必要資產版本，避免舊快取吃不到新檔。
- `formula_genie_matcher.js`：抽出的普通權重題幹資料庫匹配外掛；結果頁已加入「抽取特徵前 5 個預設顯示，其餘收納」與「第 6 名後候選收納」。
- `formula_genie_data.js`：v5_8 原資料 `formula_vector_weights_v016.js`，保留其 `window.FORMULA_VECTOR_WEIGHTS_V015` 名稱。
- `assets/formula-genie.svg`：更新後的神秘風格精靈備用圖示；頁面主要使用 inline SVG 以便跟隨目前主題配色。

## 使用方式

1. 將 patch zip 解壓後，內容覆蓋到你的 `med-exam-app/` 專案根目錄。
2. 用 Chrome 開啟 `index.html`。
3. 展開「方劑精靈」。
4. 輸入症狀／方證敘述後按「揣測方劑」。

## 驗證重點

- 首頁應看到可收納的「方劑精靈」區塊。
- 未展開前不會載入 8.5 MB 的方劑資料；展開或按「揣測方劑」後才 lazy-load。
- 主刷題功能、錯題本、Firebase 同步不應因本外掛而改變。
- 若部署到 GitHub Pages 後看不到更新，請 hard refresh，或清除該站快取／Service Worker 後重開。

## 限制

此功能是題庫相似度檢索，不是臨床診斷或處方建議。分數只代表輸入敘述與目前題庫特徵之接近度；資料庫本身若有題幹、方名或權重偏差，輸出也會跟著偏。


## v0.1.45 修正重點

- 刪除「不包含 Akinator 選擇題互動與批跑功能」的前台說明文字。
- 將方劑精靈描述縮短為「輸入症狀或方證，快速比對相近方劑。」
- 方劑精靈區塊改用 MED-EXAM 既有主題變數配色。
- 圖示改成較神秘的 inline SVG，會隨目前主題色變化。
- 抽取特徵預設只顯示前 5 個，其餘用收納按鈕展開。
- 候選結果若超過 5 個，第 6 名以後預設收納。
