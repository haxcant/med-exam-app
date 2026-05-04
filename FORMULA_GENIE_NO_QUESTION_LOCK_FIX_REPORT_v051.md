# v051 出題卡住防呆修正報告

## 問題判斷

收到「用戶回報會卡住沒辦法做題目」後，檢查 v050 的題庫資料與前端啟動流程。題庫本身未發現缺題、答案不在選項內或 scope 數量異常：總題數 813，金匱 199，中醫內科 277，溫病 137，衛福部 200。

比較可能造成使用者誤以為卡住的高風險點有兩個：

1. 某些內建瀏覽器／WebView 對 `navigator.serviceWorker` 支援不完整時，原本 `registerPWA()` 可能因 service worker 註冊例外而讓啟動狀態被判定失敗。
2. 使用者本機保留舊的積分篩選、日期篩選或其他暫時設定時，可能把目前範圍題池篩到 0 題，按「開始練習」後只能看到無題提示，體感像卡住。

## 已修正

### 1. Service Worker 註冊改為非阻塞

`registerPWA()` 現在會檢查 `navigator.serviceWorker` 與 `register` 是否真的可用，並以 `try/catch` 包住。即使瀏覽器不支援或註冊失敗，也不會影響主程式啟動與做題。

### 2. 題池為 0 時自動解除暫時篩選

一般練習／模擬考若因積分篩選或最後複習日篩選造成題池為 0，但原始範圍其實有題目，系統會自動取消暫時篩選，並開始出題。

保留原行為的情境：

- 只練錯題但沒有錯題：仍提示目前沒有錯題。
- SRS 到期但沒有到期題：仍提示切換模式或取消日期篩選。
- 指定範圍／分類本身真的沒有題：仍提示無題。

### 3. 顯示自動修復提示

若系統自動取消積分／日期篩選，題目上方會顯示提示：

> 原本的積分／日期篩選沒有可用題目，已自動取消暫時篩選並開始一般練習。

### 4. 更新快取版本

更新 index、script query string 與 service-worker cache name：

- `20260504fgv4`
- `med-exam-app-v0.1.51-no-question-lock-guard`

避免使用者繼續吃到舊版 app.js / med_questions.js。

## 驗證

已執行：

```bash
node --check app.js
node --check service-worker.js
node --check formula_genie_matcher.js
node --check formula_genie_data.js
node --check med_questions.js
python3 tests/question_bank_check.py
node tools/formula_genie_ranker_smoke_v048.js
node tools/formula_genie_self_stem_eval_v049.js
node tools/formula_genie_generalization_eval_v050.js
```

另外用最小 DOM mock 驗證：

- 主程式可初始化，`__MED_EXAM_APP_READY = true`
- 預設按「開始練習」可建立 20 題 session
- 模擬舊設定：積分 `< -999` 且日期篩選到 2000-01-01，仍可自動解除暫時篩選並建立 20 題 session

## 備註

這版沒有改動方劑精靈泛化算法本體，也沒有更動 813 題題庫內容；主要是修啟動與出題流程的防卡邏輯。
