# v055 Cloud Merge / UI Text Fix Report

## 修正目標

依使用者回報修正三類問題：

1. 方劑精靈結果卡文案過於刻意。
2. 雲端下載合併後，本機累計作答數可能低於雲端，導致再按上傳仍出現「本機資料少於雲端」警告。
3. 使用者登入雲端後，應自動展開一次雲端同步面板，方便判斷要上傳或下載合併。

## 主要修改

### 1. 方劑精靈文案調整

檔案：`formula_genie_matcher.js`

- `展示算法優勢` 改為 `判斷依據摘要`
- `exact/self-stem` 改為 `題幹命中`
- `若差距小，展示時可強調系統會提出補問而非硬猜。` 改為 `若差距小，展示時系統會提出補問資訊而非建議硬猜。`

### 2. 雲端合併不再讓統計倒退

檔案：`app.js`, `memory-bridge.js`

舊版合併同一題時，會依保守策略挑本機或雲端其中一整筆紀錄。若本機該題錯很多、雲端該題作答次數較多，合併可能選到本機低分紀錄，導致 `totalSeen` 從雲端 44 題降到本機 29 題一類的現象。

v055 改為：

- 同一題合併時，`totalSeen / totalCorrect / totalWrong` 取兩側較大值。
- 錯題狀態與 score 仍採保守策略，避免弱點被雲端較高分沖淡。
- 不同題目仍取聯集。
- 合併後重新計算 `progress.meta.totalAnswered`。

因此雲端下載合併後，題目統計不應再出現明顯倒退。

### 3. 已合併過的雲端 checksum 不再觸發少量資料警告

檔案：`app.js`, `memory-bridge.js`, `firebase-ui.js`, `firebase-backup.js`

- 合併雲端下載資料時，會把雲端 checksum 記入 `progress.meta.mergedCloudChecksums`。
- 若本機已合併目前雲端 checksum，即使本機累計作答次數仍低於雲端，也不再提示「可能覆蓋刪除雲端記憶」。
- 這是為了避免使用者剛下載合併後，再按上傳仍被誤警告。

### 4. 雲端同步面板登入後自動展開一次

檔案：`firebase-ui.js`

- 登入且同步權限核准後，自動展開 `firebaseSyncDetails` 一次。
- 顯示雲端與本機大略作答次數／已記錄題數。
- 若偵測雲端資料較多，提示先下載合併。
- 使用 `sessionStorage` 控制同一瀏覽器 session 不反覆展開。

### 5. 雲端統計顯示更清楚

檔案：`firebase-backup.js`, `firebase-ui.js`

- 新增 `touchedQuestionCount`，區分「累計作答次數」與「已記錄題數」。
- 上傳 meta 會包含 `answeredCount` 與 `touchedQuestionCount`。
- 舊雲端資料若沒有 `touchedQuestionCount`，仍可使用 `answeredCount` fallback。

### 6. 快取版本更新

檔案：`index.html`, `service-worker.js`, `firebase-ui.js`

- 更新 app / matcher / firebase-ui query string 至 `20260505v055`。
- Firebase module import query string 更新至 `20260505med055`。
- Service Worker cache name 更新至 `med-exam-app-v0.1.55-cloud-merge-guard-text-fix`。

## 驗證

已執行：

```bash
node --check admin.js
node --check app.js
node --check formula_genie_matcher.js
node --check formula_genie_data.js
node --check med_questions.js
node --check service-worker.js
node --check firebase-ui.js
node --check firebase-backup.js
node --check memory-bridge.js
python3 tests/question_bank_check.py
node tools/cloud_upload_guard_smoke_v054.js
node tools/session_discard_incomplete_smoke_v054.js
node tools/cloud_merge_guard_smoke_v055.js
node tools/formula_genie_ranker_smoke_v048.js
node tools/formula_genie_self_stem_eval_v049.js
node tools/formula_genie_generalization_eval_v050.js
```

結果：通過。

## 注意

這版沒有改 Firestore Rules；只改前端資料合併、警告判斷與顯示文案。部署 GitHub Pages 即可生效，但 Safari / iOS 使用者可能需要重新整理或按「清快取並重新載入」避免吃舊 Service Worker。
